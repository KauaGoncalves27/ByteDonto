from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

consultas_bp = Blueprint("consultas", __name__)


@consultas_bp.route("/", methods=["GET"])
def listar_consultas():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)

        query = (
            supabase.table("atendimentos")
            .select("*, pacientes(nome), dentista:usuarios(nome)")
            .eq("clinica_id", clinica_id)
            .order("data_agendada")
        )

        paciente_id = request.args.get("paciente_id")
        if paciente_id:
            query = query.eq("paciente_id", paciente_id)

        result = query.execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@consultas_bp.route("/", methods=["POST"])
def agendar_consulta():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        paciente_id = data.get("paciente_id")
        data_agendada = data.get("data_agendada")

        if not paciente_id or not data_agendada:
            return jsonify({"error": "paciente_id e data_agendada são obrigatórios"}), 400

        # Verifica que o paciente pertence à mesma clínica
        paciente_check = (
            supabase.table("pacientes")
            .select("id")
            .eq("id", paciente_id)
            .eq("clinica_id", clinica_id)
            .single()
            .execute()
        )
        if not paciente_check.data:
            return jsonify({"error": "Paciente não encontrado nesta clínica"}), 404

        novo_atendimento = {
            "clinica_id": clinica_id,
            "paciente_id": paciente_id,
            "dentista_id": data.get("dentista_id"),
            "data_agendada": data_agendada,
            "procedimentos_descritos": data.get("procedimentos_descritos"),
            "tipo_atendimento": data.get("tipo_atendimento"),
            "status": data.get("status", "Agendado"),
        }
        novo_atendimento = {k: v for k, v in novo_atendimento.items() if v is not None}

        result = supabase.table("atendimentos").insert(novo_atendimento).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@consultas_bp.route("/<consulta_id>", methods=["PUT"])
def atualizar_consulta(consulta_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        CAMPOS_PERMITIDOS = {"evolucao_clinica", "status", "procedimentos_descritos", "tipo_atendimento"}
        payload = {k: v for k, v in data.items() if k in CAMPOS_PERMITIDOS}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        check = (
            supabase.table("atendimentos")
            .select("id")
            .eq("id", consulta_id)
            .eq("clinica_id", clinica_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Atendimento não encontrado"}), 404

        result = (
            supabase.table("atendimentos")
            .update(payload)
            .eq("id", consulta_id)
            .eq("clinica_id", clinica_id)
            .execute()
        )
        return jsonify(result.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@consultas_bp.route("/<consulta_id>", methods=["DELETE"])
def cancelar_consulta(consulta_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)

        check = (
            supabase.table("atendimentos")
            .select("id")
            .eq("id", consulta_id)
            .eq("clinica_id", clinica_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Atendimento não encontrado"}), 404

        supabase.table("atendimentos").update({"status": "Cancelado"}).eq("id", consulta_id).eq("clinica_id", clinica_id).execute()
        return jsonify({"message": "Consulta cancelada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

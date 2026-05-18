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
        _, clinic_id = get_user_clinica(token)

        query = (
            supabase.table("consultations")
            .select("*, patients(name), specialist:users(name)")
            .eq("clinic_id", clinic_id)
            .order("consultation_date")
        )

        patient_id = request.args.get("patient_id") or request.args.get("paciente_id")
        if patient_id:
            query = query.eq("patient_id", patient_id)

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
        user_id, clinic_id = get_user_clinica(token)
        data = request.get_json()

        patient_id = data.get("patient_id") or data.get("paciente_id")
        consultation_date = data.get("consultation_date") or data.get("data_agendada")

        if not patient_id or not consultation_date:
            return jsonify({"error": "patient_id e consultation_date são obrigatórios"}), 400

        patient_check = (
            supabase.table("patients")
            .select("id")
            .eq("id", patient_id)
            .eq("clinic_id", clinic_id)
            .single()
            .execute()
        )
        if not patient_check.data:
            return jsonify({"error": "Paciente não encontrado nesta clínica"}), 404

        nova_consulta = {
            "clinic_id": clinic_id,
            "create_id": user_id,
            "patient_id": patient_id,
            "specialist_id": data.get("specialist_id") or data.get("dentista_id"),
            "consultation_date": consultation_date,
            "reason_complaint": data.get("reason_complaint") or data.get("procedimentos_descritos") or data.get("motivo"),
            "status": data.get("status", "Agendado"),
        }
        nova_consulta = {k: v for k, v in nova_consulta.items() if v is not None}

        result = supabase.table("consultations").insert(nova_consulta).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@consultas_bp.route("/<consulta_id>", methods=["PUT"])
def atualizar_consulta(consulta_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        data = request.get_json()

        CAMPOS_PERMITIDOS = {"reason_complaint", "status", "start_time", "end_time"}
        payload = {k: v for k, v in data.items() if k in CAMPOS_PERMITIDOS}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        check = (
            supabase.table("consultations")
            .select("id")
            .eq("id", consulta_id)
            .eq("clinic_id", clinic_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Consulta não encontrada"}), 404

        result = (
            supabase.table("consultations")
            .update(payload)
            .eq("id", consulta_id)
            .eq("clinic_id", clinic_id)
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
        _, clinic_id = get_user_clinica(token)

        check = (
            supabase.table("consultations")
            .select("id")
            .eq("id", consulta_id)
            .eq("clinic_id", clinic_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Consulta não encontrada"}), 404

        supabase.table("consultations").update({"status": "Cancelado"}).eq("id", consulta_id).eq("clinic_id", clinic_id).execute()
        return jsonify({"message": "Consulta cancelada"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

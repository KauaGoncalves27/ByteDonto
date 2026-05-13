from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

pacientes_bp = Blueprint("pacientes", __name__)

CAMPOS_PACIENTE = {
    "nome", "email", "telefone_whatsapp", "data_nascimento",
    "cpf", "rg", "genero", "endereco", "anamnese"
}


@pacientes_bp.route("/", methods=["GET"])
def listar_pacientes():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        result = supabase.table("pacientes").select("*").eq("clinica_id", clinica_id).order("created_at", desc=True).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/<paciente_id>", methods=["GET"])
def obter_paciente(paciente_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        result = supabase.table("pacientes").select("*").eq("id", paciente_id).eq("clinica_id", clinica_id).single().execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/", methods=["POST"])
def criar_paciente():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        nome = (data.get("nome") or "").strip()
        if not nome:
            return jsonify({"error": "Nome do paciente é obrigatório"}), 400

        novo = {
            "clinica_id": clinica_id,
            "nome": nome,
            "email": data.get("email"),
            "telefone_whatsapp": data.get("telefone_whatsapp"),
            "data_nascimento": data.get("data_nascimento"),
            "cpf": data.get("cpf"),
            "rg": data.get("rg"),
            "genero": data.get("genero"),
            "endereco": data.get("endereco", {}),
            "anamnese": data.get("anamnese", {})
        }

        result = supabase.table("pacientes").insert(novo).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/<paciente_id>", methods=["PUT"])
def atualizar_paciente(paciente_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        # Whitelist de campos para impedir atualização de id, clinica_id, etc.
        payload = {k: v for k, v in data.items() if k in CAMPOS_PACIENTE}
        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        result = (
            supabase.table("pacientes")
            .update(payload)
            .eq("id", paciente_id)
            .eq("clinica_id", clinica_id)
            .execute()
        )
        if not result.data:
            return jsonify({"error": "Paciente não encontrado"}), 404
        return jsonify(result.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/<paciente_id>", methods=["DELETE"])
def deletar_paciente(paciente_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        supabase.table("pacientes").delete().eq("id", paciente_id).eq("clinica_id", clinica_id).execute()
        return jsonify({"message": "Paciente removido"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

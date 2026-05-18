from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

pacientes_bp = Blueprint("pacientes", __name__)

CAMPOS_PACIENTE = {
    "name", "email", "whatsapp", "phone_number", "data_birth",
    "cpf", "rg", "gender", "address", "city", "states", "country",
    "emergency_name", "emergency_phone",
    "known_allergias", "systemic_conditions", "continuous_medications",
    "drug_use", "surgeries_history", "status"
}


@pacientes_bp.route("/", methods=["GET"])
def listar_pacientes():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        result = supabase.table("patients").select("*").eq("clinic_id", clinic_id).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/<paciente_id>", methods=["GET"])
def obter_paciente(paciente_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        result = supabase.table("patients").select("*").eq("id", paciente_id).eq("clinic_id", clinic_id).single().execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/", methods=["POST"])
def criar_paciente():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        user_id, clinic_id = get_user_clinica(token)
        data = request.get_json()

        name = (data.get("name") or data.get("nome") or "").strip()
        if not name:
            return jsonify({"error": "Nome do paciente é obrigatório"}), 400

        novo = {
            "clinic_id": clinic_id,
            "user_id": user_id,
            "name": name,
            "email": data.get("email"),
            "whatsapp": data.get("whatsapp") or data.get("telefone_whatsapp"),
            "phone_number": data.get("phone_number"),
            "data_birth": data.get("data_birth") or data.get("data_nascimento"),
            "cpf": data.get("cpf"),
            "rg": data.get("rg"),
            "gender": data.get("gender") or data.get("genero"),
            "address": data.get("address"),
            "city": data.get("city"),
            "states": data.get("states"),
            "country": data.get("country"),
            "emergency_name": data.get("emergency_name"),
            "emergency_phone": data.get("emergency_phone"),
            "known_allergias": data.get("known_allergias"),
            "systemic_conditions": data.get("systemic_conditions"),
            "continuous_medications": data.get("continuous_medications"),
            "drug_use": data.get("drug_use"),
            "surgeries_history": data.get("surgeries_history"),
        }
        novo = {k: v for k, v in novo.items() if v is not None}

        result = supabase.table("patients").insert(novo).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@pacientes_bp.route("/<paciente_id>", methods=["PUT"])
def atualizar_paciente(paciente_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        data = request.get_json()

        payload = {k: v for k, v in data.items() if k in CAMPOS_PACIENTE}
        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        result = (
            supabase.table("patients")
            .update(payload)
            .eq("id", paciente_id)
            .eq("clinic_id", clinic_id)
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
        _, clinic_id = get_user_clinica(token)
        supabase.table("patients").delete().eq("id", paciente_id).eq("clinic_id", clinic_id).execute()
        return jsonify({"message": "Paciente removido"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

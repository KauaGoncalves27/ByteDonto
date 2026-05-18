from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

clinicas_bp = Blueprint("clinicas", __name__)

CAMPOS_CLINICA = {
    "name", "cnpj", "company_name", "summary",
    "phone_number", "whatsapp", "instagram", "facebook",
    "address", "city", "states", "country"
}


@clinicas_bp.route("/", methods=["POST"])
def criar_clinica():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id

        data = request.get_json()

        payload = {k: v for k, v in data.items() if k in CAMPOS_CLINICA}
        payload["owner_id"] = user_id

        result_clinica = supabase.table("clinics").insert(payload).execute()
        nova_clinica_id = result_clinica.data[0]["id"]

        # Vincula o owner à clínica via tabela teams
        supabase.table("teams").insert({
            "user_id": user_id,
            "clinic_id": nova_clinica_id,
            "status": "active",
        }).execute()

        return jsonify(result_clinica.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clinicas_bp.route("/", methods=["GET"])
def listar_clinicas():
    """Retorna a clínica do usuário autenticado."""
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id

        # Busca clinic_id via teams
        team = supabase.table("teams").select("clinic_id").eq("user_id", user_id).execute()
        clinic_id = team.data[0].get("clinic_id") if team.data else None

        if not clinic_id:
            return jsonify([]), 200

        result = supabase.table("clinics").select("*").eq("id", clinic_id).execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clinicas_bp.route("/<clinica_id>", methods=["GET"])
def get_clinica(clinica_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, user_clinica_id = get_user_clinica(token)

        if clinica_id != user_clinica_id:
            return jsonify({"error": "Acesso não autorizado a esta clínica"}), 403

        result = supabase.table("clinics").select("*").eq("id", clinica_id).single().execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clinicas_bp.route("/<clinica_id>", methods=["DELETE"])
def deletar_clinica(clinica_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, user_clinica_id = get_user_clinica(token)

        if clinica_id != user_clinica_id:
            return jsonify({"error": "Acesso não autorizado a esta clínica"}), 403

        # Remove vínculos na tabela teams antes de deletar a clínica
        supabase.table("teams").delete().eq("clinic_id", clinica_id).execute()

        supabase.table("clinics").delete().eq("id", clinica_id).execute()

        return jsonify({"message": "Clínica removida com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@clinicas_bp.route("/<clinica_id>", methods=["PUT"])
def atualizar_clinica(clinica_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, user_clinica_id = get_user_clinica(token)

        if clinica_id != user_clinica_id:
            return jsonify({"error": "Acesso não autorizado a esta clínica"}), 403

        data = request.get_json()
        payload = {k: v for k, v in data.items() if k in CAMPOS_CLINICA}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        result = (
            supabase.table("clinics")
            .update(payload)
            .eq("id", clinica_id)
            .execute()
        )
        return jsonify(result.data[0] if result.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

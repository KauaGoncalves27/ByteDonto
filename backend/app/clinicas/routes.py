from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

clinicas_bp = Blueprint("clinicas", __name__)

CAMPOS_CLINICA = {
    "nome", "nome_fantasia", "cnpj", "razao_social", "resumo",
    "telefone", "whatsapp", "instagram", "facebook",
    "endereco", "cidade", "estado", "pais", "cep"
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

        # Whitelist de campos permitidos e sempre define dono_id a partir do token
        payload = {k: v for k, v in data.items() if k in CAMPOS_CLINICA}
        payload["dono_id"] = user_id

        result_clinica = supabase.table("clinicas").insert(payload).execute()
        nova_clinica_id = result_clinica.data[0]["id"]

        supabase.table("usuarios").update({"clinica_id": nova_clinica_id}).eq("id", user_id).execute()

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

        perfil = supabase.table("usuarios").select("clinica_id").eq("id", user_id).single().execute()
        clinica_id = perfil.data.get("clinica_id") if perfil.data else None

        if not clinica_id:
            return jsonify([]), 200

        result = supabase.table("clinicas").select("*").eq("id", clinica_id).execute()
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

        # Garante que o usuário só acessa a própria clínica
        if clinica_id != user_clinica_id:
            return jsonify({"error": "Acesso não autorizado a esta clínica"}), 403

        result = supabase.table("clinicas").select("*").eq("id", clinica_id).single().execute()
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

        # Remove vínculo dos usuários antes de deletar a clínica
        supabase.table("usuarios").update({"clinica_id": None}).eq("clinica_id", clinica_id).execute()

        supabase.table("clinicas").delete().eq("id", clinica_id).execute()

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

        # Garante que o usuário só edita a própria clínica
        if clinica_id != user_clinica_id:
            return jsonify({"error": "Acesso não autorizado a esta clínica"}), 403

        data = request.get_json()
        payload = {k: v for k, v in data.items() if k in CAMPOS_CLINICA}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        result = (
            supabase.table("clinicas")
            .update(payload)
            .eq("id", clinica_id)
            .execute()
        )
        return jsonify(result.data[0] if result.data else {}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

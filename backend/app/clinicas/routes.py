from flask import Blueprint, request, jsonify
from app.database import supabase

clinicas_bp = Blueprint("clinicas", __name__)

def get_token(req):
    return req.headers.get("Authorization", "").replace("Bearer ", "")

@clinicas_bp.route("/", methods=["POST"])
def criar_clinica():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        user_response = supabase.auth.get_user(token)
        user_id = user_response.user.id
        
        data = request.get_json()
        
        # 1. Insert clinic into database
        result_clinica = supabase.table("clinicas").insert(data).execute()
        nova_clinica_id = result_clinica.data[0]["id"]
        
        # 2. Update the user's profile to link the new clinic
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
        result = supabase.table("clinicas").select("*").eq("id", clinica_id).single().execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@clinicas_bp.route("/<clinica_id>", methods=["PUT"])
def atualizar_clinica(clinica_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        data = request.get_json()
        
        # update directly
        result = (
            supabase.table("clinicas")
            .update(data)
            .eq("id", clinica_id)
            .execute()
        )
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

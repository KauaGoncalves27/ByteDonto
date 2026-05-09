from flask import Blueprint, request, jsonify
from supabase import create_client
from config import Config
from app.database import supabase

supabase_auth = create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)
supabase_admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

auth_bp = Blueprint("auth", __name__)


@auth_bp.route("/registro", methods=["POST"])
def registro():
    """
    Cria conta de proprietário.
    Body: { nome, email, password }
    Cria usuário no Supabase Auth + perfil na tabela usuarios com papel='Dono'.
    A clínica é criada separadamente após o registro.
    """
    data = request.get_json()
    nome = (data.get("nome") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()

    if not all([nome, email, password]):
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    if len(password) < 8:
        return jsonify({"error": "A senha deve ter no mínimo 8 caracteres"}), 400

    try:
        auth_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
        })

        novo_id = auth_response.user.id

        supabase_admin.table("usuarios").insert({
            "id": novo_id,
            "nome": nome,
            "papel": "Dono",
            "permissoes": {},
        }).execute()

        return jsonify({"message": "Conta criada com sucesso. Faça login para continuar."}), 201

    except Exception as e:
        error_msg = str(e)
        if "already been registered" in error_msg or "already registered" in error_msg:
            return jsonify({"error": "Este e-mail já está cadastrado"}), 409
        return jsonify({"error": error_msg}), 500


@auth_bp.route("/login", methods=["POST"])
def login():
    """
    Login via Supabase Auth.
    Body JSON: { "email": "...", "password": "..." }
    """
    data = request.get_json()
    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        return jsonify({"error": "Email e senha são obrigatórios"}), 400

    try:
        response = supabase_auth.auth.sign_in_with_password({
            "email": email,
            "password": password
        })

        user = response.user
        session = response.session

        return jsonify({
            "access_token": session.access_token,
            "user": {
                "id": user.id,
                "email": user.email,
            }
        }), 200

    except Exception as e:
        return jsonify({"error": "Credenciais inválidas", "detail": str(e)}), 401


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Logout — invalida o token no Supabase.
    Header: Authorization: Bearer <token>
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"error": "Token não fornecido"}), 401

    try:
        supabase.auth.sign_out()
        return jsonify({"message": "Logout realizado com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@auth_bp.route("/me", methods=["GET"])
def me():
    """
    Retorna dados do usuário autenticado.
    Header: Authorization: Bearer <token>
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"error": "Token não fornecido"}), 401

    try:
        user_response = supabase.auth.get_user(token)
        user = user_response.user

        # Buscar perfil do usuário na tabela usuarios
        perfil_response = supabase.table("usuarios").select("*").eq("id", user.id).execute()
        perfil_data = perfil_response.data[0] if perfil_response.data else None

        return jsonify({
            "id": user.id,
            "email": user.email,
            "perfil": perfil_data
        }), 200

    except Exception as e:
        return jsonify({"error": "Token inválido", "detail": str(e)}), 401

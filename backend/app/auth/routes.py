from flask import Blueprint, request, jsonify
from supabase import create_client
from config import Config
from app.database import supabase
from app.utils import PERMISSOES_PADRAO
import requests as http_requests

supabase_auth = create_client(Config.SUPABASE_URL, Config.SUPABASE_ANON_KEY)
supabase_admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

auth_bp = Blueprint("auth", __name__)

PAPEIS_VALIDOS = ["Dono", "Recepção", "Especialista"]

PAPEL_LABEL = {
    "Dono":       "proprietário",
    "Especialista": "especialista",
    "Recepção":   "funcionário de recepção",
}


def _buscar_usuario_auth_por_email(email):
    """Busca usuário no Supabase Auth pelo email via Admin REST API."""
    try:
        resp = http_requests.get(
            f"{Config.SUPABASE_URL}/auth/v1/admin/users",
            headers={
                "apikey": Config.SUPABASE_KEY,
                "Authorization": f"Bearer {Config.SUPABASE_KEY}",
            },
            params={"email": email, "per_page": 50},
            timeout=10,
        )
        if resp.status_code == 200:
            for u in resp.json().get("users", []):
                if u.get("email") == email:
                    return u
    except Exception:
        pass
    return None


@auth_bp.route("/registro", methods=["POST"])
def registro():
    """
    Cria conta de usuário.
    Body: { nome, email, password, papel }
    papel deve ser 'Dono', 'Recepção' ou 'Especialista'.

    Regras:
    - O mesmo email pode ter papéis diferentes (Dono e Especialista, por ex.)
    - O mesmo email NÃO pode ter o mesmo papel duas vezes
    - Requer a migration_multipapel.sql aplicada no banco para suporte completo
    """
    data = request.get_json()
    nome = (data.get("nome") or "").strip()
    email = (data.get("email") or "").strip()
    password = (data.get("password") or "").strip()
    papel = (data.get("papel") or "Dono").strip()

    if not all([nome, email, password]):
        return jsonify({"error": "Nome, email e senha são obrigatórios"}), 400

    if papel not in PAPEIS_VALIDOS:
        return jsonify({"error": f"Papel inválido. Use: {', '.join(PAPEIS_VALIDOS)}"}), 400

    if len(password) < 8:
        return jsonify({"error": "A senha deve ter no mínimo 8 caracteres"}), 400

    novo_id = None

    try:
        # Tenta criar usuário no Supabase Auth
        auth_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": password,
            "email_confirm": True,
        })
        novo_id = auth_response.user.id

    except Exception as auth_err:
        auth_error_msg = str(auth_err)
        if "already been registered" in auth_error_msg or "already registered" in auth_error_msg:
            # Email já existe no Auth — busca o ID do usuário existente
            existing = _buscar_usuario_auth_por_email(email)
            if not existing:
                return jsonify({"error": "Erro ao verificar conta existente. Tente novamente."}), 500
            novo_id = existing["id"]
        else:
            return jsonify({"error": auth_error_msg}), 500

    # Verifica se este email já tem ESTE papel específico
    perfil_existente = (
        supabase_admin.table("usuarios")
        .select("papel")
        .eq("id", novo_id)
        .eq("papel", papel)
        .execute()
    )
    if perfil_existente.data:
        label = PAPEL_LABEL.get(papel, papel)
        return jsonify({"error": f"Este e-mail já está cadastrado como {label}."}), 409

    # Cria o perfil na tabela usuarios com o novo papel
    try:
        supabase_admin.table("usuarios").insert({
            "id": novo_id,
            "nome": nome,
            "papel": papel,
            "permissoes": PERMISSOES_PADRAO.get(papel, {}),
        }).execute()

        return jsonify({"message": "Conta criada com sucesso. Faça login para continuar."}), 201

    except Exception as insert_err:
        # Provavelmente violação de PK (tabela não migrada ainda para multi-papel)
        perfil_atual = supabase_admin.table("usuarios").select("papel").eq("id", novo_id).execute()
        if perfil_atual.data:
            papeis = [PAPEL_LABEL.get(p["papel"], p["papel"]) for p in perfil_atual.data]
            papeis_str = " e ".join(papeis)
            return jsonify({
                "error": (
                    f"Este e-mail já está cadastrado no sistema como {papeis_str}. "
                    f"Para usar um novo perfil, aplique a migration_multipapel.sql no banco de dados."
                )
            }), 409
        return jsonify({"error": str(insert_err)}), 500


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
        error_msg = str(e)
        if "Invalid login credentials" in error_msg or "invalid_credentials" in error_msg:
            return jsonify({"error": "Email ou senha incorretos"}), 401
        if "Email not confirmed" in error_msg:
            return jsonify({"error": "E-mail não confirmado. Verifique sua caixa de entrada."}), 401
        return jsonify({"error": "Erro ao fazer login. Tente novamente."}), 500


@auth_bp.route("/logout", methods=["POST"])
def logout():
    """
    Logout — invalida o token do usuário no Supabase via admin API.
    Header: Authorization: Bearer <token>
    """
    token = request.headers.get("Authorization", "").replace("Bearer ", "")

    if not token:
        return jsonify({"error": "Token não fornecido"}), 401

    try:
        supabase_admin.auth.admin.sign_out(token)
    except Exception:
        pass  # Token pode já estar expirado; o frontend limpará de qualquer forma

    return jsonify({"message": "Logout realizado com sucesso"}), 200


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

        perfil_response = supabase.table("usuarios").select("*").eq("id", user.id).execute()
        perfil_data = perfil_response.data[0] if perfil_response.data else None

        return jsonify({
            "id": user.id,
            "email": user.email,
            "perfil": perfil_data
        }), 200

    except Exception as e:
        return jsonify({"error": "Token inválido", "detail": str(e)}), 401

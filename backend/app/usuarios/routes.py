from flask import Blueprint, request, jsonify
from supabase import create_client
from app.database import supabase
from app.utils import get_token, get_user_e_clinica, PERMISSOES_PADRAO
from config import Config

supabase_admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

usuarios_bp = Blueprint("usuarios", __name__)


@usuarios_bp.route("/", methods=["GET"])
def listar_equipe():
    """Lista todos os membros da clínica do proprietário autenticado."""
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id, _ = get_user_e_clinica(token)

        if not clinic_id:
            return jsonify([]), 200

        # Busca membros via tabela teams -> users
        teams_result = (
            supabase.table("teams")
            .select("user_id, status, users(id, name, roles, created_at)")
            .eq("clinic_id", clinic_id)
            .execute()
        )

        membros = []
        for t in teams_result.data:
            u = t.get("users") or {}
            membros.append({
                "id": u.get("id", t["user_id"]),
                "name": u.get("name"),
                "roles": u.get("roles"),
                "created_at": u.get("created_at"),
                "status": t.get("status"),
            })

        return jsonify(membros), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@usuarios_bp.route("/criar", methods=["POST"])
def criar_membro():
    """
    Proprietário cria conta para um membro da equipe.
    Body: { nome, email, senha, papel }
    Papéis válidos: 'Specialist', 'Employee'
    """
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id, roles_solicitante = get_user_e_clinica(token)

        if roles_solicitante != "Owner":
            return jsonify({"error": "Apenas o proprietário pode criar membros"}), 403

        data = request.get_json()
        nome = data.get("nome", "").strip()
        email = data.get("email", "").strip()
        senha = data.get("senha", "").strip()
        papel = data.get("papel", "").strip()

        if not all([nome, email, senha, papel]):
            return jsonify({"error": "Nome, email, senha e papel são obrigatórios"}), 400

        if papel not in ["Specialist", "Employee"]:
            return jsonify({"error": "Papel inválido. Use 'Specialist' ou 'Employee'"}), 400

        if len(senha) < 6:
            return jsonify({"error": "A senha deve ter no mínimo 6 caracteres"}), 400

        auth_response = supabase_admin.auth.admin.create_user({
            "email": email,
            "password": senha,
            "email_confirm": True
        })

        novo_usuario_id = auth_response.user.id

        supabase_admin.table("users").insert({
            "id": novo_usuario_id,
            "name": nome,
            "roles": papel,
        }).execute()

        supabase_admin.table("teams").insert({
            "user_id": novo_usuario_id,
            "clinic_id": clinic_id,
            "status": "active",
        }).execute()

        return jsonify({
            "message": f"Membro '{nome}' criado com sucesso",
            "id": novo_usuario_id,
            "name": nome,
            "email": email,
            "roles": papel,
        }), 201

    except Exception as e:
        error_msg = str(e)
        if "already been registered" in error_msg or "already registered" in error_msg:
            return jsonify({"error": "Este e-mail já está cadastrado no sistema"}), 409
        return jsonify({"error": error_msg}), 500


@usuarios_bp.route("/<usuario_id>", methods=["DELETE"])
def remover_membro(usuario_id):
    """Proprietário remove um membro da equipe."""
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        solicitante_id, clinic_id, roles_solicitante = get_user_e_clinica(token)

        if roles_solicitante != "Owner":
            return jsonify({"error": "Apenas o proprietário pode remover membros"}), 403

        if usuario_id == solicitante_id:
            return jsonify({"error": "Você não pode remover a si mesmo"}), 400

        membro_team = (
            supabase.table("teams")
            .select("clinic_id")
            .eq("user_id", usuario_id)
            .eq("clinic_id", clinic_id)
            .execute()
        )
        if not membro_team.data:
            return jsonify({"error": "Membro não encontrado nesta clínica"}), 404

        membro_user = (
            supabase.table("users")
            .select("roles")
            .eq("id", usuario_id)
            .single()
            .execute()
        )
        if membro_user.data and membro_user.data["roles"] == "Owner":
            return jsonify({"error": "Não é possível remover outro proprietário"}), 403

        supabase_admin.table("teams").delete().eq("user_id", usuario_id).eq("clinic_id", clinic_id).execute()
        supabase_admin.table("users").delete().eq("id", usuario_id).execute()
        supabase_admin.auth.admin.delete_user(usuario_id)

        return jsonify({"message": "Membro removido com sucesso"}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@usuarios_bp.route("/<usuario_id>", methods=["PUT"])
def atualizar_membro(usuario_id):
    """Proprietário atualiza nome ou papel de um membro."""
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id, roles_solicitante = get_user_e_clinica(token)

        if roles_solicitante != "Owner":
            return jsonify({"error": "Apenas o proprietário pode editar membros"}), 403

        membro_team = (
            supabase.table("teams")
            .select("clinic_id")
            .eq("user_id", usuario_id)
            .eq("clinic_id", clinic_id)
            .execute()
        )
        if not membro_team.data:
            return jsonify({"error": "Membro não encontrado nesta clínica"}), 404

        data = request.get_json()
        atualizacao = {}

        if "nome" in data:
            atualizacao["name"] = data["nome"].strip()

        novo_papel = data.get("papel")
        if novo_papel is not None:
            if novo_papel not in ["Specialist", "Employee"]:
                return jsonify({"error": "Papel inválido. Use 'Specialist' ou 'Employee'"}), 400
            atualizacao["roles"] = novo_papel

        if not atualizacao:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        result = supabase_admin.table("users").update(atualizacao).eq("id", usuario_id).execute()
        return jsonify(result.data[0]), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@usuarios_bp.route("/<usuario_id>/permissoes", methods=["GET"])
def get_permissoes(usuario_id):
    """Retorna as permissões de um membro. Acessível pelo Owner."""
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id, roles_solicitante = get_user_e_clinica(token)

        if roles_solicitante != "Owner":
            return jsonify({"error": "Apenas o proprietário pode ver permissões"}), 403

        membro = (
            supabase.table("users")
            .select("id, name, roles")
            .eq("id", usuario_id)
            .single()
            .execute()
        )
        if not membro.data:
            return jsonify({"error": "Membro não encontrado"}), 404

        return jsonify(membro.data), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500


@usuarios_bp.route("/<usuario_id>/permissoes", methods=["PATCH"])
def atualizar_permissoes(usuario_id):
    """
    Proprietário atualiza permissões individuais de um membro.
    Body: { "permissoes": { "ver_financeiro": true, ... } }
    """
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id, roles_solicitante = get_user_e_clinica(token)

        if roles_solicitante != "Owner":
            return jsonify({"error": "Apenas o proprietário pode alterar permissões"}), 403

        membro = (
            supabase.table("users")
            .select("id, roles")
            .eq("id", usuario_id)
            .single()
            .execute()
        )
        if not membro.data:
            return jsonify({"error": "Membro não encontrado"}), 404

        if membro.data["roles"] == "Owner":
            return jsonify({"error": "Permissões do proprietário não podem ser alteradas"}), 403

        data = request.get_json()
        novas = data.get("permissoes")
        if not isinstance(novas, dict):
            return jsonify({"error": "Campo 'permissoes' deve ser um objeto"}), 400

        chaves_validas = set(PERMISSOES_PADRAO["Specialist"].keys())
        invalidas = set(novas.keys()) - chaves_validas
        if invalidas:
            return jsonify({"error": f"Permissões inválidas: {', '.join(invalidas)}"}), 400

        return jsonify({"permissoes": novas}), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

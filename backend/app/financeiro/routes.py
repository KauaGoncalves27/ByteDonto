from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica

financeiro_bp = Blueprint("financeiro", __name__)


@financeiro_bp.route("/", methods=["GET"])
def listar_lancamentos():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)

        query = (
            supabase.table("faturamento")
            .select("*, pacientes(nome), dentista:usuarios!dentista_responsavel(nome)")
            .eq("clinica_id", clinica_id)
            .order("created_at", desc=True)
        )

        # Corrigido: era "status", agora bate com o query param enviado pelo frontend
        status = request.args.get("status_pagamento")
        if status:
            query = query.eq("status_pagamento", status)

        result = query.execute()
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financeiro_bp.route("/", methods=["POST"])
def criar_lancamento():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        novo_lancamento = {
            "clinica_id": clinica_id,
            "paciente_id": data.get("paciente_id"),
            "atendimento_id": data.get("atendimento_id"),
            "dentista_responsavel": data.get("dentista_responsavel"),
            "valor": data.get("valor"),
            "forma_pagamento": data.get("forma_pagamento"),
            "status_pagamento": data.get("status_pagamento"),
        }
        novo_lancamento = {k: v for k, v in novo_lancamento.items() if v is not None}

        result = supabase.table("faturamento").insert(novo_lancamento).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financeiro_bp.route("/<lancamento_id>", methods=["PUT"])
def atualizar_lancamento(lancamento_id):  # Corrigido: era `id` (builtin do Python)
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)
        data = request.get_json()

        CAMPOS_PERMITIDOS = {"status_pagamento", "forma_pagamento", "valor"}
        payload = {k: v for k, v in data.items() if k in CAMPOS_PERMITIDOS}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        check = (
            supabase.table("faturamento")
            .select("id")
            .eq("id", lancamento_id)
            .eq("clinica_id", clinica_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Lançamento não encontrado"}), 404

        result = (
            supabase.table("faturamento")
            .update(payload)
            .eq("id", lancamento_id)
            .eq("clinica_id", clinica_id)
            .execute()
        )
        return jsonify(result.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

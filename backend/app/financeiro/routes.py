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
        _, clinic_id = get_user_clinica(token)

        query = (
            supabase.table("launches")
            .select("*, consultations(id, patient_id, clinic_id, patients(name))")
            .execute()
        )

        result = query
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financeiro_bp.route("/", methods=["POST"])
def criar_lancamento():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        data = request.get_json()

        novo_lancamento = {
            "consultations_id": data.get("consultations_id") or data.get("atendimento_id"),
            "status": data.get("status") or data.get("status_pagamento", "Pendente"),
        }
        novo_lancamento = {k: v for k, v in novo_lancamento.items() if v is not None}

        result = supabase.table("launches").insert(novo_lancamento).execute()
        return jsonify(result.data[0]), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@financeiro_bp.route("/<lancamento_id>", methods=["PUT"])
def atualizar_lancamento(lancamento_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)
        data = request.get_json()

        CAMPOS_PERMITIDOS = {"status"}
        payload = {k: v for k, v in data.items() if k in CAMPOS_PERMITIDOS}

        if not payload:
            return jsonify({"error": "Nenhum campo válido para atualizar"}), 400

        check = (
            supabase.table("launches")
            .select("id")
            .eq("id", lancamento_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Lançamento não encontrado"}), 404

        result = (
            supabase.table("launches")
            .update(payload)
            .eq("id", lancamento_id)
            .execute()
        )
        return jsonify(result.data[0]), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

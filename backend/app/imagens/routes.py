from flask import Blueprint, request, jsonify
from werkzeug.utils import secure_filename
from uuid import uuid4
from supabase import create_client
from app.database import supabase
from app.utils import get_token, get_user_clinica
from config import Config

imagens_bp = Blueprint("imagens", __name__)

supabase_admin = create_client(Config.SUPABASE_URL, Config.SUPABASE_KEY)

BUCKET = "paciente-imagens"


@imagens_bp.route("/upload", methods=["POST"])
def upload_imagem():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)

        paciente_id = request.form.get("paciente_id")
        if not paciente_id:
            return jsonify({"error": "paciente_id é obrigatório"}), 400

        if "file" not in request.files:
            return jsonify({"error": "Nenhum arquivo enviado"}), 400

        file = request.files["file"]
        if not file.filename:
            return jsonify({"error": "Nome de arquivo inválido"}), 400

        filename_unico = f"{uuid4().hex}_{secure_filename(file.filename)}"
        storage_path = f"{clinica_id}/{paciente_id}/{filename_unico}"
        content_type = file.content_type or "application/octet-stream"
        file_bytes = file.read()

        supabase_admin.storage.from_(BUCKET).upload(
            storage_path,
            file_bytes,
            {"content-type": content_type},
        )

        url = supabase_admin.storage.from_(BUCKET).get_public_url(storage_path)

        registro = {
            "clinica_id": clinica_id,
            "paciente_id": paciente_id,
            "nome": file.filename,
            "url": url,
            "storage_path": storage_path,
        }
        result = supabase.table("paciente_imagens").insert(registro).execute()
        imagem = result.data[0]

        return jsonify({
            "id": imagem["id"],
            "nome": imagem["nome"],
            "url": imagem["url"],
        }), 201
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@imagens_bp.route("/", methods=["GET"])
def listar_imagens():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    paciente_id = request.args.get("paciente_id")
    if not paciente_id:
        return jsonify({"error": "paciente_id é obrigatório"}), 400

    try:
        _, clinica_id = get_user_clinica(token)

        result = (
            supabase.table("paciente_imagens")
            .select("*")
            .eq("clinica_id", clinica_id)
            .eq("paciente_id", paciente_id)
            .order("created_at", desc=True)
            .execute()
        )
        return jsonify(result.data), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@imagens_bp.route("/<imagem_id>", methods=["DELETE"])
def deletar_imagem(imagem_id):
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinica_id = get_user_clinica(token)

        check = (
            supabase.table("paciente_imagens")
            .select("id, storage_path")
            .eq("id", imagem_id)
            .eq("clinica_id", clinica_id)
            .single()
            .execute()
        )

        if not check.data:
            return jsonify({"error": "Imagem não encontrada"}), 404

        storage_path = check.data["storage_path"]

        supabase_admin.storage.from_(BUCKET).remove([storage_path])
        supabase.table("paciente_imagens").delete().eq("id", imagem_id).execute()

        return jsonify({"message": "Imagem deletada com sucesso"}), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

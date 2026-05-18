from flask import Blueprint, request, jsonify
from app.database import supabase
from app.utils import get_token, get_user_clinica
from datetime import date

dashboard_bp = Blueprint("dashboard", __name__)


@dashboard_bp.route("/metricas", methods=["GET"])
def metricas():
    token = get_token(request)
    if not token:
        return jsonify({"error": "Não autorizado"}), 401

    try:
        _, clinic_id = get_user_clinica(token)

        hoje = date.today().isoformat()
        primeiro_dia_mes = date.today().replace(day=1).isoformat()

        # Total de pacientes
        pacientes = (
            supabase.table("patients")
            .select("id")
            .eq("clinic_id", clinic_id)
            .execute()
        )
        total_pacientes = len(pacientes.data)

        # Consultas de hoje
        consultas_hoje_res = (
            supabase.table("consultations")
            .select("id, status")
            .eq("clinic_id", clinic_id)
            .gte("consultation_date", f"{hoje}T00:00:00")
            .lte("consultation_date", f"{hoje}T23:59:59")
            .execute()
        )
        consultas_hoje = len(consultas_hoje_res.data)

        # Total de especialistas via teams + users
        team_members = supabase.table("teams").select("user_id").eq("clinic_id", clinic_id).execute()
        user_ids = [t["user_id"] for t in team_members.data] if team_members.data else []

        total_especialistas = 0
        if user_ids:
            especialistas = (
                supabase.table("users")
                .select("id")
                .in_("id", user_ids)
                .eq("roles", "Specialist")
                .execute()
            )
            total_especialistas = len(especialistas.data)

        return jsonify({
            "total_pacientes": total_pacientes,
            "consultas_hoje": consultas_hoje,
            "total_especialistas": total_especialistas,
            "receita_mes": 0,
            "pendente_mes": 0,
        }), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 500

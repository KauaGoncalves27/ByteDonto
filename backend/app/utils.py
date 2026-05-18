from app.database import supabase

PERMISSOES_PADRAO = {
    "Specialist": {
        "ver_pacientes":      True,
        "editar_pacientes":   False,
        "ver_prontuario":     True,
        "editar_prontuario":  True,
        "ver_agenda":         True,
        "agendar_consultas":  False,
        "cancelar_consultas": False,
        "ver_financeiro":     False,
    },
    "Employee": {
        "ver_pacientes":      True,
        "editar_pacientes":   True,
        "ver_prontuario":     False,
        "editar_prontuario":  False,
        "ver_agenda":         True,
        "agendar_consultas":  True,
        "cancelar_consultas": True,
        "ver_financeiro":     True,
    },
}


def get_token(req):
    return req.headers.get("Authorization", "").replace("Bearer ", "")


def get_user_clinica(token):
    """Retorna (user_id, clinic_id). Lança ValueError se o perfil não for encontrado."""
    user = supabase.auth.get_user(token).user
    team = supabase.table("teams").select("clinic_id").eq("user_id", user.id).execute()
    if not team.data:
        raise ValueError("Nenhuma clínica vinculada. Registre uma clínica antes de continuar.")
    clinic_id = team.data[0].get("clinic_id")
    if not clinic_id:
        raise ValueError("Nenhuma clínica vinculada. Registre uma clínica antes de continuar.")
    return user.id, clinic_id


def get_user_e_clinica(token):
    """Retorna (user_id, clinic_id, roles). Lança ValueError se o perfil não for encontrado."""
    user = supabase.auth.get_user(token).user
    user_data = supabase.table("users").select("name, roles").eq("id", user.id).execute()
    if not user_data.data:
        raise ValueError("Perfil do usuário não encontrado. Faça login novamente.")
    roles = user_data.data[0].get("roles")
    team = supabase.table("teams").select("clinic_id").eq("user_id", user.id).execute()
    clinic_id = team.data[0].get("clinic_id") if team.data else None
    if not clinic_id:
        raise ValueError("Nenhuma clínica vinculada. Registre uma clínica antes de continuar.")
    return user.id, clinic_id, roles

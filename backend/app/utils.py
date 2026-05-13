from app.database import supabase

PERMISSOES_PADRAO = {
    "Especialista": {
        "ver_pacientes":      True,
        "editar_pacientes":   False,
        "ver_prontuario":     True,
        "editar_prontuario":  True,
        "ver_agenda":         True,
        "agendar_consultas":  False,
        "cancelar_consultas": False,
        "ver_financeiro":     False,
    },
    "Recepção": {
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
    """Retorna (user_id, clinica_id). Lança ValueError se o perfil não for encontrado."""
    user = supabase.auth.get_user(token).user
    perfil = supabase.table("usuarios").select("clinica_id").eq("id", user.id).single().execute()
    if not perfil.data:
        raise ValueError("Perfil do usuário não encontrado. Faça login novamente.")
    clinica_id = perfil.data.get("clinica_id")
    if not clinica_id:
        raise ValueError("Nenhuma clínica vinculada. Registre uma clínica antes de continuar.")
    return user.id, clinica_id


def get_user_e_clinica(token):
    """Retorna (user_id, clinica_id, papel). Lança ValueError se o perfil não for encontrado.
    Para usuários com múltiplos papéis, retorna o primeiro perfil encontrado.
    """
    user = supabase.auth.get_user(token).user
    perfil = supabase.table("usuarios").select("clinica_id, papel").eq("id", user.id).execute()
    if not perfil.data:
        raise ValueError("Perfil do usuário não encontrado. Faça login novamente.")
    clinica_id = perfil.data[0].get("clinica_id")
    if not clinica_id:
        raise ValueError("Nenhuma clínica vinculada. Registre uma clínica antes de continuar.")
    return user.id, clinica_id, perfil.data[0]["papel"]

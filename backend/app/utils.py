from app.database import supabase


def get_token(req):
    return req.headers.get("Authorization", "").replace("Bearer ", "")


def get_user_clinica(token):
    """Retorna (user_id, clinica_id). Lança ValueError se o perfil não for encontrado."""
    user = supabase.auth.get_user(token).user
    perfil = supabase.table("usuarios").select("clinica_id").eq("id", user.id).single().execute()
    if not perfil.data:
        raise ValueError("Perfil do usuário não encontrado. Faça login novamente.")
    return user.id, perfil.data["clinica_id"]


def get_user_e_clinica(token):
    """Retorna (user_id, clinica_id, papel). Lança ValueError se o perfil não for encontrado.
    Para usuários com múltiplos papéis, retorna o primeiro perfil encontrado.
    """
    user = supabase.auth.get_user(token).user
    perfil = supabase.table("usuarios").select("clinica_id, papel").eq("id", user.id).execute()
    if not perfil.data:
        raise ValueError("Perfil do usuário não encontrado. Faça login novamente.")
    return user.id, perfil.data[0]["clinica_id"], perfil.data[0]["papel"]

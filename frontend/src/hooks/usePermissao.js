import { useAuth } from "../context/AuthContext";

/**
 * Retorna true se o usuário tem a permissão solicitada.
 * Dono sempre tem tudo. Outros dependem do campo permissoes do perfil.
 */
export function usePermissao(chave) {
    const { user } = useAuth();

    if (!user) return false;

    const papel = user.perfil?.papel;
    if (papel === "Dono") return true;

    const permissoes = user.perfil?.permissoes || {};
    return permissoes[chave] === true;
}

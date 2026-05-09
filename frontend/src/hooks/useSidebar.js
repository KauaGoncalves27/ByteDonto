import { useAuth } from "../context/AuthContext";
import { usePermissao } from "./usePermissao";
import IMG from "../assets/img/icon01.png";

const OWNER_ITEMS = [
    { id: "clinic",    name: "Clínica",      url: "/owner/clinic" },
    { id: "team",      name: "Equipe",       url: "/owner/team" },
    { id: "agenda",    name: "Minha Agenda", url: "/specialist/dashboard" },
    { id: "patients",  name: "Pacientes",    url: "/specialist/patients" },
    { id: "financial", name: "Financeiro",   url: "/owner/financial" },
];

function item(id, name, url) {
    return { id, icon: IMG, name, url };
}

function withSelect(items, activeId) {
    return items.map(i => ({ ...i, icon: IMG, style: i.id === activeId ? "select" : "" }));
}

export function useOwnerSidebar(activeId) {
    return withSelect(OWNER_ITEMS, activeId);
}

export function useSpecialistSidebar(activeId) {
    const { user } = useAuth();
    const verAgenda    = usePermissao("ver_agenda");
    const verPacientes = usePermissao("ver_pacientes");

    // Dono visitando páginas de especialista mantém sidebar completo
    if (user?.perfil?.papel === "Dono") {
        return withSelect(OWNER_ITEMS, activeId);
    }

    const items = [];
    if (verAgenda)    items.push(item("agenda",   "Minha Agenda",            "/specialist/dashboard"));
    if (verPacientes) items.push(item("patients", "Pacientes e Prontuários", "/specialist/patients"));

    return withSelect(items, activeId);
}

export function useReceptionSidebar(activeId) {
    const { user } = useAuth();
    const verAgenda     = usePermissao("ver_agenda");
    const verPacientes  = usePermissao("ver_pacientes");
    const verFinanceiro = usePermissao("ver_financeiro");

    // Dono visitando páginas de recepção mantém sidebar completo
    if (user?.perfil?.papel === "Dono") {
        return withSelect(OWNER_ITEMS, activeId);
    }

    const items = [];
    if (verAgenda)     items.push(item("dashboard", "Painel Principal", "/reception/dashboard"));
    if (verPacientes)  items.push(item("patients",  "Pacientes",        "/reception/patients"));
    if (verFinanceiro) items.push(item("financial", "Financeiro",       "/reception/financial"));

    return withSelect(items, activeId);
}

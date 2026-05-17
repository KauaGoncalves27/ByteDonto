import { useAuth } from "../context/AuthContext";
import { usePermissao } from "./usePermissao";

import ClinicIcon from "../assets/svg/clinic.svg?react";
import TeamIcon from "../assets/svg/team.svg?react";
import FinancialIcon from "../assets/svg/financial.svg?react";
import PatientIcon from "../assets/svg/patient.svg?react";

const OWNER_ITEMS = [
    { id: "clinic",    icon: ClinicIcon,    name: "Clínica",    url: "/owner/clinic" },
    { id: "team",      icon: TeamIcon,      name: "Equipe",     url: "/owner/team" },
    { id: "patients",  icon: PatientIcon,   name: "Pacientes",  url: "/owner/pacients" },
    { id: "financial", icon: FinancialIcon, name: "Financeiro", url: "/owner/financial" },
];

const OWNER_ONLY_CLINIC = [
    { id: "clinic", icon: ClinicIcon, name: "Clínica", url: "/owner/clinic" },
];

function item(id, name, url) {
    return { id, icon: ClinicIcon, name, url };
}

function withSelect(items, activeId) {
    return items.map(i => ({
        ...i,
        icon: i.icon,
        style: i.id === activeId ? "select" : ""
    }));
}

export function useOwnerSidebar(activeId) {
    const { user } = useAuth();

    /*
        Regra:
        - Sem clínica cadastrada → apenas "Clínica"
        - Com clínica cadastrada → sidebar completo
    */

    const possuiClinica = !!user?.perfil?.clinica_id;

    const items = possuiClinica
        ? OWNER_ITEMS
        : OWNER_ONLY_CLINIC;

    return withSelect(items, activeId);
}

export function useSpecialistSidebar(activeId) {
    const { user } = useAuth();

    const verAgenda = usePermissao("ver_agenda");
    const verPacientes = usePermissao("ver_pacientes");

    // Dono visitando páginas de especialista mantém sidebar completo
    if (user?.perfil?.papel === "Dono") {
        return withSelect(OWNER_ITEMS, activeId);
    }

    const items = [];

    if (verAgenda) {
        items.push(
            item(
                "agenda",
                "Minha Agenda",
                "/specialist/dashboard"
            )
        );
    }

    if (verPacientes) {
        items.push(
            item(
                "patients",
                "Pacientes e Prontuários",
                "/specialist/patients"
            )
        );
    }

    return withSelect(items, activeId);
}

export function useReceptionSidebar(activeId) {
    const { user } = useAuth();

    const verAgenda = usePermissao("ver_agenda");
    const verPacientes = usePermissao("ver_pacientes");
    const verFinanceiro = usePermissao("ver_financeiro");

    // Dono visitando páginas de recepção mantém sidebar completo
    if (user?.perfil?.papel === "Dono") {
        return withSelect(OWNER_ITEMS, activeId);
    }

    const items = [];

    if (verAgenda) {
        items.push(
            item(
                "dashboard",
                "Painel Principal",
                "/employee/dashboard"
            )
        );
    }

    if (verPacientes) {
        items.push(
            item(
                "patients",
                "Pacientes",
                "/employee/patients"
            )
        );
    }

    if (verFinanceiro) {
        items.push(
            item(
                "financial",
                "Financeiro",
                "/employee/financial"
            )
        );
    }

    return withSelect(items, activeId);
}
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useOwnerSidebar } from "../../hooks/useSidebar";
import "../../styles/clinic.css";

export default function Onboarding() {
    const { user } = useAuth();
    const opc_bar = useOwnerSidebar("clinic");
    const nome = user?.perfil?.name || "Dentista";

    const passos = [
        {
            num: 1,
            titulo: "Configure sua clínica",
            desc: "Adicione nome, endereço e informações de contato.",
            link: "/owner/clinic/register",
            label: "Configurar Clínica",
        },
        {
            num: 2,
            titulo: "Adicione sua equipe",
            desc: "Cadastre recepcionistas e especialistas com login próprio.",
            link: "/owner/team",
            label: "Gerenciar Equipe",
        },
        {
            num: 3,
            titulo: "Cadastre pacientes",
            desc: "Comece adicionando os pacientes da sua clínica.",
            link: "/reception/patient/register",
            label: "Cadastrar Paciente",
        },
        {
            num: 4,
            titulo: "Acesse sua agenda",
            desc: "Visualize e gerencie seus atendimentos.",
            link: "/specialist/dashboard",
            label: "Ver Agenda",
        },
    ];

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />
            <main className="mainBar owner">
                <div style={{ maxWidth: "700px", margin: "0 auto", paddingTop: "2rem" }}>
                    <div style={{ background: "var(--PrimaryColorsTheme)", borderRadius: "24px", padding: "2.5rem", color: "white", marginBottom: "2rem" }}>
                        <h1 style={{ margin: "0 0 0.5rem 0", fontSize: "32px" }}>Bem-vindo, {nome}!</h1>
                        <p style={{ margin: 0, opacity: 0.85, fontSize: "16px" }}>
                            Siga os passos abaixo para configurar sua clínica no ByteDonto.
                        </p>
                    </div>

                    <div style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
                        {passos.map(p => (
                            <div
                                key={p.num}
                                style={{
                                    background: "white",
                                    borderRadius: "16px",
                                    border: "1px solid var(--LineColor)",
                                    padding: "1.5rem",
                                    display: "flex",
                                    alignItems: "center",
                                    gap: "1.5rem",
                                }}
                            >
                                <div
                                    style={{
                                        width: "48px",
                                        height: "48px",
                                        borderRadius: "50%",
                                        background: "var(--PrimaryColorsBack)",
                                        color: "var(--PrimaryColorsTheme)",
                                        display: "flex",
                                        alignItems: "center",
                                        justifyContent: "center",
                                        fontWeight: 800,
                                        fontSize: "20px",
                                        flexShrink: 0,
                                    }}
                                >
                                    {p.num}
                                </div>
                                <div style={{ flex: 1 }}>
                                    <p style={{ margin: "0 0 4px 0", fontWeight: 700, fontSize: "16px", color: "var(--TextColor)" }}>
                                        {p.titulo}
                                    </p>
                                    <p style={{ margin: 0, fontSize: "14px", color: "var(--TextColor75)" }}>
                                        {p.desc}
                                    </p>
                                </div>
                                <Link
                                    to={p.link}
                                    style={{
                                        background: "var(--PrimaryColorsTheme)",
                                        color: "white",
                                        padding: "10px 20px",
                                        borderRadius: "10px",
                                        fontWeight: 700,
                                        fontSize: "13px",
                                        whiteSpace: "nowrap",
                                        textDecoration: "none",
                                    }}
                                >
                                    {p.label}
                                </Link>
                            </div>
                        ))}
                    </div>

                    <p style={{ textAlign: "center", marginTop: "2rem", fontSize: "14px", color: "var(--TextColor75)" }}>
                        Ja configurado?{" "}
                        <Link to="/owner/clinic" style={{ color: "var(--PrimaryColorsTheme)", fontWeight: 700 }}>
                            Ir para o painel
                        </Link>
                    </p>
                </div>
            </main>
        </>
    );
}

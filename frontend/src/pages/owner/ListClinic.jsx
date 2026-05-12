import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGetClinics, apiGetMetricas } from "../../services/api";
import Section from "../../components/section/SectionAuth";
import ButtonH1 from "../../components/buttons/ButtonsRediTitle";
import SideBar from "../../components/bar/SideBar";
import CampNotList from "../../components/camp/NotList";
import CampList from "../../components/camp/ListClinic";
import { useOwnerSidebar } from "../../hooks/useSidebar";
import IMG from "../../assets/img/icon01.png";
import '../../styles/clinic.css';
import '../../styles/Input.css';

const METRICAS_CONFIG = [
    { key: "total_pacientes",    label: "Total de Pacientes",  emoji: "👥",    moeda: false },
    { key: "consultas_hoje",     label: "Consultas Hoje",      emoji: "📅",    moeda: false },
    { key: "total_especialistas",label: "Especialistas",       emoji: "🦷",    moeda: false },
    { key: "receita_mes",        label: "Receita do Mês",      emoji: "💰",    moeda: true  },
    { key: "total_membros",      label: "Membros da Equipe",   emoji: "👨‍⚕️", moeda: false },
];

function MetricasSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
            {METRICAS_CONFIG.map((m) => (
                <div key={m.key} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ width: "32px", height: "32px", borderRadius: "8px", background: "var(--LineColor)", marginBottom: "0.75rem" }} />
                    <div style={{ width: "60%", height: "36px", borderRadius: "8px", background: "var(--LineColor)", marginBottom: "0.5rem" }} />
                    <div style={{ width: "80%", height: "14px", borderRadius: "6px", background: "var(--LineColor)" }} />
                </div>
            ))}
        </div>
    );
}

function ListClinic() {
    const { token } = useAuth();
    const [clinicas, setClinicas] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);
    const [metricas, setMetricas] = useState(null);
    const [loadingMetricas, setLoadingMetricas] = useState(true);

    const opc_bar = useOwnerSidebar("clinic");

    useEffect(() => {
        apiGetClinics(token)
            .then(data => setClinicas(data))
            .catch(err => console.error("Erro ao carregar clínicas", err))
            .finally(() => setLoading(false));
    }, [token]);

    useEffect(() => {
        if (!token) return;
        apiGetMetricas(token)
            .then(data => setMetricas(data))
            .catch(err => console.error("Erro ao carregar métricas", err))
            .finally(() => setLoadingMetricas(false));
    }, [token]);

    const clinicasFiltradas = clinicas.filter(c =>
        c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        c.cnpj?.includes(busca)
    );

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />
            <main className="mainBar owner">

                {/* ---- MÉTRICAS DO DONO ---- */}
                {loadingMetricas ? (
                    <MetricasSkeleton />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
                        {METRICAS_CONFIG.map((m) => {
                            const valor = metricas ? metricas[m.key] : null;
                            const display = valor == null
                                ? "—"
                                : m.moeda
                                    ? Number(valor).toLocaleString("pt-BR", { style: "currency", currency: "BRL" })
                                    : valor;
                            return (
                                <div key={m.key} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                                    <span style={{ fontSize: "28px", display: "block", marginBottom: "0.75rem" }}>{m.emoji}</span>
                                    <p style={{ margin: "0 0 0.25rem 0", fontSize: "28px", fontWeight: 800, color: "var(--PrimaryColorsTheme)", fontFamily: "var(--font-secondary)", lineHeight: 1 }}>{display}</p>
                                    <p style={{ margin: 0, fontSize: "13px", color: "var(--TextColor75)", fontWeight: 600 }}>{m.emoji} {m.label}</p>
                                </div>
                            );
                        })}
                    </div>
                )}
                {/* ---- FIM MÉTRICAS ---- */}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: 'center' }}>
                    <div>
                        <h1 style={{ margin: 0, fontSize: '28px', color: 'var(--PrimaryColorsTheme)' }}>Minhas Clínicas</h1>
                        <p className="text75">Gerencie as clínicas cadastradas em sua conta</p>
                    </div>
                    <ButtonH1 text={"Registrar Nova Clínica"} url="/owner/clinic/register" />
                </div>
                <div style={{ marginTop: '1rem' }}>
                    <input
                        type="text"
                        placeholder="Buscar clínica por nome ou CNPJ..."
                        value={busca}
                        onChange={e => setBusca(e.target.value)}
                        style={{ padding: '14px 16px', borderRadius: '12px', border: '1px solid var(--LineColor)', width: '100%', maxWidth: '400px' }}
                    />
                </div>
                <div className="camp-clinic camp-list" style={{ marginTop: '1rem' }}>
                    <h2 style={{ margin: '0 0 1rem 0', fontSize: '20px' }}>Clínicas Registradas</h2>
                    {loading ? (
                        <p className="text75">Carregando clínicas...</p>
                    ) : clinicasFiltradas.length === 0 ? (
                        <CampNotList
                            img={IMG}
                            text_p="Nenhuma clínica foi registrada"
                            text_l="Você ainda não cadastrou nenhuma clínica. Comece cadastrando sua primeira clínica!"
                            text_btn="Cadastrar sua Primeira Clínica"
                            utl_btn="/owner/clinic/register"
                        />
                    ) : (
                        clinicasFiltradas.map((item) => (
                            <CampList
                                key={item.id}
                                clinic_url={`/owner/view-clinic/${item.id}`}
                                clinic_logo={item.logo}
                                clinic_img={IMG}
                                clinic_name={item.nome}
                                clinic_cnpj={item.cnpj}
                                clinic_phone={item.whatsapp}
                            />
                        ))
                    )}
                </div>
            </main>
        </>
    );
}

export default ListClinic;

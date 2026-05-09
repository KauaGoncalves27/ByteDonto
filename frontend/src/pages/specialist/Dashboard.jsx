/* IMPORTS */
import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { apiGetConsultas, apiGetMetricas } from "../../services/api";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useSpecialistSidebar } from "../../hooks/useSidebar";
import "../../styles/clinic.css";
import "../../styles/Forms.css";

/* ---- helpers de data ---- */
function getMondayOfWeek(date) {
    const d = new Date(date);
    const day = d.getDay(); // 0=Dom
    const diff = day === 0 ? -6 : 1 - day;
    d.setDate(d.getDate() + diff);
    d.setHours(0, 0, 0, 0);
    return d;
}

function isSameDay(a, b) {
    return (
        a.getFullYear() === b.getFullYear() &&
        a.getMonth() === b.getMonth() &&
        a.getDate() === b.getDate()
    );
}

function getHourFromISO(iso) {
    if (!iso) return -1;
    const d = new Date(iso);
    return d.getHours();
}

const DIAS_SEMANA = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const HORAS = Array.from({ length: 14 }, (_, i) => i + 7); // 07 .. 20

const STATUS_BADGE = {
    Agendado: { bg: "rgba(37,99,235,0.1)", color: "#1D4ED8" },
    Finalizado: { bg: "rgba(22,163,74,0.1)", color: "#15803D" },
    Cancelado: { bg: "rgba(239,68,68,0.1)", color: "#DC2626" },
};

/* ---- CALENDAR WEEK COMPONENT ---- */
function CalendarWeek({ consultas, semanaBase, onMudarSemana }) {
    const dias = Array.from({ length: 7 }, (_, i) => {
        const d = new Date(semanaBase);
        d.setDate(semanaBase.getDate() + i);
        return d;
    });

    const consultasDoDia = (dia) =>
        consultas.filter(c => {
            const d = new Date(c.data_agendada);
            return d.toDateString() === dia.toDateString();
        });

    const STATUS_COR = {
        Agendado: "#3B82F6",
        Finalizado: "#22C55E",
        Cancelado: "#EF4444",
        Faltou: "#9CA3AF",
    };

    const NOMES_DIAS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

    return (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", marginBottom: "0.5rem" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1rem" }}>
                <h3 style={{ margin: 0, color: "var(--TextColor)", fontSize: "16px", fontWeight: 700 }}>Visao Semanal</h3>
                <div style={{ display: "flex", gap: "0.5rem", alignItems: "center" }}>
                    <button
                        onClick={() => onMudarSemana(-7)}
                        style={{ background: "var(--BackColor)", border: "1px solid var(--LineColor)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}
                    >
                        &lsaquo;
                    </button>
                    <span style={{ fontSize: "13px", color: "var(--TextColor75)", fontWeight: 600 }}>
                        {dias[0].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
                        {" — "}
                        {dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short", year: "numeric" })}
                    </span>
                    <button
                        onClick={() => onMudarSemana(7)}
                        style={{ background: "var(--BackColor)", border: "1px solid var(--LineColor)", borderRadius: "8px", padding: "6px 12px", cursor: "pointer", fontWeight: 700 }}
                    >
                        &rsaquo;
                    </button>
                </div>
            </div>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(7, 1fr)", gap: "6px" }}>
                {dias.map((dia, i) => {
                    const consultasDia = consultasDoDia(dia);
                    const hoje = new Date().toDateString() === dia.toDateString();
                    return (
                        <div
                            key={i}
                            style={{
                                minHeight: "90px",
                                borderRadius: "10px",
                                border: `2px solid ${hoje ? "var(--PrimaryColorsTheme)" : "var(--LineColor)"}`,
                                padding: "8px",
                                background: hoje ? "var(--PrimaryColorsBack)" : "white",
                            }}
                        >
                            <p style={{ margin: "0 0 6px 0", fontSize: "11px", fontWeight: 700, color: hoje ? "var(--PrimaryColorsTheme)" : "var(--TextColor75)", textAlign: "center" }}>
                                {NOMES_DIAS[dia.getDay()]}
                                <br />
                                <span style={{ fontSize: "16px", color: hoje ? "var(--PrimaryColorsTheme)" : "var(--TextColor)" }}>
                                    {dia.getDate()}
                                </span>
                            </p>
                            {consultasDia.slice(0, 3).map((c, j) => (
                                <div
                                    key={j}
                                    style={{
                                        fontSize: "10px",
                                        fontWeight: 600,
                                        background: (STATUS_COR[c.status] || STATUS_COR["Agendado"]) + "20",
                                        color: STATUS_COR[c.status] || STATUS_COR["Agendado"],
                                        borderRadius: "4px",
                                        padding: "2px 5px",
                                        marginBottom: "2px",
                                        overflow: "hidden",
                                        whiteSpace: "nowrap",
                                        textOverflow: "ellipsis",
                                    }}
                                >
                                    {new Date(c.data_agendada).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}{" "}
                                    {c.pacientes?.nome?.split(" ")[0] || "—"}
                                </div>
                            ))}
                            {consultasDia.length > 3 && (
                                <p style={{ fontSize: "10px", color: "var(--TextColor75)", margin: "2px 0 0 0" }}>
                                    +{consultasDia.length - 3}
                                </p>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
}

/* ---- MAIN COMPONENT ---- */
function SpecialistDashboard() {
    const { token } = useAuth();

    /* sidebar */
    const opc_bar = useSpecialistSidebar("agenda");

    /* semana */
    const monday = getMondayOfWeek(new Date());
    const weekDates = DIAS_SEMANA.map((label, i) => {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        return { label, date: d };
    });

    const [dataSelecionada, setDataSelecionada] = useState(new Date());
    const [consultas, setConsultas] = useState([]);
    const [loadingConsultas, setLoadingConsultas] = useState(false);
    const [metricas, setMetricas] = useState(null);
    const [semanaBase, setSemanaBase] = useState(() => {
        const d = new Date();
        d.setDate(d.getDate() - d.getDay()); // inicio da semana (domingo)
        d.setHours(0, 0, 0, 0);
        return d;
    });

    /* modal encerrar */
    const [showEncerrar, setShowEncerrar] = useState(false);
    const [activePatient, setActivePatient] = useState("");

    /* fetch consultas quando data muda */
    useEffect(() => {
        if (!token) return;
        setLoadingConsultas(true);
        apiGetConsultas(token)
            .then(data => setConsultas(Array.isArray(data) ? data : []))
            .catch(err => console.error("Erro ao carregar consultas", err))
            .finally(() => setLoadingConsultas(false));
    }, [token, dataSelecionada]);

    /* fetch métricas uma vez */
    useEffect(() => {
        if (!token) return;
        apiGetMetricas(token)
            .then(data => setMetricas(data))
            .catch(err => console.error("Erro ao carregar métricas", err));
    }, [token]);

    /* filtrar consultas pelo dia selecionado */
    const consultasDoDia = consultas.filter(c => {
        if (!c.data_agendada) return false;
        const d = new Date(c.data_agendada);
        return isSameDay(d, dataSelecionada);
    });

    /* mapear consulta por hora */
    function consultaNoSlot(hora) {
        return consultasDoDia.find(c => getHourFromISO(c.data_agendada) === hora) || null;
    }

    /* formatar data legível */
    const dataFormatada = dataSelecionada.toLocaleDateString("pt-BR", {
        weekday: "long", day: "numeric", month: "long",
    });

    return (
        <>
            <Section type_styles="specialist" />
            <SideBar opc={opc_bar} styles="specialist" />

            <main className="mainBar specialist" style={{ position: "relative" }}>

                {/* ---- MODAL ENCERRAR ATENDIMENTO ---- */}
                {showEncerrar && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div style={{ background: "white", padding: "3rem", borderRadius: "32px", width: "100%", maxWidth: "600px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "fadeIn 0.2s", border: "1px solid rgba(226,232,240,0.8)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                                <div>
                                    <span style={{ background: "rgba(37,99,235,0.1)", color: "var(--PrimaryColorsTheme)", padding: "6px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 800, marginBottom: "12px", display: "inline-block" }}>ENCERRAR CONSULTA</span>
                                    <h2 style={{ color: "var(--TextColor)", margin: 0, fontSize: "28px" }}>Resumo do Atendimento</h2>
                                    <p style={{ color: "var(--TextColor75)", margin: "8px 0 0 0" }}>Paciente: <strong style={{ color: "var(--PrimaryColorsTheme)" }}>{activePatient}</strong></p>
                                </div>
                                <button onClick={() => setShowEncerrar(false)} style={{ background: "var(--LineColor)", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", color: "var(--TextColor)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✕</button>
                            </div>

                            <div className="forms-section" style={{ padding: 0 }}>
                                <div className="field" style={{ marginBottom: "1rem" }}>
                                    <label>Procedimentos Realizados Hoje *</label>
                                    <input type="text" placeholder="Ex: Avaliação de Rotina, Limpeza (Profilaxia)..." style={{ width: "100%" }} />
                                </div>
                                <div className="field" style={{ marginBottom: "1rem" }}>
                                    <label>Evolução Clínica (Anotações do Prontuário Central) *</label>
                                    <textarea rows="3" placeholder="Descreva tecnicamente o que foi feito, materiais usados e observações médicas..." style={{ width: "100%" }}></textarea>
                                </div>
                                <div className="field" style={{ marginBottom: 0 }}>
                                    <label>Status do Tratamento</label>
                                    <select style={{ width: "100%" }}>
                                        <option>Tratamento em Andamento (Agendar Retorno)</option>
                                        <option>Alta Médica (Tratamento Finalizado)</option>
                                    </select>
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", borderTop: "1px solid var(--LineColor)", paddingTop: "2rem", marginTop: "2.5rem" }}>
                                <button onClick={() => setShowEncerrar(false)} className="submit" style={{ padding: "16px 24px", background: "var(--BackColor)", color: "var(--TextColor)", boxShadow: "none" }}>Continuar Atendendo</button>
                                <button className="submit" onClick={() => setShowEncerrar(false)} style={{ padding: "16px 40px", background: "var(--PrimaryColorsTheme)", boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }}>Salvar no Prontuário</button>
                            </div>
                        </div>
                    </div>
                )}
                {/* ------------------------------------ */}

                {/* ---- HEADER ---- */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0", color: "var(--PrimaryColorsTheme)", fontSize: "28px" }}>Painel do Especialista</h1>
                        <p className="text75">Bem-vindo(a) ao seu consultório virtual. Confira sua agenda de hoje.</p>
                    </div>
                </div>

                {/* ---- MÉTRICAS RÁPIDAS ---- */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: "1rem", marginBottom: "0.5rem" }}>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "13px", fontWeight: 700, color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Consultas Hoje</p>
                        <p style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--PrimaryColorsTheme)", fontFamily: "var(--font-secondary)" }}>
                            {metricas ? metricas.consultas_hoje ?? "—" : "—"}
                        </p>
                    </div>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "13px", fontWeight: 700, color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total de Pacientes</p>
                        <p style={{ margin: 0, fontSize: "32px", fontWeight: 800, color: "var(--PrimaryColorsTheme)", fontFamily: "var(--font-secondary)" }}>
                            {metricas ? metricas.total_pacientes ?? "—" : "—"}
                        </p>
                    </div>
                </div>

                {/* ---- CALENDARIO SEMANAL ---- */}
                <CalendarWeek
                    consultas={consultas}
                    semanaBase={semanaBase}
                    onMudarSemana={(dias) =>
                        setSemanaBase(prev => {
                            const d = new Date(prev);
                            d.setDate(d.getDate() + dias);
                            return d;
                        })
                    }
                />

                {/* ---- SELETOR DE SEMANA ---- */}
                <div className="camp-clinic camp-view" style={{ marginBottom: "0.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <h2 style={{ margin: 0 }}>Semana Atual</h2>
                        <span style={{ fontSize: "14px", color: "var(--TextColor75)", fontWeight: 600 }}>
                            {monday.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                        </span>
                    </div>

                    <div className="calendar-strip" style={{ marginBottom: 0, paddingBottom: "0.5rem" }}>
                        {weekDates.map(({ label, date }) => (
                            <div
                                key={label}
                                className={`calendar-day ${isSameDay(date, dataSelecionada) ? "active" : ""}`}
                                onClick={() => setDataSelecionada(new Date(date))}
                            >
                                <p>{label}</p>
                                <h3>{date.getDate()}</h3>
                            </div>
                        ))}
                    </div>
                </div>

                {/* ---- GRADE DE HORÁRIOS ---- */}
                <div className="camp-clinic" style={{ padding: "2.5rem" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                        <h2 style={{ margin: 0 }}>Agenda de Hoje</h2>
                        <span style={{ background: "rgba(37,99,235,0.1)", color: "var(--PrimaryColorsTheme)", padding: "6px 14px", borderRadius: "12px", fontSize: "13px", fontWeight: 700, textTransform: "capitalize" }}>
                            {dataFormatada}
                        </span>
                    </div>

                    {loadingConsultas ? (
                        <div style={{ padding: "3rem", textAlign: "center", color: "var(--TextColor75)" }}>Carregando agenda...</div>
                    ) : (
                        <div style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
                            {HORAS.map(hora => {
                                const consulta = consultaNoSlot(hora);
                                const badge = consulta ? (STATUS_BADGE[consulta.status] || STATUS_BADGE["Agendado"]) : null;
                                return (
                                    <div
                                        key={hora}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns: "80px 1fr",
                                            gap: "1rem",
                                            alignItems: "center",
                                            minHeight: "64px",
                                            borderRadius: "12px",
                                            padding: "0.5rem 0",
                                            borderBottom: "1px solid var(--LineColor)",
                                        }}
                                    >
                                        {/* horário */}
                                        <span style={{ fontFamily: "var(--font-secondary)", fontWeight: 600, fontSize: "15px", color: "var(--TextColor75)", textAlign: "right", paddingRight: "1rem" }}>
                                            {String(hora).padStart(2, "0")}:00
                                        </span>

                                        {/* slot */}
                                        {consulta ? (
                                            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--PrimaryColorsBack)", border: "1px solid rgba(37,99,235,0.15)", borderRadius: "12px", padding: "0.75rem 1.25rem" }}>
                                                <div>
                                                    <p style={{ margin: 0, fontWeight: 700, color: "var(--TextColor)", fontSize: "15px" }}>
                                                        {consulta.pacientes?.nome || consulta.paciente?.nome || "Paciente"}
                                                    </p>
                                                    <p style={{ margin: "2px 0 0 0", fontSize: "13px", color: "var(--TextColor75)" }}>
                                                        {consulta.tipo_atendimento || "Atendimento"}
                                                    </p>
                                                </div>
                                                <div style={{ display: "flex", alignItems: "center", gap: "1rem" }}>
                                                    <span style={{ background: badge.bg, color: badge.color, padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700 }}>
                                                        {consulta.status || "Agendado"}
                                                    </span>
                                                    <button
                                                        onClick={() => { setActivePatient(consulta.pacientes?.nome || consulta.paciente?.nome || "Paciente"); setShowEncerrar(true); }}
                                                        className="submit"
                                                        style={{ padding: "6px 14px", fontSize: "13px", borderRadius: "8px", background: "var(--PrimaryColorsTheme)", boxShadow: "none" }}
                                                    >
                                                        Encerrar
                                                    </button>
                                                </div>
                                            </div>
                                        ) : (
                                            <div style={{ background: "rgba(248,250,252,0.8)", border: "1px dashed var(--LineColor)", borderRadius: "12px", padding: "0.75rem 1.25rem" }}>
                                                <p style={{ margin: 0, fontSize: "13px", color: "var(--LineColor)", fontStyle: "italic" }}>Disponível</p>
                                            </div>
                                        )}
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export default SpecialistDashboard;

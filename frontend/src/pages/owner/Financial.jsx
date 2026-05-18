/* IMPORTS */
import { useState, useEffect, useMemo } from "react";
import { useAuth } from "../../context/AuthContext";
import {
    apiGetFinanceiro,
    apiCriarLancamento,
    apiAtualizarLancamento,
    apiGetPacientes,
} from "../../services/api";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useOwnerSidebar } from "../../hooks/useSidebar";
import { useReceptionSidebar } from "../../hooks/useSidebar";
import "../../styles/clinic.css";
import "../../styles/Forms.css";

const FORMAS_PAGAMENTO = ["Dinheiro", "Cartão Débito", "Cartão Crédito", "Pix", "Convênio"];
const STATUS_OPTIONS = ["Pago", "Pendente", "Cancelado"];

const STATUS_STYLE = {
    Pago: { bg: "rgba(22,163,74,0.1)", color: "#15803D" },
    Pendente: { bg: "rgba(234,179,8,0.1)", color: "#854D0E" },
    Cancelado: { bg: "rgba(239,68,68,0.1)", color: "#DC2626" },
};

const FORM_INICIAL = {
    paciente_id: "",
    valor: "",
    forma_pagamento: "Dinheiro",
    status_pagamento: "Pendente",
};

/* ---- GRÁFICO A: Receita por mês (barras verticais) ---- */
function GraficoMensal({ lancamentos }) {
    const meses = [];
    for (let i = 5; i >= 0; i--) {
        const d = new Date();
        d.setMonth(d.getMonth() - i);
        const chave = d.toISOString().slice(0, 7);
        const label = d.toLocaleDateString("pt-BR", { month: "short", year: "2-digit" });
        const pago = lancamentos
            .filter(l => l.status_pagamento === "Pago" && l.created_at?.startsWith(chave))
            .reduce((s, l) => s + Number(l.valor || 0), 0);
        meses.push({ label, pago });
    }
    const max = Math.max(...meses.map(m => m.pago), 1);

    return (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", flex: 1 }}>
            <p style={{ margin: "0 0 1.5rem 0", fontWeight: 700, fontSize: "14px", color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Receita Mensal (Pago)</p>
            <div style={{ display: "flex", alignItems: "flex-end", gap: "8px", height: "120px" }}>
                {meses.map((m, i) => (
                    <div key={i} style={{ flex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "4px", height: "100%" }}>
                        <div style={{ flex: 1, width: "100%", display: "flex", alignItems: "flex-end" }}>
                            <div
                                title={`R$ ${m.pago.toFixed(2)}`}
                                style={{
                                    width: "100%",
                                    background: "var(--PrimaryColorsTheme)",
                                    borderRadius: "6px 6px 0 0",
                                    height: `${max > 0 ? Math.max((m.pago / max) * 100, m.pago > 0 ? 4 : 0) : 0}%`,
                                    transition: "height 0.4s",
                                    minHeight: m.pago > 0 ? "4px" : "0",
                                }}
                            />
                        </div>
                        <span style={{ fontSize: "10px", color: "var(--TextColor75)", fontWeight: 600, whiteSpace: "nowrap" }}>{m.label}</span>
                    </div>
                ))}
            </div>
        </div>
    );
}

/* ---- GRÁFICO B: Forma de pagamento (barras horizontais) ---- */
function GraficoFormas({ lancamentos }) {
    const pagos = lancamentos.filter(l => l.status_pagamento === "Pago");
    const totais = {};
    pagos.forEach(l => {
        const f = l.forma_pagamento || "Outros";
        totais[f] = (totais[f] || 0) + Number(l.valor || 0);
    });
    const entries = Object.entries(totais).sort((a, b) => b[1] - a[1]);
    const max = Math.max(...entries.map(e => e[1]), 1);
    const CORES = ["#3B82F6", "#22C55E", "#F59E0B", "#8B5CF6", "#EF4444", "#06B6D4"];

    return (
        <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", flex: 1 }}>
            <p style={{ margin: "0 0 1.5rem 0", fontWeight: 700, fontSize: "14px", color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Forma de Pagamento</p>
            {entries.length === 0 ? (
                <p style={{ color: "var(--TextColor75)", fontSize: "14px" }}>Sem dados</p>
            ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                    {entries.map(([forma, valor], i) => (
                        <div key={forma}>
                            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "4px" }}>
                                <span style={{ fontSize: "13px", fontWeight: 600 }}>{forma}</span>
                                <span style={{ fontSize: "13px", fontWeight: 700, color: CORES[i % CORES.length] }}>
                                    {valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL" })}
                                </span>
                            </div>
                            <div style={{ background: "var(--LineColor)", borderRadius: "4px", height: "8px" }}>
                                <div style={{ width: `${(valor / max) * 100}%`, height: "100%", background: CORES[i % CORES.length], borderRadius: "4px", transition: "width 0.4s" }} />
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

/* ---- MAIN COMPONENT ---- */
function Financial({ role }) {
    const { token } = useAuth();

    const isOwner = role === "owner";
    const ownerBar     = useOwnerSidebar("financial");
    const receptionBar = useReceptionSidebar("financial");
    const opc_bar      = isOwner ? ownerBar : receptionBar;
    const sectionStyle = isOwner ? "owner" : "reception";

    /* estados */
    const [lancamentos, setLancamentos] = useState([]);
    const [pacientes, setPacientes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filtroStatus, setFiltroStatus] = useState("Todos");

    /* modal novo lançamento */
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [erroForm, setErroForm] = useState(null);

    /* atualizando status inline */
    const [atualizando, setAtualizando] = useState(null); // id do lançamento em atualização

    /* fetch inicial */
    useEffect(() => {
        if (!token) return;
        Promise.all([
            apiGetFinanceiro(token).catch(() => []),
            apiGetPacientes(token).catch(() => []),
        ]).then(([f, p]) => {
            setLancamentos(Array.isArray(f) ? f : []);
            setPacientes(Array.isArray(p) ? p : []);
        }).finally(() => setLoading(false));
    }, [token]);

    /* métricas derivadas */
    const mesAtual = new Date().toISOString().slice(0, 7); // "2026-05"
    const lancamentosMes = lancamentos.filter(l => l.created_at?.startsWith(mesAtual));

    const totalPago = lancamentosMes
        .filter(l => l.status_pagamento === "Pago")
        .reduce((acc, l) => acc + Number(l.valor || 0), 0);

    const totalPendente = lancamentosMes
        .filter(l => l.status_pagamento === "Pendente")
        .reduce((acc, l) => acc + Number(l.valor || 0), 0);

    /* lista filtrada */
    const filtrados = useMemo(() => {
        if (filtroStatus === "Todos") return lancamentos;
        return lancamentos.filter(l => l.status_pagamento === filtroStatus);
    }, [lancamentos, filtroStatus]);

    /* handlers */
    function abrirModal() {
        setForm(FORM_INICIAL);
        setErroForm(null);
        setShowModal(true);
    }

    async function handleCriar(e) {
        e.preventDefault();
        if (!form.valor || Number(form.valor) <= 0) {
            setErroForm("Informe um valor válido.");
            return;
        }
        setEnviando(true);
        setErroForm(null);
        try {
            const novo = await apiCriarLancamento(token, {
                paciente_id: form.paciente_id || null,
                valor: Number(form.valor),
                forma_pagamento: form.forma_pagamento,
                status_pagamento: form.status_pagamento,
            });
            setLancamentos(prev => [novo, ...prev]);
            setShowModal(false);
        } catch (err) {
            setErroForm(err.message);
        } finally {
            setEnviando(false);
        }
    }

    async function marcarComoPago(id) {
        setAtualizando(id);
        try {
            const atualizado = await apiAtualizarLancamento(token, id, { status_pagamento: "Pago" });
            setLancamentos(prev => prev.map(l => l.id === id ? { ...l, status_pagamento: "Pago", ...atualizado } : l));
        } catch (err) {
            console.error("Erro ao atualizar lançamento", err);
        } finally {
            setAtualizando(null);
        }
    }

    function formatCurrency(val) {
        return Number(val || 0).toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
    }

    function formatData(iso) {
        if (!iso) return "—";
        return new Date(iso).toLocaleDateString("pt-BR");
    }

    return (
        <>
            <Section type_styles={sectionStyle} />
            <SideBar opc={opc_bar} styles={sectionStyle} />

            <main className={`mainBar ${sectionStyle}`} style={{ position: "relative" }}>

                {/* ---- MODAL NOVO LANÇAMENTO ---- */}
                {showModal && (
                    <div style={{ position: "fixed", top: 0, left: 0, width: "100vw", height: "100vh", background: "rgba(15,23,42,0.4)", backdropFilter: "blur(8px)", zIndex: 9999, display: "flex", justifyContent: "center", alignItems: "center" }}>
                        <div style={{ background: "white", padding: "3rem", borderRadius: "32px", width: "100%", maxWidth: "600px", boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)", animation: "fadeIn 0.2s", border: "1px solid rgba(226,232,240,0.8)" }}>
                            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "2.5rem" }}>
                                <div>
                                    <span style={{ background: "var(--PrimaryColorsBack)", color: "var(--PrimaryColorsTheme)", padding: "6px 12px", borderRadius: "12px", fontSize: "13px", fontWeight: 800, marginBottom: "12px", display: "inline-block" }}>NOVO REGISTRO</span>
                                    <h2 style={{ color: "var(--TextColor)", margin: 0, fontSize: "28px" }}>Novo Lançamento</h2>
                                    <p style={{ color: "var(--TextColor75)", margin: "8px 0 0 0" }}>Registre um novo movimento financeiro.</p>
                                </div>
                                <button onClick={() => setShowModal(false)} style={{ background: "var(--LineColor)", border: "none", width: "40px", height: "40px", borderRadius: "50%", cursor: "pointer", color: "var(--TextColor)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "18px" }}>✕</button>
                            </div>

                            <form onSubmit={handleCriar} className="forms-section" style={{ padding: 0 }}>
                                {erroForm && (
                                    <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "14px" }}>
                                        {erroForm}
                                    </div>
                                )}

                                <div className="field" style={{ marginBottom: "1rem" }}>
                                    <label>Paciente</label>
                                    <select style={{ width: "100%" }} value={form.paciente_id} onChange={e => setForm(p => ({ ...p, paciente_id: e.target.value }))}>
                                        <option value="">Selecione (opcional)...</option>
                                        {pacientes.map(p => (
                                            <option key={p.id} value={p.id}>{p.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex-inpus" style={{ display: "flex", gap: "1rem" }}>
                                    <div className="field" style={{ flex: 1 }}>
                                        <label>Valor (R$) *</label>
                                        <input type="number" min="0" step="0.01" required placeholder="0,00" style={{ width: "100%" }} value={form.valor} onChange={e => setForm(p => ({ ...p, valor: e.target.value }))} />
                                    </div>
                                    <div className="field" style={{ flex: 1 }}>
                                        <label>Forma de Pagamento</label>
                                        <select style={{ width: "100%" }} value={form.forma_pagamento} onChange={e => setForm(p => ({ ...p, forma_pagamento: e.target.value }))}>
                                            {FORMAS_PAGAMENTO.map(f => <option key={f} value={f}>{f}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="field" style={{ marginBottom: 0 }}>
                                    <label>Status</label>
                                    <select style={{ width: "100%" }} value={form.status_pagamento} onChange={e => setForm(p => ({ ...p, status_pagamento: e.target.value }))}>
                                        <option value="Pago">Pago</option>
                                        <option value="Pendente">Pendente</option>
                                    </select>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", borderTop: "1px solid var(--LineColor)", paddingTop: "2rem", marginTop: "2.5rem" }}>
                                    <button type="button" onClick={() => setShowModal(false)} className="submit" style={{ padding: "16px 24px", background: "var(--BackColor)", color: "var(--TextColor)", boxShadow: "none" }} disabled={enviando}>Cancelar</button>
                                    <button type="submit" className="submit" style={{ padding: "16px 40px", background: "var(--PrimaryColorsTheme)", boxShadow: "0 8px 20px rgba(37,99,235,0.3)" }} disabled={enviando}>
                                        {enviando ? "Salvando..." : "Salvar Lançamento"}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
                {/* ---- FIM MODAL ---- */}

                {/* ---- HEADER ---- */}
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "0.5rem" }}>
                    <div>
                        <h1 style={{ margin: "0 0 0.5rem 0", color: "var(--PrimaryColorsTheme)", fontSize: "28px" }}>Financeiro</h1>
                        <p className="text75">Controle de lançamentos, recebimentos e pendências.</p>
                    </div>
                    <button onClick={abrirModal} style={{ background: "var(--PrimaryColorsTheme)", color: "white", padding: "12px 24px", borderRadius: "12px", fontWeight: "bold", display: "flex", alignItems: "center", gap: "0.5rem", border: "none", cursor: "pointer", boxShadow: "0 4px 15px rgba(37,99,235,0.3)" }}>
                        <span style={{ fontSize: "20px" }}>+</span> Novo Lançamento
                    </button>
                </div>

                {/* ---- CARDS DE MÉTRICAS ---- */}
                <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "13px", fontWeight: 700, color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pago no Mês</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#15803D", fontFamily: "var(--font-secondary)" }}>
                            {loading ? "—" : formatCurrency(totalPago)}
                        </p>
                    </div>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "13px", fontWeight: 700, color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total Pendente</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "#854D0E", fontFamily: "var(--font-secondary)" }}>
                            {loading ? "—" : formatCurrency(totalPendente)}
                        </p>
                    </div>
                    <div style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                        <p style={{ margin: "0 0 0.25rem 0", fontSize: "13px", fontWeight: 700, color: "var(--TextColor75)", textTransform: "uppercase", letterSpacing: "0.05em" }}>Total de Lançamentos</p>
                        <p style={{ margin: 0, fontSize: "28px", fontWeight: 800, color: "var(--PrimaryColorsTheme)", fontFamily: "var(--font-secondary)" }}>
                            {loading ? "—" : lancamentos.length}
                        </p>
                    </div>
                </div>

                {/* ---- GRÁFICOS ---- */}
                {!loading && lancamentos.length > 0 && (
                    <div style={{ display: "flex", gap: "1rem" }}>
                        <GraficoMensal lancamentos={lancamentos} />
                        <GraficoFormas lancamentos={lancamentos} />
                    </div>
                )}

                {/* ---- FILTROS ---- */}
                <div style={{ display: "flex", gap: "0.5rem" }}>
                    {["Todos", ...STATUS_OPTIONS].map(s => (
                        <button
                            key={s}
                            onClick={() => setFiltroStatus(s)}
                            style={{
                                padding: "8px 18px",
                                borderRadius: "10px",
                                border: "1px solid var(--LineColor)",
                                cursor: "pointer",
                                fontWeight: 600,
                                fontSize: "14px",
                                background: filtroStatus === s ? "var(--PrimaryColorsTheme)" : "white",
                                color: filtroStatus === s ? "white" : "var(--TextColor75)",
                                transition: "all 0.15s",
                            }}
                        >
                            {s}
                        </button>
                    ))}
                </div>

                {/* ---- TABELA ---- */}
                <div className="camp-clinic" style={{ padding: "2.5rem" }}>
                    <h2 style={{ margin: "0 0 1.5rem 0" }}>Lançamentos</h2>

                    {loading ? (
                        <p className="text75" style={{ textAlign: "center", padding: "2rem" }}>Carregando...</p>
                    ) : filtrados.length === 0 ? (
                        <p className="text75" style={{ textAlign: "center", padding: "2rem" }}>Nenhum lançamento encontrado.</p>
                    ) : (
                        <div className="table">
                            <div className="table-header" style={{ gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1.2fr 1fr 1fr 1.2fr" }}>
                                <p className="text75">Data</p>
                                <p className="text75">Paciente</p>
                                <p className="text75">Dentista</p>
                                <p className="text75">Procedimento</p>
                                <p className="text75">Pagamento</p>
                                <p className="text75">Valor</p>
                                <p className="text75">Status</p>
                                <p className="text75" style={{ textAlign: "right" }}>Ações</p>
                            </div>
                            <div className="table-body">
                                {filtrados.map((l, idx) => {
                                    const st = STATUS_STYLE[l.status_pagamento] || STATUS_STYLE["Pendente"];
                                    return (
                                        <div
                                            key={l.id}
                                            className="table-row"
                                            style={{ gridTemplateColumns: "1fr 1.5fr 1.5fr 1.5fr 1.2fr 1fr 1fr 1.2fr", borderBottom: idx === filtrados.length - 1 ? "none" : "1px solid var(--LineColor)" }}
                                        >
                                            <p style={{ fontFamily: "var(--font-secondary)", fontSize: "13px", fontWeight: 500 }}>{formatData(l.created_at)}</p>
                                            <p style={{ fontWeight: 600 }}>{l.patients?.name || "—"}</p>
                                            <p className="text75">{l.specialist?.name || "—"}</p>
                                            <p className="text75" style={{ fontSize: "13px" }}>{l.observacao || l.procedimento || "—"}</p>
                                            <p className="text75">{l.forma_pagamento || "—"}</p>
                                            <p style={{ fontFamily: "var(--font-secondary)", fontWeight: 700 }}>{formatCurrency(l.valor)}</p>
                                            <span style={{ background: st.bg, color: st.color, padding: "4px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, whiteSpace: "nowrap", alignSelf: "center" }}>
                                                {l.status_pagamento}
                                            </span>
                                            <div style={{ textAlign: "right" }}>
                                                {l.status_pagamento === "Pendente" && (
                                                    <button
                                                        onClick={() => marcarComoPago(l.id)}
                                                        disabled={atualizando === l.id}
                                                        className="submit"
                                                        style={{ padding: "6px 12px", fontSize: "12px", borderRadius: "8px", background: "#15803D", boxShadow: "none", whiteSpace: "nowrap" }}
                                                    >
                                                        {atualizando === l.id ? "..." : "Marcar Pago"}
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </main>
        </>
    );
}

export default Financial;

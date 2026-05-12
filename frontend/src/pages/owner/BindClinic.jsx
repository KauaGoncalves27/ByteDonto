import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetEquipe, apiCriarMembro, apiRemoverMembro, apiAtualizarMembro, apiAtualizarPermissoes } from "../../services/api";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useOwnerSidebar } from "../../hooks/useSidebar";
import { apiGetMetricas } from "../../services/api";
import "../../styles/clinic.css";
import "../../styles/Forms.css";
import "../../styles/Table.css";

const PAPEIS = ["Especialista", "Recepção"];

const METRICAS_CONFIG = [
    { key: "total_especialistas",label: "Nº Total de Especialistas", emoji: "🦷", moeda: false },
    { key: "total_funcionarios", label: "Nº Total de Funcionários",  emoji: "👨", moeda: false  },
    { key: "total_membros",      label: "Nº Total de Membros",       emoji: "👥", moeda: false },
];

const LABELS_PERMISSAO = {
    ver_pacientes:      "Ver pacientes",
    editar_pacientes:   "Editar pacientes",
    ver_prontuario:     "Ver prontuário",
    editar_prontuario:  "Editar prontuário",
    ver_agenda:         "Ver agenda",
    agendar_consultas:  "Agendar consultas",
    cancelar_consultas: "Cancelar consultas",
    ver_financeiro:     "Ver financeiro",
};

const PAPEL_LABEL = {
    Dono: { label: "Proprietário", cor: "#7C3AED" },
    Especialista: { label: "Especialista", cor: "#2563EB" },
    "Recepção": { label: "Recepção", cor: "#059669" },
};

const FORM_INICIAL = { email: "", papel: "Especialista" };

function MetricasSkeleton() {
    return (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem" }}>
            {METRICAS_CONFIG.map((m) => (
                <div key={m.key} style={{ background: "white", borderRadius: "16px", border: "1px solid var(--LineColor)", padding: "1.5rem", boxShadow: "0 1px 3px rgba(0,0,0,0.06)" }}>
                    <div style={{ height: "32px", borderRadius: "8px", background: "var(--LineColor)", marginBottom: "0.75rem" }} />
                    <div style={{ height: "36px", borderRadius: "8px", background: "var(--LineColor)", marginBottom: "0.75rem" }} />
                    <div style={{ height: "14px", borderRadius: "6px", background: "var(--LineColor)", marginBottom: "0.75rem" }} />
                </div>
            ))}
        </div>
    );
}

function BindClinic() {
    const { token } = useAuth();
    const opc_bar = useOwnerSidebar("team");

    const [equipe, setEquipe] = useState([]);
    const [carregando, setCarregando] = useState(true);
    const [erro, setErro] = useState(null);
    const [loadingMetricas, setLoadingMetricas] = useState(true);
    const [metricas, setMetricas] = useState(null);

    // Modal de criação
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState(FORM_INICIAL);
    const [enviando, setEnviando] = useState(false);
    const [formErro, setFormErro] = useState(null);
    const [formSucesso, setFormSucesso] = useState(null);

    // Modal de edição
    const [showEdit, setShowEdit] = useState(false);
    const [membroEditando, setMembroEditando] = useState(null);
    const [editForm, setEditForm] = useState({ nome: "", papel: "" });
    const [editEnviando, setEditEnviando] = useState(false);
    const [editErro, setEditErro] = useState(null);

    // Modal de permissões
    const [showPerm, setShowPerm] = useState(false);
    const [membroPermissoes, setMembroPermissoes] = useState(null);
    const [permForm, setPermForm] = useState({});
    const [permSalvando, setPermSalvando] = useState(false);
    const [permErro, setPermErro] = useState(null);
    const [permSucesso, setPermSucesso] = useState(false);

    // Confirmação de remoção
    const [removendoId, setRemovendoId] = useState(null);

    const carregarEquipe = useCallback(async () => {
        setCarregando(true);
        setErro(null);
        try {
            const data = await apiGetEquipe(token);
            setEquipe(data);
        } catch (e) {
            setErro(e.message);
        } finally {
            setCarregando(false);
        }
    }, [token]);

    useEffect(() => {
        carregarEquipe();
    }, [carregarEquipe]);

    useEffect(() => {
        document.body.style.overflow = showForm || showEdit || showPerm ? "hidden" : "auto";
        return () => { document.body.style.overflow = "auto"; };
    }, [showForm, showEdit, showPerm]);

    useEffect(() => {
        if (!token) return;
        apiGetMetricas(token)
            .then(data => setMetricas(data))
            .catch(err => console.error("Erro ao carregar métricas", err))
            .finally(() => setLoadingMetricas(false));
    }, [token]);

    // --- Criar membro ---
    function abrirForm() {
        setForm(FORM_INICIAL);
        setFormErro(null);
        setFormSucesso(null);
        setShowForm(true);
    }

    async function handleCriar(e) {
        e.preventDefault();
        setEnviando(true);
        setFormErro(null);
        setFormSucesso(null);
        try {
            const novo = await apiCriarMembro(token, form);
            setFormSucesso(`${novo.nome} adicionado com sucesso!`);
            setEquipe(prev => [...prev, { id: novo.id, nome: novo.nome, papel: novo.papel, created_at: new Date().toISOString() }]);
            setTimeout(() => {
                setShowForm(false);
                setFormSucesso(null);
            }, 1500);
        } catch (e) {
            setFormErro(e.message);
        } finally {
            setEnviando(false);
        }
    }

    // --- Editar membro ---
    function abrirEdit(membro) {
        setMembroEditando(membro);
        setEditForm({ nome: membro.nome, papel: membro.papel });
        setEditErro(null);
        setShowEdit(true);
    }

    async function handleEditar(e) {
        e.preventDefault();
        setEditEnviando(true);
        setEditErro(null);
        try {
            const atualizado = await apiAtualizarMembro(token, membroEditando.id, editForm);
            setEquipe(prev => prev.map(m => m.id === membroEditando.id ? { ...m, ...atualizado } : m));
            setShowEdit(false);
        } catch (e) {
            setEditErro(e.message);
        } finally {
            setEditEnviando(false);
        }
    }

    // --- Permissões ---
    function abrirPermissoes(membro) {
        setMembroPermissoes(membro);
        setPermForm(membro.permissoes || {});
        setPermErro(null);
        setPermSucesso(false);
        setShowPerm(true);
    }

    async function handleSalvarPermissoes(e) {
        e.preventDefault();
        setPermSalvando(true);
        setPermErro(null);
        try {
            const resultado = await apiAtualizarPermissoes(token, membroPermissoes.id, permForm);
            setEquipe(prev => prev.map(m =>
                m.id === membroPermissoes.id ? { ...m, permissoes: resultado.permissoes } : m
            ));
            setPermSucesso(true);
            setTimeout(() => setShowPerm(false), 1200);
        } catch (e) {
            setPermErro(e.message);
        } finally {
            setPermSalvando(false);
        }
    }

    // --- Remover membro ---
    async function handleRemover(id) {
        setRemovendoId(id);
        try {
            await apiRemoverMembro(token, id);
            setEquipe(prev => prev.filter(m => m.id !== id));
        } catch (e) {
            alert(e.message);
        } finally {
            setRemovendoId(null);
        }
    }

    const membrosNaoDono = equipe.filter(m => m.papel !== "Dono");
    const dono = equipe.find(m => m.papel === "Dono");

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />

            {/* Modal — Criar membro */}
            {showForm && (
                <div className="forms-hover owner" style={{ display: "flex" }}>
                    <div className="forms-card">
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0, color: "var(--PrimaryColorsTheme)" }}>Adicionar Membro</h2>
                            <p className="text75" style={{ margin: "0.5rem 0 0 0", fontSize: "14px" }}>
                                Crie o acesso para um profissional da sua clínica.
                            </p>
                        </div>

                        {formSucesso ? (
                            <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                <p style={{ fontSize: "2rem" }}>✅</p>
                                <p style={{ fontWeight: 700, color: "#059669" }}>{formSucesso}</p>
                            </div>
                        ) : (
                            <form onSubmit={handleCriar}>
                                {formErro && (
                                    <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "14px" }}>
                                        {formErro}
                                    </div>
                                )}
                                <div className="field">
                                    <label htmlFor="email">E-mail *</label>
                                    <input id="email" type="email" required value={form.email}
                                        onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
                                </div>
                                <div className="field">
                                    <label htmlFor="papel">Nível de acesso *</label>
                                    <select id="papel" value={form.papel}
                                        onChange={e => setForm(p => ({ ...p, papel: e.target.value }))}>
                                        {PAPEIS.map(p => (
                                            <option key={p} value={p}>{p === "Recepção" ? "Atendimento" : p}</option>
                                        ))}
                                    </select>
                                </div>
                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                                    <button type="button" className="submit"
                                        style={{ background: "var(--LineColor)", color: "var(--TextColor)", boxShadow: "none" }}
                                        onClick={() => setShowForm(false)} disabled={enviando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="submit" disabled={enviando}>
                                        {enviando ? "Criando..." : "Criar Acesso"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            {/* Modal — Editar membro */}
            {showEdit && membroEditando && (
                <div className="forms-hover owner" style={{ display: "flex" }}>
                    <div className="forms-card">
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0, color: "var(--PrimaryColorsTheme)" }}>Editar Membro</h2>
                            <p className="text75" style={{ margin: "0.5rem 0 0 0", fontSize: "14px" }}>
                                Altere o nome ou o nível de acesso de {membroEditando.nome}.
                            </p>
                        </div>
                        <form onSubmit={handleEditar}>
                            {editErro && (
                                <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "14px" }}>
                                    {editErro}
                                </div>
                            )}
                            <div className="field">
                                <label htmlFor="edit-nome">Nome completo *</label>
                                <input id="edit-nome" type="text" required value={editForm.nome}
                                    onChange={e => setEditForm(p => ({ ...p, nome: e.target.value }))} />
                            </div>
                            <div className="field">
                                <label htmlFor="edit-papel">Nível de acesso *</label>
                                <select id="edit-papel" value={editForm.papel}
                                    onChange={e => setEditForm(p => ({ ...p, papel: e.target.value }))}>
                                    {PAPEIS.map(p => (
                                        <option key={p} value={p}>{p === "Recepção" ? "Recepção / Atendimento" : p}</option>
                                    ))}
                                </select>
                            </div>
                            <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem", marginTop: "2rem" }}>
                                <button type="button" className="submit"
                                    style={{ background: "var(--LineColor)", color: "var(--TextColor)", boxShadow: "none" }}
                                    onClick={() => setShowEdit(false)} disabled={editEnviando}>
                                    Cancelar
                                </button>
                                <button type="submit" className="submit" disabled={editEnviando}>
                                    {editEnviando ? "Salvando..." : "Salvar"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Modal — Permissões */}
            {showPerm && membroPermissoes && (
                <div className="forms-hover owner" style={{ display: "flex" }}>
                    <div className="forms-card" style={{ maxWidth: "480px", width: "100%" }}>
                        <div style={{ marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0, color: "var(--PrimaryColorsTheme)" }}>Permissões</h2>
                            <p className="text75" style={{ margin: "0.5rem 0 0 0", fontSize: "14px" }}>
                                Defina o que <strong>{membroPermissoes.nome}</strong> pode acessar.
                            </p>
                        </div>

                        {permSucesso ? (
                            <div style={{ textAlign: "center", padding: "2rem 0" }}>
                                <p style={{ fontSize: "2rem" }}>✅</p>
                                <p style={{ fontWeight: 700, color: "#059669" }}>Permissões salvas!</p>
                            </div>
                        ) : (
                            <form onSubmit={handleSalvarPermissoes}>
                                {permErro && (
                                    <div style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", padding: "10px 14px", borderRadius: "8px", marginBottom: "1rem", fontSize: "14px" }}>
                                        {permErro}
                                    </div>
                                )}

                                <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "1.5rem" }}>
                                    {Object.entries(LABELS_PERMISSAO).map(([chave, label]) => (
                                        <label key={chave} style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 14px", background: "var(--BackgroundColor2, #f8f9fa)", borderRadius: "8px", cursor: "pointer", gap: "1rem" }}>
                                            <span style={{ fontSize: "14px", fontWeight: 500 }}>{label}</span>
                                            <div
                                                onClick={() => setPermForm(p => ({ ...p, [chave]: !p[chave] }))}
                                                style={{
                                                    width: "42px", height: "24px", borderRadius: "12px", flexShrink: 0,
                                                    background: permForm[chave] ? "var(--PrimaryColorsTheme)" : "#D1D5DB",
                                                    position: "relative", cursor: "pointer", transition: "background 0.2s",
                                                }}>
                                                <div style={{
                                                    position: "absolute", top: "3px",
                                                    left: permForm[chave] ? "21px" : "3px",
                                                    width: "18px", height: "18px", borderRadius: "50%",
                                                    background: "#fff", transition: "left 0.2s", boxShadow: "0 1px 3px rgba(0,0,0,0.2)",
                                                }} />
                                            </div>
                                        </label>
                                    ))}
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", gap: "1rem" }}>
                                    <button type="button" className="submit"
                                        style={{ background: "var(--LineColor)", color: "var(--TextColor)", boxShadow: "none" }}
                                        onClick={() => setShowPerm(false)} disabled={permSalvando}>
                                        Cancelar
                                    </button>
                                    <button type="submit" className="submit" disabled={permSalvando}>
                                        {permSalvando ? "Salvando..." : "Salvar Permissões"}
                                    </button>
                                </div>
                            </form>
                        )}
                    </div>
                </div>
            )}

            <main className="mainBar owner register">

                {loadingMetricas ? (
                    <MetricasSkeleton />
                ) : (
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "1rem", marginBottom: "1.5rem" }}>
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

                <div className="camp-clinic camp-register">
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "2em" }}>
                        <div>
                            <h1 style={{ margin: "0 0 0.5rem 0" }}>Equipe da Clínica</h1>
                            <p className="text75">Gerencie os acessos dos profissionais. Você define o login e o nível de permissão de cada membro.</p>
                        </div>
                        <button className="submit" onClick={abrirForm} style={{ padding: "12px 24px", fontSize: "15px" }}>
                            + Adicionar Membro
                        </button>
                    </div>

                    {carregando ? (
                        <div style={{ textAlign: "center", padding: "3rem" }}>
                            <p className="text75">Carregando equipe...</p>
                        </div>
                    ) : erro ? (
                        <div style={{ textAlign: "center", padding: "3rem" }}>
                            <p style={{ color: "#EF4444" }}>{erro}</p>
                            <button className="submit" onClick={carregarEquipe} style={{ marginTop: "1rem" }}>Tentar novamente</button>
                        </div>
                    ) : (
                        <>
                            {/* Card do Proprietário */}
                            {dono && (
                                <div style={{ marginBottom: "2rem" }}>
                                    <p className="text75" style={{ marginBottom: "0.75rem", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>Proprietário</p>
                                    <div className="table-row" style={{ gridTemplateColumns: "2fr 1fr 1fr", background: "rgba(124,58,237,0.06)", borderRadius: "10px", padding: "14px 16px" }}>
                                        <div>
                                            <p style={{ fontWeight: 700 }}>{dono.nome}</p>
                                        </div>
                                        <span style={{ background: "rgba(124,58,237,0.12)", color: "#7C3AED", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, alignSelf: "center" }}>
                                            Proprietário
                                        </span>
                                        <p style={{ fontSize: "12px", color: "var(--TextColor75)", alignSelf: "center" }}>Acesso total</p>
                                    </div>
                                </div>
                            )}

                            {/* Tabela da equipe */}
                            <p className="text75" style={{ marginBottom: "0.75rem", fontWeight: 700, fontSize: "12px", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                                Membros ({membrosNaoDono.length})
                            </p>

                            {membrosNaoDono.length === 0 ? (
                                <div style={{ textAlign: "center", padding: "3rem 1rem", border: "2px dashed var(--LineColor)", borderRadius: "12px" }}>
                                    <p style={{ fontWeight: 700, fontSize: "16px" }}>Nenhum membro adicionado</p>
                                    <p className="text75" style={{ marginTop: "0.5rem" }}>
                                        Clique em "Adicionar Membro" para criar o acesso de um especialista ou recepcionista.
                                    </p>
                                </div>
                            ) : (
                                <div className="table">
                                    <div className="table-header" style={{ gridTemplateColumns: "2fr 1fr 1fr 180px" }}>
                                        <p className="text75">Nome</p>
                                        <p className="text75">Nível de Acesso</p>
                                        <p className="text75">Adicionado em</p>
                                        <p className="text75" style={{ textAlign: "right" }}>Ações</p>
                                    </div>

                                    <div className="table-body">
                                        {membrosNaoDono.map(membro => {
                                            const config = PAPEL_LABEL[membro.papel] || { label: membro.papel, cor: "#6B7280" };
                                            const dataFormatada = new Date(membro.created_at).toLocaleDateString("pt-BR");
                                            return (
                                                <div className="table-row" key={membro.id} style={{ gridTemplateColumns: "2fr 1fr 1fr 180px" }}>
                                                    <p style={{ fontWeight: 600 }}>{membro.nome}</p>
                                                    <span style={{ background: `${config.cor}18`, color: config.cor, padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: 700, alignSelf: "center", width: "fit-content" }}>
                                                        {config.label}
                                                    </span>
                                                    <p className="text75" style={{ fontSize: "13px", alignSelf: "center" }}>{dataFormatada}</p>
                                                    <div style={{ display: "flex", justifyContent: "flex-end", gap: "6px", alignSelf: "center" }}>
                                                        <button
                                                            onClick={() => abrirPermissoes(membro)}
                                                            style={{ background: "rgba(5,150,105,0.1)", color: "#059669", border: "none", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                                                            Permissões
                                                        </button>
                                                        <button
                                                            onClick={() => abrirEdit(membro)}
                                                            style={{ background: "rgba(37,99,235,0.1)", color: "#2563EB", border: "none", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                                                            Editar
                                                        </button>
                                                        <button
                                                            onClick={() => handleRemover(membro.id)}
                                                            disabled={removendoId === membro.id}
                                                            style={{ background: "rgba(239,68,68,0.1)", color: "#EF4444", border: "none", padding: "6px 10px", borderRadius: "8px", fontSize: "12px", fontWeight: 700, cursor: "pointer" }}>
                                                            {removendoId === membro.id ? "..." : "Remover"}
                                                        </button>
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            </main>
        </>
    );
}

export default BindClinic;

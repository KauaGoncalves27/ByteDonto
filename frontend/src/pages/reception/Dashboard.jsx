/* IMPORTS */
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetPacientes, apiGetEquipe, apiCriarConsulta, apiGetConsultas } from "../../services/api";
import { formatCPF } from "../../utils/formatters";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import Card from "../../components/card/CardInfo";
import { useReceptionSidebar } from "../../hooks/useSidebar";

const FORM_INICIAL = {
    paciente_id: "",
    dentista_id: "",
    tipo: "",
    data: "",
    hora: "",
    motivo: "",
};

/* MAIN COMPONENT */
function ReceptionDashboard() {
    const { token } = useAuth();

    const [pacientes, setPacientes] = useState([]);
    const [especialistas, setEspecialistas] = useState([]);
    const [consultas, setConsultas] = useState([]);

    // Agendamento modal
    const [showAgendamento, setShowAgendamento] = useState(false);
    const [agForm, setAgForm] = useState(FORM_INICIAL);
    const [agEnviando, setAgEnviando] = useState(false);
    const [agErro, setAgErro] = useState(null);
    const [agSucesso, setAgSucesso] = useState(false);

    // Autocomplete no modal
    const [searchName, setSearchName] = useState("");
    const [selectedPatient, setSelectedPatient] = useState(null);

    // Busca rápida
    const [quickSearch, setQuickSearch] = useState("");

    const opc_bar = useReceptionSidebar("dashboard");

    useEffect(() => {
        Promise.all([
            apiGetPacientes(token).catch(() => []),
            apiGetEquipe(token).catch(() => []),
            apiGetConsultas(token).catch(() => []),
        ]).then(([p, e, c]) => {
            setPacientes(p);
            setEspecialistas(e.filter(m => m.roles === "Specialist"));
            setConsultas(c);
        });
    }, [token]);

    // Derivados de autocomplete
    const filteredPatients = searchName.length > 1 && !selectedPatient
        ? pacientes.filter(p =>
            p.name?.toLowerCase().includes(searchName.toLowerCase()) ||
            p.cpf?.includes(searchName) ||
            p.whatsapp?.includes(searchName)
        )
        : [];

    const filteredQuick = quickSearch.length > 1
        ? pacientes.filter(p =>
            p.name?.toLowerCase().includes(quickSearch.toLowerCase()) ||
            p.cpf?.includes(quickSearch) ||
            p.whatsapp?.includes(quickSearch)
        )
        : [];

    function abrirModal() {
        setAgForm(FORM_INICIAL);
        setSearchName("");
        setSelectedPatient(null);
        setAgErro(null);
        setAgSucesso(false);
        setShowAgendamento(true);
    }

    async function handleAgendar(e) {
        e.preventDefault();
        if (!selectedPatient) {
            setAgErro("Selecione um paciente cadastrado.");
            return;
        }
        setAgEnviando(true);
        setAgErro(null);
        try {
            const consultation_date = `${agForm.data}T${agForm.hora}:00`;
            const nova = await apiCriarConsulta(token, {
                patient_id: selectedPatient.id,
                specialist_id: agForm.dentista_id || null,
                consultation_date,
                reason_complaint: agForm.motivo,
            });
            setConsultas(prev => [nova, ...prev]);
            setAgSucesso(true);
            setTimeout(() => setShowAgendamento(false), 1500);
        } catch (err) {
            setAgErro(err.message);
        } finally {
            setAgEnviando(false);
        }
    }

    const hoje = new Date().toISOString().slice(0, 10);
    const consultasHoje = consultas.filter(c => c.consultation_date?.startsWith(hoje));

    return (
        <>
            <Section type_styles="employee" />
            <SideBar opc={opc_bar} styles="employee" />

            <main className="mainBar employee" style={{ position: 'relative' }}>

                {/* ---------- MODAL DE AGENDAMENTO ---------- */}
                {showAgendamento && (
                    <div style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(15, 23, 42, 0.4)', backdropFilter: 'blur(8px)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <div style={{ background: 'white', padding: '3rem', borderRadius: '32px', width: '100%', maxWidth: '750px', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.25)', animation: 'fadeIn 0.2s', border: '1px solid rgba(226,232,240,0.8)' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2.5rem' }}>
                                <div>
                                    <span style={{ background: 'var(--PrimaryColorsBack)', color: 'var(--PrimaryColorsTheme)', padding: '6px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 800, marginBottom: '12px', display: 'inline-block' }}>NOVO EVENTO</span>
                                    <h2 style={{ color: 'var(--TextColor)', margin: 0, fontSize: '32px' }}>Agendar Consulta</h2>
                                    <p style={{ color: 'var(--TextColor75)', margin: '8px 0 0 0' }}>Selecione paciente, profissional e horário.</p>
                                </div>
                                <button onClick={() => setShowAgendamento(false)} style={{ background: 'var(--LineColor)', border: 'none', width: '40px', height: '40px', borderRadius: '50%', cursor: 'pointer', color: 'var(--TextColor)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '18px' }}>✕</button>
                            </div>

                            {agSucesso ? (
                                <div style={{ textAlign: 'center', padding: '2rem 0' }}>
                                    <p style={{ fontSize: '3rem' }}>✅</p>
                                    <p style={{ fontWeight: 700, color: '#059669', fontSize: '18px' }}>Consulta agendada com sucesso!</p>
                                </div>
                            ) : (
                                <form onSubmit={handleAgendar} className="forms-section" style={{ padding: 0 }}>
                                    {agErro && (
                                        <div style={{ background: 'rgba(239,68,68,0.1)', color: '#EF4444', padding: '10px 14px', borderRadius: '8px', marginBottom: '1rem', fontSize: '14px' }}>
                                            {agErro}
                                        </div>
                                    )}

                                    <div className="field" style={{ marginBottom: '1rem', position: 'relative' }}>
                                        <label>Buscar Paciente Cadastrado *</label>
                                        <input
                                            type="text"
                                            placeholder="🔍 Digite Nome, CPF ou Telefone..."
                                            style={{ width: '100%' }}
                                            value={selectedPatient ? selectedPatient.name : searchName}
                                            onChange={e => { setSearchName(e.target.value); setSelectedPatient(null); }}
                                        />
                                        {filteredPatients.length > 0 && (
                                            <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid var(--LineColor)', borderRadius: '12px', listStyle: 'none', padding: '0.5rem', margin: '4px 0 0 0', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 10, maxHeight: '200px', overflowY: 'auto' }}>
                                                {filteredPatients.map(p => (
                                                    <li key={p.id} onClick={() => { setSelectedPatient(p); setSearchName(""); }}
                                                        style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', borderBottom: '1px solid var(--LineColor)' }}>
                                                        <p style={{ fontWeight: 700, margin: 0, color: 'var(--PrimaryColorsTheme)' }}>{p.name}</p>
                                                        <span style={{ fontSize: '12px', color: 'var(--TextColor75)' }}>CPF: {formatCPF(p.cpf)}</span>
                                                    </li>
                                                ))}
                                            </ul>
                                        )}
                                        <Link to="/employee/patient/register" style={{ color: 'var(--PrimaryColorsTheme)', fontSize: '13px', textDecoration: 'underline', marginTop: '12px', display: 'inline-block', fontWeight: 'bold' }}>
                                            + Paciente não encontrado? (Cadastrar)
                                        </Link>
                                    </div>

                                    <div className="flex-inpus">
                                        <div className="field">
                                            <label>Especialista Alocado</label>
                                            <select style={{ width: '100%' }} value={agForm.dentista_id}
                                                onChange={e => setAgForm(p => ({ ...p, dentista_id: e.target.value }))}>
                                                <option value="">Selecione...</option>
                                                {especialistas.map(e => (
                                                    <option key={e.id} value={e.id}>{e.name}</option>
                                                ))}
                                            </select>
                                        </div>
                                        <div className="field">
                                            <label>Tipo de Atendimento</label>
                                            <select style={{ width: '100%' }} value={agForm.tipo}
                                                onChange={e => setAgForm(p => ({ ...p, tipo: e.target.value }))}>
                                                <option value="">Selecione...</option>
                                                <option value="Primeira Avaliação">Primeira Avaliação</option>
                                                <option value="Retorno">Retorno</option>
                                                <option value="Procedimento">Procedimento/Cirurgia</option>
                                            </select>
                                        </div>
                                    </div>

                                    <div className="flex-inpus">
                                        <div className="field">
                                            <label>Data *</label>
                                            <input type="date" required style={{ width: '100%' }} value={agForm.data}
                                                onChange={e => setAgForm(p => ({ ...p, data: e.target.value }))} />
                                        </div>
                                        <div className="field">
                                            <label>Horário *</label>
                                            <input type="time" required style={{ width: '100%' }} value={agForm.hora}
                                                onChange={e => setAgForm(p => ({ ...p, hora: e.target.value }))} />
                                        </div>
                                    </div>

                                    <div className="field" style={{ marginBottom: '0' }}>
                                        <label>Motivo da Consulta</label>
                                        <input type="text" placeholder="Ex: Avaliação de dor, manutenção do aparelho..." style={{ width: '100%' }}
                                            value={agForm.motivo} onChange={e => setAgForm(p => ({ ...p, motivo: e.target.value }))} />
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', borderTop: '1px solid var(--LineColor)', paddingTop: '2rem', marginTop: '2.5rem' }}>
                                        <button type="button" onClick={() => setShowAgendamento(false)} className="submit"
                                            style={{ padding: '16px 24px', background: 'var(--BackColor)', color: 'var(--TextColor)', boxShadow: 'none' }}
                                            disabled={agEnviando}>Cancelar</button>
                                        <button type="submit" className="submit" style={{ padding: '16px 40px', background: 'var(--PrimaryColorsTheme)', boxShadow: '0 8px 20px rgba(22, 163, 74, 0.3)' }}
                                            disabled={agEnviando}>{agEnviando ? "Agendando..." : "Confirmar na Agenda"}</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )}
                {/* ------------------------------------------------ */}

                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem" }}>
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0', color: 'var(--PrimaryColorsTheme)', fontSize: '28px' }}>Atendimento & Recepção</h1>
                        <p className="text75">Gerencie os agendamentos e controle os pacientes na sala de espera.</p>
                    </div>
                    <button onClick={abrirModal} style={{ background: 'var(--PrimaryColorsTheme)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem', boxShadow: '0 4px 15px rgba(22, 163, 74, 0.3)', border: 'none', cursor: 'pointer' }}>
                        <span style={{ fontSize: '20px' }}>+</span> Agendar Nova Consulta
                    </button>
                </div>

                {/* BUSCA RÁPIDA */}
                <div className="camp-clinic camp-register" style={{ marginBottom: "2rem", padding: "1.5rem 2.5rem" }}>
                    <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
                        <div className="field" style={{ flex: 1, margin: 0, position: 'relative' }}>
                            <label style={{ color: 'var(--PrimaryColorsTheme)' }}>Busca Rápida de Paciente</label>
                            <input type="text" placeholder="Digite o nome, CPF ou Telefone..." style={{ margin: 0, width: '100%', maxWidth: 'none' }}
                                value={quickSearch} onChange={e => setQuickSearch(e.target.value)} />
                            {filteredQuick.length > 0 && (
                                <ul style={{ position: 'absolute', top: '100%', left: 0, width: '100%', background: 'white', border: '1px solid var(--LineColor)', borderRadius: '12px', listStyle: 'none', padding: '0.5rem', margin: '4px 0 0 0', boxShadow: '0 10px 25px rgba(0,0,0,0.15)', zIndex: 10 }}>
                                    {filteredQuick.map(p => (
                                        <li key={p.id} onClick={() => setQuickSearch(p.name)}
                                            style={{ padding: '12px', borderRadius: '8px', cursor: 'pointer', borderBottom: '1px solid var(--LineColor)' }}>
                                            <p style={{ fontWeight: 700, margin: 0, color: 'var(--PrimaryColorsTheme)' }}>{p.name}</p>
                                            <span style={{ fontSize: '12px', color: 'var(--TextColor75)' }}>CPF: {formatCPF(p.cpf)}</span>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                        <Link to="/employee/patients" className="submit" style={{ padding: '16px 32px', textAlign: 'center' }}>Acessar Ficha</Link>
                    </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
                    {/* AGENDA GERAL */}
                    <div className="camp-clinic" style={{ padding: '2.5rem' }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "1.5rem" }}>
                            <h2 style={{ margin: 0 }}>Agenda de Hoje</h2>
                        </div>

                        {consultasHoje.length === 0 ? (
                            <p className="text75" style={{ textAlign: 'center', padding: '2rem' }}>Nenhum agendamento para hoje.</p>
                        ) : (
                            <div className="table">
                                <div className="table-header" style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr' }}>
                                    <p className="text75">Horário</p>
                                    <p className="text75">Paciente</p>
                                    <p className="text75">Tipo</p>
                                    <p className="text75">Status</p>
                                </div>
                                <div className="table-body">
                                    {consultasHoje.map(c => (
                                        <div key={c.id} className="table-row" style={{ gridTemplateColumns: '1fr 1.5fr 1.5fr 1fr' }}>
                                            <p style={{ fontWeight: 600 }}>{c.consultation_date?.slice(11, 16)}</p>
                                            <p style={{ fontWeight: 500 }}>{c.patients?.name || "—"}</p>
                                            <p className="text75">{c.tipo_atendimento || "—"}</p>
                                            <p style={{ color: c.status === "Agendado" ? '#EAB308' : '#22C55E', fontWeight: 700 }}>{c.status}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* SALA DE ESPERA PLACEHOLDER */}
                    <div className="camp-clinic" style={{ padding: '2.5rem', background: 'linear-gradient(135deg, rgba(22, 163, 74, 0.03), rgba(255,255,255,1))', borderColor: 'rgba(22, 163, 74, 0.2)' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                            <h2 style={{ margin: '0', color: 'var(--PrimaryColorsTheme)' }}>Sala de Espera</h2>
                            <span style={{ background: 'var(--PrimaryColorsTheme)', color: 'white', padding: '2px 8px', borderRadius: '12px', fontWeight: 'bold', fontSize: '13px' }}>0</span>
                        </div>
                        <p className="text75" style={{ textAlign: 'center', marginTop: '2rem' }}>Nenhum paciente aguardando.</p>
                    </div>
                </div>

            </main>
        </>
    );
}

export default ReceptionDashboard;

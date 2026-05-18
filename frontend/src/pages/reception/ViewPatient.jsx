import { useState, useEffect } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetPaciente } from "../../services/api";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useReceptionSidebar } from "../../hooks/useSidebar";
import "../../styles/clinic.css";
import "../../styles/Forms.css";
import { formatCPF, formatPhone, formatDate, calcIdade } from "../../utils/formatters";

export default function ViewPatient() {
    const { token } = useAuth();
    const [searchParams] = useSearchParams();
    const pacienteId = searchParams.get("id");
    
    const [paciente, setPaciente] = useState(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("historico");

    // Menu da recepção
    const opc_bar = useReceptionSidebar("patients");

    useEffect(() => {
        if (!pacienteId) {
            setLoading(false);
            return;
        }

        const fetchPaciente = async () => {
            try {
                const data = await apiGetPaciente(token, pacienteId);
                setPaciente(data);
            } catch (error) {
                console.error("Erro ao buscar paciente", error);
            } finally {
                setLoading(false);
            }
        };

        fetchPaciente();
    }, [pacienteId, token]);

    if (loading) {
        return (
            <>
                <Section type_styles="employee" />
                <SideBar opc={opc_bar} styles="employee" />
                <main className="mainBar employee"><p>Carregando perfil do paciente...</p></main>
            </>
        );
    }

    if (!paciente) {
        return (
            <>
                <Section type_styles="employee" />
                <SideBar opc={opc_bar} styles="employee" />
                <main className="mainBar employee"><p>Paciente não encontrado. Retorne à listagem.</p></main>
            </>
        );
    }

    // Mapeia campos planos da tabela patients para o objeto anamnese
    const anamnese = {
        alergias: paciente.known_allergias,
        condicoes: paciente.systemic_conditions,
        medicacoes: paciente.continuous_medications,
        drogas: paciente.drug_use,
        cirurgias: paciente.surgeries_history,
        emergencia_nome: paciente.emergency_name,
        emergencia_telefone: paciente.emergency_phone,
    };

    return (
        <>
            <Section type_styles="employee" />
            <SideBar opc={opc_bar} styles="employee" />
            
            <main className="mainBar employee">
                {/* CABEÇALHO DO PRONTUÁRIO */}
                <div style={{background: 'var(--PrimaryColorsTheme)', borderRadius: '24px', padding: '2rem', color: 'white', display: 'flex', alignItems: 'center', gap: '2rem', marginBottom: '2rem', boxShadow: '0 10px 25px rgba(22, 163, 74, 0.2)'}}>
                    <div style={{width: '90px', height: '90px', borderRadius: '50%', background: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>
                        {paciente.gender === "Feminino" ? "👩🏽" : "👨🏻"}
                    </div>
                    <div>
                        <div style={{display: 'flex', alignItems: 'center', gap: '1rem'}}>
                            <h1 style={{margin: '0', fontSize: '28px'}}>{paciente.name}</h1>
                            <span style={{background: 'rgba(255,255,255,0.2)', padding: '4px 12px', borderRadius: '12px', fontSize: '13px', fontWeight: 600}}>{paciente.status}</span>
                        </div>
                        <div style={{display: 'flex', gap: '2rem', marginTop: '1rem', fontFamily: 'var(--font-secondary)'}}>
                            <span><strong style={{opacity: 0.8}}>CPF:</strong> {formatCPF(paciente.cpf)}</span>
                            <span><strong style={{opacity: 0.8}}>Nascimento:</strong> {formatDate(paciente.data_birth)} ({calcIdade(paciente.data_birth)} anos)</span>
                            <span><strong style={{opacity: 0.8}}>WhatsApp:</strong> {formatPhone(paciente.whatsapp)}</span>
                        </div>
                    </div>
                </div>

                {/* CONTROLE DE ABAS */}
                <ul className="tabs-bar" style={{marginBottom: '2rem'}}>
                    <li className={activeTab === "historico" ? "select" : ""} onClick={() => setActiveTab("historico")}>Histórico & Odontograma</li>
                    <li className={activeTab === "anamnese" ? "select" : ""} onClick={() => setActiveTab("anamnese")}>Anamnese (Ficha Médica)</li>
                    <li className={activeTab === "arquivos" ? "select" : ""} onClick={() => setActiveTab("arquivos")}>Arquivos & Imagens</li>
                    <li className={activeTab === "financeiro" ? "select" : ""} onClick={() => setActiveTab("financeiro")} style={{color: 'var(--PrimaryColorsTheme)', fontWeight: 'bold'}}>Financeiro e Cobranças</li>
                </ul>

                {/* ABA 1: HISTÓRICO CLINICO */}
                {activeTab === "historico" && (
                    <div className="forms-section" style={{animation: 'fadeIn 0.3s', padding: 0}}>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 300px', gap: '2rem'}}>
                            {/* LINHA DO TEMPO */}
                            <div>
                                <h3 style={{color: 'var(--PrimaryColorsTheme)', margin: '0 0 1.5rem 0'}}>Timeline de Atendimentos</h3>
                                <p style={{color: 'var(--TextColor75)'}}>Nenhum atendimento finalizado ainda.</p>
                            </div>

                            {/* ALERTAS */}
                            <div>
                                <h3 style={{color: 'var(--PrimaryColorsTheme)', margin: '0 0 1.5rem 0'}}>Alertas Médicos</h3>
                                {anamnese.alergias ? (
                                    <div style={{background: '#FEF2F2', border: '1px solid #FCA5A5', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', color: '#991B1B'}}>
                                        <strong>Alergia Medicamentosa:</strong>
                                        <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>{anamnese.alergias}</p>
                                    </div>
                                ) : null}

                                {anamnese.condicoes ? (
                                    <div style={{background: '#FFFBEB', border: '1px solid #FCD34D', padding: '1rem', borderRadius: '12px', color: '#92400E'}}>
                                        <strong>Condição Sistêmica:</strong>
                                        <p style={{margin: '4px 0 0 0', fontSize: '14px'}}>{anamnese.condicoes}</p>
                                    </div>
                                ) : null}

                                {(!anamnese.alergias && !anamnese.condicoes) && (
                                    <p style={{fontSize: '13px', color: 'var(--TextColor75)'}}>Tudo verde. Nenhum alerta crítico reportado na anamnese inicial.</p>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 2: ANAMNESE COMPLETA (Dinâmica via JSONB) */}
                {activeTab === "anamnese" && (
                    <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                        <h3 style={{color: 'var(--PrimaryColorsTheme)', margin: '0 0 1.5rem 0'}}>Registro Sistêmico</h3>
                        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem'}}>
                            <div>
                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Condições Sistêmicas (Doenças)?</p>
                                <p style={{margin: '0 0 24px 0'}}>{anamnese.condicoes || "Negado."}</p>

                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Medicações em Uso Contínuo?</p>
                                <p style={{margin: '0 0 24px 0'}}>{anamnese.medicacoes || "Nega uso."}</p>
                                
                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Uso de Drogas, Fumo ou Álcool?</p>
                                <p style={{margin: '0 0 24px 0'}}>{anamnese.drogas || "Nenhum."}</p>
                            </div>
                            <div>
                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Alergias a Medicamentos/Outros?</p>
                                <p style={{margin: '0 0 24px 0', color: anamnese.alergias ? '#B91C1C' : 'inherit', fontWeight: anamnese.alergias ? 700 : 400}}>{anamnese.alergias || "Nega alergias conhecidas."}</p>

                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Cirurgias e Hemorragias Anteriores?</p>
                                <p style={{margin: '0 0 24px 0'}}>{anamnese.cirurgias || "Nenhuma relatada."}</p>

                                <p style={{fontWeight: 700, margin: '0 0 8px 0', color: 'var(--TextColor75)'}}>Contato de Emergência</p>
                                <p style={{margin: '0 0 24px 0'}}>{anamnese.emergencia_nome ? `${anamnese.emergencia_nome} (${formatPhone(anamnese.emergencia_telefone)})` : "-"}</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 3: ARQUIVOS (Laudos, Raio-X) */}
                {activeTab === "arquivos" && (
                    <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem'}}>
                            <h3 style={{color: 'var(--PrimaryColorsTheme)', margin: 0}}>Imagens e Laudos</h3>
                            <label className="submit" style={{cursor: 'pointer', margin: 0}}>
                                📁 Fazer Upload Novo
                                <input type="file" style={{display: 'none'}} />
                            </label>
                        </div>
                        
                        <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '1.5rem'}}>
                            {/* ARQUIVO 1 */}
                            <div style={{border: '1px solid var(--LineColor)', borderRadius: '16px', padding: '1rem', textAlign: 'center'}}>
                                <div style={{width: '100%', height: '120px', background: '#F1F5F9', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px'}}>
                                    🦷
                                </div>
                                <p style={{fontWeight: 700, margin: '0 0 4px 0', fontSize: '14px'}}>Panorâmica Jan/2026</p>
                                <p style={{color: 'var(--TextColor75)', margin: 0, fontSize: '12px'}}>Adicionado por Dr. Lucas</p>
                            </div>
                            {/* ARQUIVO 2 */}
                            <div style={{border: '1px solid var(--LineColor)', borderRadius: '16px', padding: '1rem', textAlign: 'center'}}>
                                <div style={{width: '100%', height: '120px', background: '#F1F5F9', borderRadius: '8px', marginBottom: '1rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '40px'}}>
                                    📄
                                </div>
                                <p style={{fontWeight: 700, margin: '0 0 4px 0', fontSize: '14px'}}>Laudo Cirúrgico</p>
                                <p style={{color: 'var(--TextColor75)', margin: 0, fontSize: '12px'}}>Adicionado por Dra. Ana</p>
                            </div>
                        </div>
                    </div>
                )}

                {/* ABA 4: FINANCEIRO (Feita pela recepção) */}
                {activeTab === "financeiro" && (
                    <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                        <div style={{display: 'grid', gridTemplateColumns: '2fr 1.5fr', gap: '2rem'}}>
                            <div>
                                <h3 style={{color: 'var(--PrimaryColorsTheme)', margin: '0 0 1.5rem 0'}}>Lançar Novo Faturamento</h3>
                                <div style={{background: 'var(--PrimaryColorsBack)', padding: '1.5rem', borderRadius: '16px', border: '1px solid var(--LineColor)'}}>
                                    <div className="field" style={{marginBottom: '1rem'}}>
                                        <label>Procedimento Vinculado</label>
                                        <input type="text" placeholder="Ex: Limpeza (Realizada por Dr. Lucas) hoje..." style={{width: '100%'}} />
                                    </div>
                                    <div className="flex-inpus">
                                        <div className="field" style={{margin: 0}}>
                                            <label>Valor Cobrado (R$)</label>
                                            <input type="number" placeholder="Ex: 350,00" style={{width: '100%'}} />
                                        </div>
                                        <div className="field" style={{margin: 0}}>
                                            <label>Forma de Pagamento</label>
                                            <select style={{width: '100%'}}>
                                                <option>PIX (Recebido)</option>
                                                <option>Cartão de Crédito (Recebido)</option>
                                                <option>A Faturar / Fiado (Pendente)</option>
                                            </select>
                                        </div>
                                    </div>
                                    <button className="submit" style={{marginTop: '1.5rem', width: '100%'}}>Salvar Cobrança e Atribuir ao Dr.</button>
                                </div>
                            </div>
                            
                            <div>
                                <h3 style={{color: 'var(--TextColor)', margin: '0 0 1.5rem 0'}}>Extrato do Paciente</h3>
                                <div style={{borderLeft: '4px solid #22C55E', paddingLeft: '1rem', marginBottom: '1rem'}}>
                                    <p style={{margin: '0 0 4px 0', fontWeight: 700}}>R$ 250,00 - Recebido via PIX</p>
                                    <p style={{margin: 0, color: 'var(--TextColor75)', fontSize: '13px'}}>Restauração Resina (10/03/2026)</p>
                                </div>
                                <div style={{borderLeft: '4px solid #EAB308', paddingLeft: '1rem', marginBottom: '1rem'}}>
                                    <p style={{margin: '0 0 4px 0', fontWeight: 700}}>R$ 1.500,00 - À vista</p>
                                    <p style={{margin: 0, color: 'var(--TextColor75)', fontSize: '13px'}}>Entrada Aparelho (01/01/2026)</p>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </>
    );
}

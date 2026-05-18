import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetPacientes } from "../../services/api";
import { formatCPF, formatPhone } from "../../utils/formatters";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useSpecialistSidebar } from "../../hooks/useSidebar";

export default function SpecialistListPatients() {
    const { token } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    const opc_bar = useSpecialistSidebar("patients");

    useEffect(() => {
        const fetchPacientes = async () => {
            try {
                const data = await apiGetPacientes(token);
                setPacientes(data);
            } catch (error) {
                console.error("Erro ao carregar pacientes", error);
            } finally {
                setLoading(false);
            }
        };
        fetchPacientes();
    }, [token]);

    const pacientesFiltrados = pacientes.filter(p => {
        const query = busca.toLowerCase();
        return (
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.cpf && p.cpf.includes(query)) ||
            (p.whatsapp && p.whatsapp.includes(query))
        );
    });

    return (
        <>
            <Section type_styles="specialist" />
            <SideBar opc={opc_bar} styles="specialist" />
            
            <main className="mainBar specialist">
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem"}}>
                    <div>
                        <h1 style={{margin: '0 0 0.5rem 0', color: 'var(--PrimaryColorsTheme)', fontSize: '28px'}}>Meus Pacientes</h1>
                        <p className="text75">Acesse o acervo de pacientes que já passaram no seu consultório.</p>
                    </div>
                </div>

                <div className="camp-clinic camp-view">
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <input 
                            type="text" 
                            placeholder="Buscar prontuário clínico por nome ou CPF..." 
                            style={{flex: 1}} 
                            value={busca}
                            onChange={(e) => setBusca(e.target.value)}
                        />
                        <button className="submit" style={{padding: '12px 32px'}}>Pesquisar</button>
                    </div>

                    <div className="table" style={{marginTop: '2rem'}}>
                        <div className="table-header" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr'}}>
                            <p className="text75">Paciente</p>
                            <p className="text75">Celular</p>
                            <p className="text75">Última Consulta</p>
                            <p className="text75">Status Médico</p>
                            <p className="text75" style={{textAlign: 'right'}}>Ação</p>
                        </div>
                        <div className="table-body">
                            {loading ? (
                                <div style={{padding: '2rem', textAlign: 'center', color: 'var(--TextColor75)'}}>Carregando base de dados...</div>
                            ) : pacientesFiltrados.length === 0 ? (
                                <div style={{padding: '2rem', textAlign: 'center', color: 'var(--TextColor75)'}}>Nenhum paciente designado ainda.</div>
                            ) : (
                                pacientesFiltrados.map((p, idx) => (
                                    <div key={p.id} className="table-row" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', borderBottom: idx === pacientesFiltrados.length - 1 ? 'none' : '1px solid var(--LineColor)'}}>
                                        <div><p style={{fontWeight: 700}}>{p.name}</p><span style={{fontSize: '12px', color: 'var(--TextColor75)'}}>{formatCPF(p.cpf)}</span></div>
                                        <p style={{fontFamily: 'var(--font-secondary)'}}>{formatPhone(p.whatsapp)}</p>
                                        <p>-</p>
                                        <p style={{color: p.status === 'Ativo' ? '#EAB308' : '#22C55E', fontWeight: 700}}>{p.status === 'Ativo' ? "Em Andamento" : "Alta Médica"}</p>
                                        <div style={{textAlign: 'right'}}>
                                            <Link to={`/specialist/patient/view?id=${p.id}`} className="submit" style={{padding: '6px 16px', fontSize: '13px', background: 'var(--LineColor)', color: 'var(--TextColor)', boxShadow: 'none', display: 'inline-block'}}>Abrir Prontuário</Link>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

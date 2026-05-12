import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetPacientes } from "../../services/api";
import { formatCPF, formatPhone } from "../../utils/formatters";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import { useReceptionSidebar } from "../../hooks/useSidebar";
import '../../styles/clinic.css';

/* MAIN COMPONENT */
function ListPacient() {
    const { token } = useAuth();
    const [pacientes, setPacientes] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    // Menu da recepção
    const opc_bar = useReceptionSidebar("patients");

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
            (p.nome && p.nome.toLowerCase().includes(query)) ||
            (p.cpf && p.cpf.includes(query)) ||
            (p.telefone_whatsapp && p.telefone_whatsapp.includes(query))
        );
    });

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />
            
            <main className="mainBar owner">
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "2rem"}}>
                    <div>
                        <h1 style={{margin: '0 0 0.5rem 0', color: 'var(--PrimaryColorsTheme)', fontSize: '28px'}}>Pacientes</h1>
                        <p className="text75">Listagem completa de todos os pacientes da clinica</p>
                    </div>
                    <div>
                        <Link to="/reception/patient/register" style={{background: 'var(--PrimaryColorsTheme)', color: 'white', padding: '12px 24px', borderRadius: '12px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem'}}>
                            + Cadastrar Novo Paciente
                        </Link>
                    </div>
                </div>

                <div className="camp-clinic camp-view">
                    <div style={{display: 'flex', gap: '1rem'}}>
                        <input 
                            type="text" 
                            placeholder="Buscar por Nome, Telefone ou CPF..." 
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
                            <p className="text75">Status</p>
                            <p className="text75" style={{textAlign: 'right'}}>Ação</p>
                        </div>
                        
                        <div className="table-body">
                            {loading ? (
                                <div style={{padding: '2rem', textAlign: 'center', color: 'var(--TextColor75)'}}>Carregando base de dados...</div>
                            ) : pacientesFiltrados.length === 0 ? (
                                <div style={{padding: '2rem', textAlign: 'center', color: 'var(--TextColor75)'}}>Nenhum paciente encontrado. Crie seu primeiro paciente!</div>
                            ) : (
                                pacientesFiltrados.map((p, idx) => (
                                    <div key={p.id} className="table-row" style={{gridTemplateColumns: '1.5fr 1fr 1fr 1fr 1fr', borderBottom: idx === pacientesFiltrados.length - 1 ? 'none' : '1px solid var(--LineColor)'}}>
                                        <div><p style={{fontWeight: 700}}>{p.nome}</p><span style={{fontSize: '12px', color: 'var(--TextColor75)'}}>{formatCPF(p.cpf)}</span></div>
                                        <p style={{fontFamily: 'var(--font-secondary)'}}>{formatPhone(p.telefone_whatsapp)}</p>
                                        <p>-</p>
                                        <p style={{color: p.status === 'Ativo' ? '#22C55E' : 'var(--TextColor75)', fontWeight: 700}}>{p.status || "Ativo"}</p>
                                        <div style={{textAlign: 'right'}}><Link to={`/reception/patient/view?id=${p.id}`} className="submit" style={{padding: '6px 16px', fontSize: '13px', background: 'var(--LineColor)', color: 'var(--TextColor)', boxShadow: 'none', display: 'inline-block'}}>Ver Ficha</Link></div>
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

export default ListPacient;

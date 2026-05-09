import { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiGetClinic } from "../../services/api";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import Card from "../../components/card/CardInfo";
import IMG from "../../assets/img/icon01.png";
import { useOwnerSidebar } from "../../hooks/useSidebar";
import ButtonP from "../../components/buttons/ButtonsRediText";
import '../../styles/clinic.css';

function ViewClinic() {
    const { id } = useParams();
    const { token } = useAuth();
    const navigate = useNavigate();

    const [clinica, setClinica] = useState(null);
    const [loading, setLoading] = useState(true);

    const opc_bar = useOwnerSidebar("clinic");

    useEffect(() => {
        apiGetClinic(token, id)
            .then(data => setClinica(data))
            .catch(() => navigate("/owner/clinic"))
            .finally(() => setLoading(false));
    }, [id, token]);

    if (loading) {
        return (
            <>
                <Section type_styles="owner" />
                <SideBar opc={opc_bar} styles="owner" />
                <main className="mainBar owner"><p className="text75">Carregando clínica...</p></main>
            </>
        );
    }

    if (!clinica) return null;

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />

            <main className="mainBar owner">
                <Link className="view-back-link text75" to="/owner/clinic">← Voltar para Minhas Clínicas</Link>

                <div className="view-header">
                    <div className="circle">
                        <img src={clinica.logo || IMG} alt="Logo" />
                    </div>
                    <div className="text">
                        <h1>{clinica.nome}</h1>
                        <p>{clinica.cnpj} | {clinica.whatsapp}</p>
                        <Link to={`/owner/edit-clinic/${id}`}>Editar Informações da Clínica</Link>
                    </div>
                </div>

                <div className="camp-clinic camp-view">
                    <div>
                        <h2>Informações Gerais</h2>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
                            <p className="text75" style={{ margin: 0 }}>Filtro de Tempo:</p>
                            <select style={{ width: 'auto' }}>
                                <option>Hoje</option>
                                <option>Nesta semana</option>
                                <option>Neste mês</option>
                                <option>Este ano</option>
                            </select>
                        </div>
                        <div className="cards">
                            <Card title="Nº Pacientes Cadastrados" date="0" />
                            <Card title="Nº Consultas Cadastradas" date="0" />
                            <Card title="Nº de Consultas Finalizadas" date="0" />
                        </div>
                    </div>

                    <div style={{ marginTop: '1rem' }}>
                        <h2>Membros da Equipe</h2>
                        <div className="cards">
                            <Card title="Nº de Especialistas Ativos" date="0" />
                            <Card title="Nº de Atendimentos Ativos" date="0" />
                        </div>
                        <div style={{ width: "100%", display: "flex", justifyContent: "flex-end", marginTop: "2rem" }}>
                            <ButtonP text={"Gerenciar Equipe"} url={`/owner/bind-clinic/${id}`} />
                        </div>
                    </div>
                </div>
            </main>
        </>
    );
}

export default ViewClinic;

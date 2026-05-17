import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiGetClinics } from "../../../services/api";
import { useOwnerSidebar } from "../../../hooks/useSidebar";

import Section from "../../../components/section/SectionAuth";
import SideBar from "../../../components/bar/SideBar";
import CampNotList from "../../../components/camp/NotList";
import CampList from "../../../components/camp/ListClinic";
import IMG from "../../../assets/img/icon01.png";

import "../../../styles/clinic.css";
import "../../../styles/Input.css";

function TeamClinic() {

    const { token } = useAuth();

    const [clinicas, setClinicas] = useState([]);
    const [busca, setBusca] = useState("");
    const [loading, setLoading] = useState(true);

    const opc_bar = useOwnerSidebar("team");

    /* CARREGAR CLÍNICAS */
    useEffect(() => {

        if (!token) return;

        apiGetClinics(token)
            .then((data) => {
                setClinicas(data || []);
            })
            .catch((error) => {
                console.error("Erro ao carregar clínicas", error);
            })
            .finally(() => {
                setLoading(false);
            });

    }, [token]);

    /* FILTRO DE BUSCA */
    const clinicasFiltradas = clinicas.filter((c) =>
        c.nome?.toLowerCase().includes(busca.toLowerCase()) ||
        c.cnpj?.includes(busca)
    );

    return (
        <>
            {/* HEADER DO SISTEMA */}
            <Section type_styles="owner" />

            {/* SIDEBAR */}
            <SideBar
                opc={opc_bar}
                styles="owner"
            />

            {/* CONTEÚDO */}
            <main className="mainBar owner">

                {/* TOPO */}
                <div>
                    <h1
                        style={{
                            margin: 0,
                            fontSize: "28px",
                            color: "var(--PrimaryColorsTheme)"
                        }}
                    >
                        Equipe da Clínica
                    </h1>

                    <p className="text75">
                        Selecione uma clínica para visualizar a sua equipe associados.
                    </p>
                </div>

                {/* INPUT DE BUSCA */}
                <div style={{ marginTop: "1rem" }}>
                    <input
                        type="text"
                        placeholder="Buscar clínica por nome ou CNPJ..."
                        value={busca}
                        onChange={(e) => setBusca(e.target.value)}
                        style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--LineColor)",
                            width: "100%",
                            maxWidth: "400px"
                        }}
                    />
                </div>

                {/* LISTAGEM */}
                <div
                    className="camp-clinic camp-list"
                    style={{ marginTop: "1rem" }}
                >

                    <h2
                        style={{
                            margin: "0 0 1rem 0",
                            fontSize: "20px"
                        }}
                    >
                        Clínicas
                    </h2>

                    {/* LOADING */}
                    {loading ? (

                        <p className="text75">
                            Carregando clínicas...
                        </p>

                    ) : clinicasFiltradas.length === 0 ? (

                        <CampNotList
                            img={IMG}
                            text_p="Nenhuma clínica encontrada"
                            text_l="Você ainda não possui clínicas vinculadas."
                        />

                    ) : (

                        clinicasFiltradas.map((item) => (

                            <CampList
                                key={item.id}

                                clinic_url={`/owner/team/${item.id}`}

                                clinic_id={item.id}
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

export default TeamClinic;
import { useState, useEffect } from "react";
import { useAuth } from "../../../context/AuthContext";
import { apiGetClinics, apiDeleteClinic } from "../../../services/api";
import { useOwnerSidebar } from "../../../hooks/useSidebar";

import Section from "../../../components/section/SectionAuth";
import ButtonH1 from "../../../components/buttons/ButtonsRediTitle";
import SideBar from "../../../components/bar/SideBar";
import CampNotList from "../../../components/camp/NotList";
import CampList from "../../../components/camp/ListClinic";
import AlertConfirm from "../../../components/alerts/AlertConfirm";
import IMG from "../../../assets/img/icon01.png";

import "../../../styles/clinic.css";
import "../../../styles/Input.css";

function ListClinic() {

    const {
        token,
        refreshUser
    } = useAuth();

    const [clinicas, setClinicas] = useState([]);

    const [busca, setBusca] = useState("");

    const [loading, setLoading] = useState(true);

    const [confirmDelete, setConfirmDelete] = useState(null);

    const opc_bar = useOwnerSidebar("clinic");

    useEffect(() => {

        apiGetClinics(token)

            .then((data) => {

                setClinicas(data);

            })

            .catch((err) => {

                console.error(
                    "Erro ao carregar clínicas",
                    err
                );

            })

            .finally(() => {

                setLoading(false);

            });

    }, [token]);

    async function handleDeleteConfirmado() {

        if (!confirmDelete) return;

        try {

            await apiDeleteClinic(
                token,
                confirmDelete.id
            );

            setClinicas((prev) =>
                prev.filter(
                    (c) => c.id !== confirmDelete.id
                )
            );

            await refreshUser();

            setConfirmDelete(null);

        } catch (err) {

            console.error(err);

        }

    }

    function handleDelete(clinicaId, nome) {

        setConfirmDelete({id: clinicaId, nome: nome});

    }

    const clinicasFiltradas = clinicas.filter(
        (c) =>
            c.name
                ?.toLowerCase()
                .includes(
                    busca.toLowerCase()
                ) ||

            c.cnpj?.includes(busca)
    );

    return (
        <>
            <Section type_styles="owner" />

            <SideBar
                opc={opc_bar}
                styles="owner"
            />

            {
                confirmDelete && (

                    <AlertConfirm styles="owner"

                        title="Deseja Excluir a Clínica Mesmo?"

                        text={`
                            Todo o conteúdo vinculado à
                            "${confirmDelete.nome}"
                            será deletado.

                            Ao realizar a exclusão,
                            não haverá volta.
                        `}

                        onCancel={() =>
                            setConfirmDelete(null)
                        }

                        onConfirm={() =>
                            handleDeleteConfirmado()
                        }

                    />

                )
            }

            <main className="mainBar owner">

                <div
                    style={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                    }}
                >

                    <div>

                        <h1
                            style={{
                                margin: 0,
                                fontSize: "28px",
                                color: "var(--PrimaryColorsTheme)",
                            }}
                        >
                            Minhas Clínicas
                        </h1>

                        <p className="text75">
                            Gerencie as clínicas cadastradas em sua conta
                        </p>

                    </div>

                    <ButtonH1
                        text={"Registrar Nova Clínica"}
                        url="/owner/clinic/register"
                    />

                </div>

                <div
                    style={{
                        marginTop: "1rem"
                    }}
                >

                    <input
                        type="text"
                        placeholder="Buscar clínica por nome ou CNPJ..."
                        value={busca}
                        onChange={(e) =>
                            setBusca(e.target.value)
                        }
                        style={{
                            padding: "14px 16px",
                            borderRadius: "12px",
                            border: "1px solid var(--LineColor)",
                            width: "100%",
                            maxWidth: "400px",
                        }}
                    />

                </div>

                <div
                    className="camp-clinic camp-list"
                    style={{
                        marginTop: "1rem"
                    }}
                >

                    <h2
                        style={{
                            margin: "0 0 1rem 0",
                            fontSize: "20px",
                        }}
                    >
                        Clínicas Registradas
                    </h2>

                    {loading ? (

                        <p className="text75">
                            Carregando clínicas...
                        </p>

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
                                clinic_name={item.name}
                                clinic_cnpj={item.cnpj}
                                clinic_phone={item.whatsapp}
                                onDelete={() =>
                                    handleDelete(
                                        item.id,
                                        item.name
                                    )
                                }
                            />

                        ))

                    )}

                </div>

            </main>
        </>
    );

}

export default ListClinic;
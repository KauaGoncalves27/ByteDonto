import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { useAuth } from "../../../context/AuthContext";
import { apiCriarPaciente } from "../../../services/api";
import { maskCPF, maskPhone, maskRG } from "../../../utils/formatters";
import Section from "../../../components/section/SectionAuth";
import SideBar from "../../../components/bar/SideBar";
import { useOwnerSidebar } from "../../../hooks/useSidebar";
import '../../../styles/clinic.css';
import '../../../styles/Forms.css';

/* MAIN COMPONENT */
function RegisterPacient() {
    const { token } = useAuth();
    const navigate = useNavigate();
    const { id_clinic } = useParams();

    const [loading, setLoading] = useState(false);

    const [nome, setNome] = useState("");
    const [cpf, setCpf] = useState("");
    const [rg, setRg] = useState("");
    const [data_nascimento, setDataNascimento] = useState("");
    const [genero, setGenero] = useState("Feminino");

    const [tel_whatsapp, setTelWhatsapp] = useState("");
    const [tel_celular, setTelCelular] = useState("");
    const [email, setEmail] = useState("");
    const [emerg_nome, setEmergNome] = useState("");
    const [emerg_tel, setEmergTel] = useState("");

    const [pais, setPais] = useState("");
    const [estado, setEstado] = useState("");
    const [cidade, setCidade] = useState("");
    const [endereco_completo, setEnderecoCompleto] = useState("");

    const [alergias, setAlergias] = useState("");
    const [condicoes, setCondicoes] = useState("");
    const [medicacoes, setMedicacoes] = useState("");
    const [drogas, setDrogas] = useState("");
    const [cirurgias, setCirurgias] = useState("");

    const opc_bar = useOwnerSidebar("patients");

    async function handleSubmit(e) {
        e.preventDefault();
        setLoading(true);

        const payload = {
            nome,
            cpf: cpf.replace(/\D/g, ''),
            rg,
            data_nascimento,
            genero,
            email,
            telefone_whatsapp: tel_whatsapp.replace(/\D/g, ''),
            endereco: {
                pais,
                estado,
                cidade,
                logradouro: endereco_completo,
            },
            anamnese: {
                alergias,
                condicoes,
                medicacoes,
                drogas,
                cirurgias,
                emergencia_nome: emerg_nome,
                emergencia_telefone: emerg_tel.replace(/\D/g, ''),
            },
        };

        try {
            await apiCriarPaciente(token, payload);
            alert("Paciente cadastrado com sucesso!");
            navigate(`/owner/pacients/${id_clinic}`);
        } catch (err) {
            alert(err.message || "Erro ao cadastrar paciente.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <>
            <Section type_styles="owner" />
            <SideBar opc={opc_bar} styles="owner" />

            <main className="mainBar owner register">
                <p>
                    <Link className="text75" to={`/owner/pacients/${id_clinic}`}>← Voltar</Link>
                </p>
                <div className="camp-clinic camp-register">
                    <div>
                        <h1 style={{ margin: '0 0 0.5rem 0' }}>Cadastrar o Paciente</h1>
                        <p className="text75">Preencha os dados abaixo dos pacientes para melhor triagem de consulta.</p>

                        <form onSubmit={handleSubmit} style={{ marginTop: '2rem' }}>

                            <div className="forms-section">
                                <p className="sec-title">Identificação Básicos</p>

                                <div className="field">
                                    <label htmlFor="nome">Nome Completo *</label>
                                    <input
                                        id="nome"
                                        type="text"
                                        value={nome}
                                        onChange={e => setNome(e.target.value)}
                                        required
                                    />
                                </div>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label htmlFor="cpf">CPF *</label>
                                        <input
                                            id="cpf"
                                            type="text"
                                            value={cpf}
                                            onChange={e => setCpf(maskCPF(e.target.value))}
                                            required
                                            placeholder="000.000.000-00"
                                            maxLength={14}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="rg">RG *</label>
                                        <input
                                            id="rg"
                                            type="text"
                                            value={rg}
                                            onChange={e => setRg(maskRG(e.target.value))}
                                            placeholder="Apenas números"
                                            maxLength={9}
                                        />
                                    </div>
                                </div>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label htmlFor="data_nascimento">Data de Nascimento *</label>
                                        <input
                                            id="data_nascimento"
                                            type="date"
                                            value={data_nascimento}
                                            onChange={e => setDataNascimento(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="genero">Gênero *</label>
                                        <select id="genero" value={genero} onChange={e => setGenero(e.target.value)}>
                                            <option>Feminino</option>
                                            <option>Masculino</option>
                                            <option>Outro</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            <div className="forms-section">
                                <p className="sec-title">Informações de Contato</p>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label htmlFor="tel_whatsapp">Telefone Whatsapp *</label>
                                        <input
                                            id="tel_whatsapp"
                                            type="text"
                                            value={tel_whatsapp}
                                            onChange={e => setTelWhatsapp(maskPhone(e.target.value))}
                                            required
                                            placeholder="(DD) 90000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="tel_celular">Telefone Celular *</label>
                                        <input
                                            id="tel_celular"
                                            type="text"
                                            value={tel_celular}
                                            onChange={e => setTelCelular(maskPhone(e.target.value))}
                                            placeholder="(DD) 90000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="email">Email *</label>
                                    <input
                                        id="email"
                                        type="email"
                                        value={email}
                                        onChange={e => setEmail(e.target.value)}
                                        placeholder="paciente@email.com"
                                    />
                                </div>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label htmlFor="emerg_nome">Nome Contato de Emergência *</label>
                                        <input
                                            id="emerg_nome"
                                            type="text"
                                            value={emerg_nome}
                                            onChange={e => setEmergNome(e.target.value)}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="emerg_tel">Telefone Contato de Emergência *</label>
                                        <input
                                            id="emerg_tel"
                                            type="text"
                                            value={emerg_tel}
                                            onChange={e => setEmergTel(maskPhone(e.target.value))}
                                            placeholder="(DD) 90000-0000"
                                            maxLength={15}
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="forms-section">
                                <p className="sec-title">Endereço</p>

                                <div className="field">
                                    <label htmlFor="pais">País *</label>
                                    <input
                                        id="pais"
                                        type="text"
                                        value={pais}
                                        onChange={e => setPais(e.target.value)}
                                    />
                                </div>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label htmlFor="estado">Estado *</label>
                                        <input
                                            id="estado"
                                            type="text"
                                            value={estado}
                                            onChange={e => setEstado(e.target.value)}
                                        />
                                    </div>
                                    <div className="field">
                                        <label htmlFor="cidade">Cidade *</label>
                                        <input
                                            id="cidade"
                                            type="text"
                                            value={cidade}
                                            onChange={e => setCidade(e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="field">
                                    <label htmlFor="endereco_completo">Endereço Completo *</label>
                                    <input
                                        id="endereco_completo"
                                        type="text"
                                        value={endereco_completo}
                                        onChange={e => setEnderecoCompleto(e.target.value)}
                                    />
                                </div>
                            </div>

                            <div className="forms-section">
                                <p className="sec-title">Anamnese e Saúde Geral</p>

                                <div className="field">
                                    <label htmlFor="alergias">Alergias Conhecidas *</label>
                                    <textarea
                                        id="alergias"
                                        value={alergias}
                                        onChange={e => setAlergias(e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="condicoes">Condições Sistêmicas *</label>
                                    <textarea
                                        id="condicoes"
                                        value={condicoes}
                                        onChange={e => setCondicoes(e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="medicacoes">Medicações em Uso Contínuo *</label>
                                    <textarea
                                        id="medicacoes"
                                        value={medicacoes}
                                        onChange={e => setMedicacoes(e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="drogas">Drogas Recreativas de uso lícito e ilícito *</label>
                                    <textarea
                                        id="drogas"
                                        value={drogas}
                                        onChange={e => setDrogas(e.target.value)}
                                        rows="3"
                                    />
                                </div>

                                <div className="field">
                                    <label htmlFor="cirurgias">Cirurgias Prévias e Histórico de Cicatrização/Sangramento *</label>
                                    <textarea
                                        id="cirurgias"
                                        value={cirurgias}
                                        onChange={e => setCirurgias(e.target.value)}
                                        rows="3"
                                    />
                                </div>
                            </div>

                            <div style={{ display: "flex", justifyContent: "end", marginTop: '2rem' }}>
                                <button type="submit" className="submit" disabled={loading}>
                                    {loading ? "Salvando..." : "Salvar Paciente"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </main>
        </>
    );
}

/* STANDARD EXPORT */
export default RegisterPacient;

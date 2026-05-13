import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiCriarPaciente } from "../../services/api";
import { maskCPF, maskPhone, maskCEP } from "../../utils/formatters";
import Section from "../../components/section/SectionAuth";
import SideBar from "../../components/bar/SideBar";
import IMG from "../../assets/img/icon01.png";
import '../../styles/clinic.css';
import '../../styles/Forms.css';

/* MAIN COMPONENT */
function RegisterPatient() {
    const { token } = useAuth();
    const navigate = useNavigate();

    // Menu da recepção
    const opc_bar = [
        { id: 1, icon: IMG, name: "Painel Principal", url: "/employee/dashboard", style: "" },
        { id: 3, icon: IMG, name: "Pacientes", url: "/employee/patients", style: "select" }
    ];

    // Controle de Abas
    const [activeTab, setActiveTab] = useState("dados");
    const [isLoading, setIsLoading] = useState(false);

    // Estados Core (Aba 1 e Aba 3)
    const [formData, setFormData] = useState({
        nome: '', cpf: '', rg: '', data_nascimento: '', genero: 'Feminino',
        telefone_whatsapp: '', email: '', emerg_nome: '', emerg_tel: '',
        alergias: '', condicoes: '', medicacoes: '', drogas: '', cirurgias: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;
        if (name === "cpf") {
            setFormData({ ...formData, cpf: maskCPF(value) });
        } else if (name === "telefone_whatsapp") {
            setFormData({ ...formData, telefone_whatsapp: maskPhone(value) });
        } else if (name === "emerg_tel") {
            setFormData({ ...formData, emerg_tel: maskPhone(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    };

    // Estados de Endereço (Aba 2)
    const [cep, setCep] = useState("");
    const [rua, setRua] = useState("");
    const [bairro, setBairro] = useState("");
    const [cidade, setCidade] = useState("");
    const [estado, setEstado] = useState("");
    const [numero, setNumero] = useState("");

    const buscarCEP = async () => {
        const cepLimpo = cep.replace(/\D/g, '');
        if (cepLimpo.length !== 8) return;
        
        try {
            const response = await fetch(`https://viacep.com.br/ws/${cepLimpo}/json/`);
            const data = await response.json();
            
            if (!data.erro) {
                setRua(data.logradouro);
                setBairro(data.bairro);
                setCidade(data.localidade);
                setEstado(data.uf);
            }
        } catch (error) {
            console.error("Erro ao buscar CEP", error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);

        // Montagem avançada de JSON usando a estratégia JSONB combinada com a API Python
        const payload = {
            nome: formData.nome,
            email: formData.email,
            telefone_whatsapp: formData.telefone_whatsapp.replace(/\D/g, ''),
            cpf: formData.cpf.replace(/\D/g, ''),
            rg: formData.rg,
            data_nascimento: formData.data_nascimento,
            genero: formData.genero,
            endereco: {
                cep: cep.replace(/\D/g, ''),
                rua: rua,
                bairro: bairro,
                cidade: cidade,
                estado: estado,
                numero: numero
            },
            anamnese: {
                alergias: formData.alergias,
                condicoes: formData.condicoes,
                medicacoes: formData.medicacoes,
                drogas: formData.drogas,
                cirurgias: formData.cirurgias,
                emergencia_nome: formData.emerg_nome,
                emergencia_telefone: formData.emerg_tel.replace(/\D/g, '')
            }
        };

        try {
            await apiCriarPaciente(token, payload);
            alert("Paciente cadastrado com sucesso!");
            navigate("/employee/patients");
        } catch (err) {
            alert(`Erro: ${err.message}`);
            console.error(err);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            <Section type_styles="employee" />
            <SideBar opc={opc_bar} styles="employee" />
            
            <main className="mainBar employee register">
                <p>
                    <Link className="text75" to="/employee/dashboard">← Voltar para Dashboard</Link>
                </p>

                <div className="camp-clinic camp-register" style={{marginTop: '1rem'}}>
                    <div style={{marginBottom: "2rem"}}>
                        <h1 style={{margin: '0 0 0.5rem 0', color: 'var(--PrimaryColorsTheme)', fontSize: '28px'}}>Cadastrar Novo Paciente</h1>
                        <p className="text75">Preencha a Ficha Clínica e Anamnese. Estes dados ficarão salvos no prontuário.</p>
                    </div>

                    {/* WIZARD TABS */}
                    <div style={{display: 'flex', gap: '1rem', borderBottom: '2px solid rgba(226, 232, 240, 0.8)', paddingBottom: '1rem', marginBottom: '2rem'}}>
                        <button 
                            type="button"
                            onClick={() => setActiveTab("dados")}
                            style={{background: 'transparent', border: 'none', fontSize: '15px', fontWeight: activeTab === 'dados' ? 800 : 500, color: activeTab === 'dados' ? 'var(--PrimaryColorsTheme)' : 'var(--TextColor75)', cursor: 'pointer', padding: '0 0.5rem'}}
                        >
                            <span style={{background: activeTab === 'dados' ? 'var(--PrimaryColorsTheme)' : 'var(--LineColor)', color: activeTab === 'dados' ? 'white' : 'var(--TextColor75)', padding: '2px 8px', borderRadius: '12px', marginRight: '8px', fontSize: '12px'}}>1</span>
                            Dados & Contato
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab("endereco")}
                            style={{background: 'transparent', border: 'none', fontSize: '15px', fontWeight: activeTab === 'endereco' ? 800 : 500, color: activeTab === 'endereco' ? 'var(--PrimaryColorsTheme)' : 'var(--TextColor75)', cursor: 'pointer', padding: '0 0.5rem'}}
                        >
                            <span style={{background: activeTab === 'endereco' ? 'var(--PrimaryColorsTheme)' : 'var(--LineColor)', color: activeTab === 'endereco' ? 'white' : 'var(--TextColor75)', padding: '2px 8px', borderRadius: '12px', marginRight: '8px', fontSize: '12px'}}>2</span>
                            Endereço
                        </button>
                        <button 
                            type="button"
                            onClick={() => setActiveTab("anamnese")}
                            style={{background: 'transparent', border: 'none', fontSize: '15px', fontWeight: activeTab === 'anamnese' ? 800 : 500, color: activeTab === 'anamnese' ? 'var(--PrimaryColorsTheme)' : 'var(--TextColor75)', cursor: 'pointer', padding: '0 0.5rem'}}
                        >
                            <span style={{background: activeTab === 'anamnese' ? 'var(--PrimaryColorsTheme)' : 'var(--LineColor)', color: activeTab === 'anamnese' ? 'white' : 'var(--TextColor75)', padding: '2px 8px', borderRadius: '12px', marginRight: '8px', fontSize: '12px'}}>3</span>
                            Anamnese Médica
                        </button>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {/* ABA 1: DADOS BÁSICOS */}
                        {activeTab === "dados" && (
                            <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                                <p className="sec-title" style={{color: 'var(--PrimaryColorsTheme)'}}>Identificação do Paciente</p>
                                
                                <div className="field">
                                    <label>Nome Completo *</label>
                                    <input type="text" name="nome" value={formData.nome} onChange={handleChange} required placeholder="Ex: Maria Fernanda da Silva" />
                                </div>
                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>CPF *</label>
                                        <input type="text" name="cpf" value={formData.cpf} onChange={handleChange} required placeholder="000.000.000-00" inputMode="numeric" maxLength={14} />
                                    </div>
                                    <div className="field">
                                        <label>RG</label>
                                        <input type="text" name="rg" value={formData.rg} onChange={handleChange} placeholder="Apenas números (7-9 dígitos)" inputMode="numeric" />
                                    </div>
                                </div>
                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>Data de Nascimento *</label>
                                        <input type="date" name="data_nascimento" value={formData.data_nascimento} onChange={handleChange} required />
                                    </div>
                                    <div className="field">
                                        <label>Gênero *</label>
                                        <select name="genero" value={formData.genero} onChange={handleChange}>
                                            <option>Feminino</option>
                                            <option>Masculino</option>
                                            <option>Outro</option>
                                        </select>
                                    </div>
                                </div>

                                <p className="sec-title" style={{marginTop: '2rem', color: 'var(--PrimaryColorsTheme)'}}>Contato & Emergência</p>
                                
                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>Telefone / WhatsApp *</label>
                                        <input type="text" name="telefone_whatsapp" value={formData.telefone_whatsapp} onChange={handleChange} required placeholder="(DD) 90000-0000" />
                                    </div>
                                    <div className="field">
                                        <label>E-mail</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} placeholder="paciente@email.com" />
                                    </div>
                                </div>
                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>Nome do Contato de Emergência</label>
                                        <input type="text" name="emerg_nome" value={formData.emerg_nome} onChange={handleChange} placeholder="Ex: João da Silva" />
                                    </div>
                                    <div className="field">
                                        <label>Telefone de Emergência</label>
                                        <input type="text" name="emerg_tel" value={formData.emerg_tel} onChange={handleChange} placeholder="(DD) 90000-0000" />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "flex-end", marginTop: '2rem' }}>
                                    <button type="button" className="submit" onClick={() => setActiveTab("endereco")}>Avançar para Endereço →</button>
                                </div>
                            </div>
                        )}

                        {/* ABA 2: ENDEREÇO */}
                        {activeTab === "endereco" && (
                            <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                                <p className="sec-title" style={{color: 'var(--PrimaryColorsTheme)', margin: 0}}>Endereço Residencial</p>
                                <p className="text75" style={{fontSize: '13px', margin: '4px 0 1.5rem 0'}}>Digite o CEP para buscar automaticamente.</p>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>CEP *</label>
                                        <input type="text" placeholder="00000-000" value={cep} onChange={(e) => setCep(maskCEP(e.target.value))} onBlur={buscarCEP} />
                                    </div>
                                    <div className="field">
                                        <label>Estado (UF)</label>
                                        <input type="text" value={estado} onChange={e => setEstado(e.target.value)} placeholder="Ex: SP" />
                                    </div>
                                </div>

                                <div className="flex-inpus">
                                    <div className="field">
                                        <label>Cidade</label>
                                        <input type="text" value={cidade} onChange={e => setCidade(e.target.value)} placeholder="Ex: São Paulo" />
                                    </div>
                                    <div className="field">
                                        <label>Bairro</label>
                                        <input type="text" value={bairro} onChange={e => setBairro(e.target.value)} placeholder="Centro" />
                                    </div>
                                </div>

                                <div className="flex-inpus">
                                    <div className="field" style={{flex: 2}}>
                                        <label>Endereço (Rua/Avenida)</label>
                                        <input type="text" value={rua} onChange={e => setRua(e.target.value)} placeholder="Rua das Flores" />
                                    </div>
                                    <div className="field">
                                        <label>Número</label>
                                        <input type="text" value={numero} onChange={e => setNumero(e.target.value)} placeholder="123" />
                                    </div>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: '2rem' }}>
                                    <button type="button" className="submit" style={{background: 'var(--LineColor)', color: 'var(--TextColor)', boxShadow:'none'}} onClick={() => setActiveTab("dados")}>← Voltar</button>
                                    <button type="button" className="submit" onClick={() => setActiveTab("anamnese")}>Avançar para Anamnese →</button>
                                </div>
                            </div>
                        )}

                        {/* ABA 3: ANAMNESE E SUBMIT */}
                        {activeTab === "anamnese" && (
                            <div className="forms-section" style={{animation: 'fadeIn 0.3s'}}>
                                <p className="sec-title" style={{color: 'var(--PrimaryColorsTheme)'}}>Anamnese e Saúde Geral (Prontuário)</p>
                                <p className="text75" style={{fontSize: '13px', marginBottom: '1.5rem'}}>Este é o prontuário eletrônico. Mantenha os dados atualizados.</p>

                                <div className="field">
                                    <label>Alergias Conhecidas</label>
                                    <textarea name="alergias" value={formData.alergias} onChange={handleChange} placeholder="Ex: Penicilina, Iodo, Látex... Deixe em branco se não houver." rows="3"></textarea>
                                </div>

                                <div className="field">
                                    <label>Condições Sistêmicas</label>
                                    <textarea name="condicoes" value={formData.condicoes} onChange={handleChange} placeholder="Ex: Hipertensão, Diabetes, Problemas Reumatológicos..." rows="3"></textarea>
                                </div>

                                <div className="field">
                                    <label>Medicações em uso contínuo</label>
                                    <textarea name="medicacoes" value={formData.medicacoes} onChange={handleChange} placeholder="Liste os remédios que o paciente toma frequentemente." rows="3"></textarea>
                                </div>

                                <div className="field">
                                    <label>Uso de drogas lícitas e ilícitas</label>
                                    <textarea name="drogas" value={formData.drogas} onChange={handleChange} placeholder="Álcool, tabagismo, outros..." rows="3"></textarea>
                                </div>

                                <div className="field">
                                    <label>Cirurgias prévias e problemas de cicatrização/sangramento</label>
                                    <textarea name="cirurgias" value={formData.cirurgias} onChange={handleChange} placeholder="Alguma cirurgia recente ou problemas de coagulação?" rows="3"></textarea>
                                </div>

                                <div style={{ display: "flex", justifyContent: "space-between", marginTop: '2rem' }}>
                                    <button type="button" className="submit" style={{background: 'var(--LineColor)', color: 'var(--TextColor)', boxShadow:'none'}} onClick={() => setActiveTab("endereco")}>← Voltar</button>
                                    <button type="submit" disabled={isLoading} className="submit" style={{background: '#15803D', boxShadow: '0 4px 15px rgba(21, 128, 61, 0.4)'}}>
                                        {isLoading ? "Salvando..." : "Finalizar Cadastro do Paciente"}
                                    </button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </main>
        </>
    );
}

export default RegisterPatient;

/* IMPORTS */
import { useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { apiRegistro } from "../../services/api";
import '../../styles/Auth.css';

/* MAIN COMPONENT */
function CadastroPage() {

    const { type } = useParams();

    const validTypes = {
        owner: {
            text: "Comece a gerenciar a sua clínica hoje",
            badge: "NOVO PROPRIEDADE"
        },

        employee: {
            text: "Comece a trabalhar com a equipe da clínica hoje",
            badge: "NOVO FUNCIONARIO"
        },

        specialist: {
            text: "Comece a atender seus pacientes com a gente hoje",
            badge: "NOVO ESPECIALISTA"
        }
    };

    const navigate = useNavigate();
    const [form, setForm] = useState({
        nome: "",
        email: "",
        password: "",
        confirmPassword: "",
    });
    const [error, setError] = useState("");
    const [success, setSuccess] = useState("");
    const [loading, setLoading] = useState(false);

    function handleChange(e) {
        setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    }

    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setSuccess("");

        if (form.password !== form.confirmPassword) {
            setError("As senhas não coincidem.");
            return;
        }

        setLoading(true);
        try {
            await apiRegistro(form.nome, form.email, form.password);
            setSuccess("Conta criada com sucesso! Redirecionando para o login...");
            setTimeout(() => navigate("/login"), 2000);
        } catch (err) {
            setError(err.message || "Erro ao cadastrar.");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className={`auth-wrapper ${type}`}>
            <div className="auth-card">

                {/* HEADER */}
                <div className="auth-header">
                    <h1 className="auth-card-logo">BYTE DONTO</h1>
                    <p>{validTypes[type]?.text}</p>
                </div>

                <div className="auth-badge">{validTypes[type]?.badge}</div>

                {/* FORM */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label htmlFor="nome">Nome Completo</label>
                        <input
                            id="nome"
                            name="nome"
                            type="text"
                            placeholder="Dr. Nome Sobrenome"
                            value={form.nome}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="email">E-mail Corporativo</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            placeholder="clinica@email.com"
                            value={form.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Criar Senha</label>
                        <input
                            id="password"
                            name="password"
                            type="password"
                            placeholder="Mínimo de 8 caracteres"
                            value={form.password}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="confirmPassword">Confirmar Senha</label>
                        <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            placeholder="Repita a senha"
                            value={form.confirmPassword}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {error && <p className="auth-error">{error}</p>}
                    {success && (
                        <p style={{
                            color: "#2e7d32",
                            fontSize: "13px",
                            textAlign: "center",
                            padding: "10px",
                            backgroundColor: "#e8f5e9",
                            borderRadius: "8px",
                            border: "1px solid #b7dfBA",
                            fontWeight: "500"
                        }}>
                            {success}
                        </p>
                    )}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "CADASTRANDO..." : "CRIAR CONTA AGORA"}
                    </button>
                </form>

                {/* FOOTER */}
                <div className="auth-footer">
                    <p className="text75">
                        Já tem uma conta?{" "}
                        <Link to={`/login/${type}`}>Fazer login</Link>
                    </p>
                    <p style={{marginTop: "8px"}}><Link to="/">← Voltar p/ o início</Link></p>
                </div>
            </div>
        </div>
    );
}

/* STANDARD EXPORT */
export default CadastroPage;

/* IMPORTS */
import { useState, useEffect } from "react";
import { useNavigate, Link, useParams } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { apiLogin, apiMe } from "../../services/api";
import { supabase } from "../../services/supabaseClient";
import '../../styles/Auth.css';

import EyeOpen from '../../assets/svg/eye_open.svg?react'
import EyeClose from '../../assets/svg/eye_close.svg?react'

/* MAIN COMPONENT */
function LoginPage() {

    const { type } = useParams();

    const validTypes = {
        owner: {
            text: "Acesse seu painel administrativo",
            badge: "PROPRIEDADE"
        },

        employee: {
            text: "Acesse seu painel de recepção",
            badge: "FUNCIONARIO"
        },

        specialist: {
            text: "Acesse seu painel de especialista",
            badge: "ESPECIALISTA"
        }
    };

    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [showPassword, setShowPassword] = useState(false);

    const { login } = useAuth();
    const navigate = useNavigate();

    /* Mapeia o :type da URL para o papel esperado no banco */
    const TYPE_TO_PAPEL = {
        owner:      "Dono",
        employee:   "Recepção",
        specialist: "Especialista",
    };

    /* Verifica se o papel do usuário bate com o tipo de login atual */
    function validarTipoDeConta(perfil) {
        const papelEsperado = TYPE_TO_PAPEL[type];
        const papelDoUsuario = perfil?.perfil?.papel;

        if (!papelDoUsuario || papelDoUsuario !== papelEsperado) {
            const nomeTipo = validTypes[type]?.badge || type;
            setError(
                `Esta conta não está cadastrada como ${nomeTipo}. ` +
                `Por favor, use a tela de login correspondente ao seu perfil.`
            );
            return false;
        }
        return true;
    }

    /* Função de Roteamento Inteligente */
    const routBasedOnRole = (userData) => {
        if (userData && userData.perfil && userData.perfil.papel) {
            const role = userData.perfil.papel;

            if (role === "Recepção") {
                navigate("/employee/dashboard");

            } else if (role === "Especialista") {
                navigate("/specialist/dashboard");

            } else if (role === "Dono") {
                navigate("/owner/clinic");

            } else {
                navigate("/");
            }

        } else {
            navigate("/");
        }
    };

    /* Detecta retorno do OAuth do Google */
    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => {
            if (session) {
                apiMe(session.access_token)
                    .then((perfil) => {
                        if (!validarTipoDeConta(perfil)) return;
                        login(session.access_token, perfil);
                        routBasedOnRole(perfil);
                    })
                    .catch((err) => {
                        if (err.message !== "Failed to fetch") {
                            setError(err.message || "Erro ao autenticar com o Google. Tente novamente.");
                        }
                    });
            }
        });
    }, []);

    /* Login com email/senha via Flask */
    async function handleSubmit(e) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const { access_token } = await apiLogin(email, password);
            const perfil = await apiMe(access_token);

            // Bloqueia se o papel da conta não bater com o tipo de login atual
            if (!validarTipoDeConta(perfil)) return;

            login(access_token, perfil);
            routBasedOnRole(perfil);
        } catch (err) {
            if (err.message === "Failed to fetch") {
                setError("Servidor indisponível. Verifique sua conexão ou tente novamente.");
            } else {
                setError(err.message || "Email ou senha incorretos.");
            }
        } finally {
            setLoading(false);
        }
    }

    async function handleGoogleLogin() {
        try {
            setGoogleLoading(true);
            setError("");
            const { error } = await supabase.auth.signInWithOAuth({
                provider: "google",
                options: {
                    // Redireciona para /login/owner para que o useEffect detecte
                    // a sessão OAuth e roteie para o dashboard correto via routBasedOnRole
                    redirectTo: window.location.origin + "/login/owner",
                    queryParams: {
                        prompt: 'select_account'
                    }
                },
            });
            if (error) {
                setError(error.message || "Erro ao conectar com o Google");
                setGoogleLoading(false);
            }
        } catch (err) {
            setError(err.message || "Erro inesperado ao conectar com o Google");
            setGoogleLoading(false);
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

                {/* GOOGLE BUTTON */}
                <button
                    className="btn-google"
                    onClick={handleGoogleLogin}
                    disabled={googleLoading}
                >
                    <svg width="18" height="18" viewBox="0 0 48 48" style={{ flexShrink: 0 }}>
                        <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z" />
                        <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z" />
                        <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z" />
                        <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z" />
                    </svg>
                    {googleLoading ? "Redirecionando..." : "Entrar com Google"}
                </button>

                {/* DIVIDER */}
                <div className="auth-divider">ou usar email</div>

                {/* FORM EMAIL/SENHA */}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="field">
                        <label htmlFor="email">E-mail Corporativo</label>
                        <input
                            id="email"
                            type="email"
                            placeholder="seu@email.com"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                        />
                    </div>

                    <div className="field">
                        <label htmlFor="password">Senha</label>
                        <div className="input-password">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? (
                                    <EyeOpen />
                                ) : (
                                    <EyeClose />
                                )}
                            </button>
                        </div>
                    </div>

                    {error && <p className="auth-error">{error}</p>}

                    <button
                        type="submit"
                        className="auth-submit"
                        disabled={loading}
                    >
                        {loading ? "ENTRANDO..." : "FAZER LOGIN"}
                    </button>
                </form>

                {/* FOOTER */}
                <div className="auth-footer">
                    <p className="text75">
                        Não possui cadastro?{" "}
                        <Link to={`/cadastro/${type}`}>Criar conta</Link>
                    </p>
                    <p style={{marginTop: "8px"}}><Link to="/">← Voltar p/ o início</Link></p>
                </div>
            </div>
        </div>
    );
}

/* STANDARD EXPORT */
export default LoginPage;

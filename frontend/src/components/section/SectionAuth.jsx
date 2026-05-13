/* IMPORTS OF COMPONENTS */
import { useState, useEffect } from "react";

import { apiMe } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import '../../styles/Section.css'

/* MAIN COMPONENT */
function SectionAuth({ type_styles }) {

    const { user, token, logout } = useAuth();

    const [usuario, setUsuario] = useState(null);

    useEffect(() => {

        if (!token) return;

        apiMe(token)
            .then(data => setUsuario(data))
            .catch(error => console.error(error));

    }, [token]);

    const validTypes = {

        owner: {
            badge: "PROPRIEDADE"
        },

        employee: {
            badge: "FUNCIONÁRIO"
        },

        specialist: {
            badge: "ESPECIALISTA"
        }

    };

    return (
        <section className={`premium-topbar ${type_styles}`}>

            <h1 id="logo">
                BYTE DONTO
            </h1>

            <div className="topbar-actions">

                <div className="user-profile">

                    <span className="user-name">
                        {usuario?.nome || "Usuário"}
                    </span>

                    <span className="user-role owner-badge">
                        {validTypes[type_styles]?.badge}
                    </span>

                </div>

                <button
                    className="logout-btn"
                    onClick={logout}
                    title="Desconectar da conta"
                >
                    Sair
                </button>

            </div>

        </section>
    );
}

/* STANDARD EXPORT */
export default SectionAuth;
/* IMPORTS OF COMPONENTS */
import { useState, useEffect } from "react";
import { apiMe } from "../../services/api";
import { useAuth } from "../../context/AuthContext";

import Img from "../../assets/svg/bell.svg?react";

import '../../styles/Section.css';
import '../../styles/Buttons.css';

/* MAIN COMPONENT */
function SectionAuth({ type_styles }) {

    const { user, logout } = useAuth();
    
    const ROLE_LABEL = {
        "Owner":      "PROPRIETÁRIO",
        "Employee":   "FUNCIONÁRIO",
        "Specialist": "ESPECIALISTA",
    };
    const roleLabel = ROLE_LABEL[user?.perfil?.roles] || user?.perfil?.roles || "USUÁRIO";

    return (
        <section className={`premium-topbar ${type_styles}`}>

            <h1 id="logo">
                BYTE DONTO
            </h1>

            <div className="topbar-actions">

                <button className="notification-btn">
                    <Img className="icon-notification" />
                </button>

                <div className="user-profile">

                    <span className="user-name">{user?.perfil?.name || "Usuário"}</span>
                    <span className="user-role owner-badge">{roleLabel}</span>

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
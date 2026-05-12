/* IMPORTS OF COMPONENTS */
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

import ButtonsCamps from "../buttons/ButtonsCamps";

import "../../styles/Section.css";

/* MAIN COMPONENT */
function SectionNotAuth() {
    const navigate = useNavigate();

    const menuRef = useRef(null);

    const [menuOpen, setMenuOpen] = useState(false);

    // define se o menu atual é login ou cadastro
    const [actionType, setActionType] = useState("");

    /* PERFIS */
    const profiles = [
        {
            label: "Proprietário",
            value: "owner",
        },
        {
            label: "Especialista",
            value: "specialist",
        },
        {
            label: "Funcionário",
            value: "employee",
        },
    ];

    /* ABRIR MENU */
    function handleOpenMenu(type) {
        setActionType(type);
        setMenuOpen(true);
    }

    /* SELECIONAR PERFIL */
    function handleSelectProfile(profile) {
        navigate(`/${actionType}/${profile}`);
        setMenuOpen(false);
    }

    /* FECHAR MENU AO CLICAR FORA */
    useEffect(() => {
        function handleClickOutside(event) {
            if (
                menuRef.current &&
                !menuRef.current.contains(event.target)
            ) {
                setMenuOpen(false);
            }
        }

        if (menuOpen) {
            document.addEventListener("mousedown", handleClickOutside);

            // desativa scroll
            document.body.style.overflow = "hidden";
        }

        return () => {
            document.removeEventListener(
                "mousedown",
                handleClickOutside
            );

            // ativa scroll novamente
            document.body.style.overflow = "auto";
        };
    }, [menuOpen]);

    return (
        <>
            <section>
                <h1 id="logo">BYTE DONTO</h1>
                <div className="buttons-container">
                    <div className="menu-wrapper">
                        <button
                            className="btn-auth camp"
                            onClick={() => handleOpenMenu("login")}
                        >
                            LOGIN
                        </button>
                    </div>

                    <div className="menu-wrapper">
                        <button
                            className="btn-auth camp"
                            onClick={() => handleOpenMenu("cadastro")}
                        >
                            CADASTRO
                        </button>
                    </div>
                </div>
                {menuOpen && (
                    <>
                        {/* overlay */}
                        <div className="overlay" />

                        {/* menu */}
                        <div
                            className="dropdown-menu"
                            ref={menuRef}
                        >
                            {profiles.map((profile) => (
                                <button
                                    key={profile.value}
                                    onClick={() =>
                                        handleSelectProfile(
                                            profile.value
                                        )
                                    }
                                >
                                    {profile.label}
                                </button>
                            ))}
                        </div>
                    </>
                )}
            </section>
        </>
    );
}

/* STANDARD EXPORT */
export default SectionNotAuth;
import AlertOverlay from "./AlertOverlay";

function AlertConfirm({ title, text, onCancel, onConfirm, styles }) {

    return (
        <AlertOverlay styles={styles}>

            <div className="alert-content">

                <p className="alert-title">
                    {title}
                </p>

                <p className="alert-text">
                    {text}
                </p>

                <div className="alert-actions" style={{ display: "flex", width: "100%", justifyContent: "space-between" }}>

                    <button
                        className="alert-btn danger"
                        onClick={onConfirm}
                    >
                        Excluir
                    </button>

                    <button
                        className="alert-btn secondary"
                        onClick={onCancel}
                    >
                        Voltar
                    </button>

                </div>

            </div>

        </AlertOverlay>
    );

}

export default AlertConfirm;
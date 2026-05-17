import AlertOverlay from "./AlertOverlay";

function AlertError({
    text,
    onClose,
    styles
}) {

    return (
        <AlertOverlay styles={styles}>

            <div className="alert-content">

                <h2 className="alert-title error">
                    ERROR
                </h2>

                <p className="alert-text">
                    {text}
                </p>

                <button
                    className="alert-btn"
                    onClick={onClose}
                >
                    Voltar
                </button>

            </div>

        </AlertOverlay>
    );

}

export default AlertError;
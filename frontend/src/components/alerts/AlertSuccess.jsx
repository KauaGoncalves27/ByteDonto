import AlertOverlay from "./AlertOverlay";

function AlertSuccess({
    text,
    onClose
}) {

    return (
        <AlertOverlay>

            <div className="alert-content">

                <h2 className="alert-title success">
                    SUCESSO
                </h2>

                <p className="alert-text">
                    {text}
                </p>

                <button
                    className="alert-btn"
                    onClick={onClose}
                >
                    OK
                </button>

            </div>

        </AlertOverlay>
    );

}

export default AlertSuccess;
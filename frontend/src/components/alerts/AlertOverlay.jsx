import "../../styles/alerts.css";

function AlertOverlay({ children, styles }) {

    return (
        <div className={`alert-overlay ${styles}`}>
            <div className="alert-card">
                {children}
            </div>
        </div>
    );

}

export default AlertOverlay;
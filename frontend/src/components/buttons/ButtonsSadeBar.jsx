/* IMPORTS OF COMPONENTS */
import { useNavigate } from "react-router-dom";
import '../../styles/Buttons.css'

/* MAIN COMPONENT */
function ButtonsCamps({ icon, name, style, url }) {
    const navigate = useNavigate();

    function registration() {
        navigate(`${url}`);
    }

    const Icon = icon;

    return (
        <>
            <button className={`bar ${style}`} onClick={registration}>
                <Icon className="sidebar-icon" />
                <p>{name}</p>
            </button>
        </>
    );

}

/* STANDARD EXPORT */
export default ButtonsCamps;
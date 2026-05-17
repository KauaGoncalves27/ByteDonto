/* IMPORTS OF COMPONENTS */
import { Link } from "react-router-dom";

import '../../styles/List.css'

/* MAIN COMPONENT */
function ListClinic({ clinic_url, clinic_logo, clinic_img, clinic_name, clinic_cnpj, clinic_phone, onDelete }) {
    return (
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Link className="list" to={`${clinic_url}`} style={{ flex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div className='circle'>
                        <img src={clinic_logo ? clinic_logo : clinic_img} />
                    </div>
                    <div>
                        <p>{clinic_name}</p>
                        <p>{clinic_cnpj} | {clinic_phone}</p>
                    </div>
                </div>
                <div>
                    {onDelete && (
                        <button
                            onClick={(e) => { e.preventDefault(); e.stopPropagation(); onDelete(); }}
                            style={{
                                flexShrink: 0,
                                padding: '8px 16px',
                                borderRadius: '8px',
                                border: '1px solid #f87171',
                                background: 'transparent',
                                color: '#ef4444',
                                cursor: 'pointer',
                                fontWeight: 600,
                                fontSize: '13px',
                            }}
                        >
                            Excluir
                        </button>
                    )}
                </div>
            </Link>
        </div>
    );
}

export default ListClinic;
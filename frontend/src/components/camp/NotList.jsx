/* IMPORTS OF COMPONENTS */
import ButtonP from "../buttons/ButtonsRediText"
import '../../styles/List.css'

/* MAIN COMPONENT */
function NotList({ img, text_p, text_l, text_btn, utl_btn }) {
    return (
        <>
            <div className="not-list">
                <img src={img} />
                <p>{text_p}</p>
                {text_l && <label>{text_l}</label>}
                {text_btn && <ButtonP text={text_btn} url={utl_btn} />}
            </div>
        </>
    );

}

/* STANDARD EXPORT */
export default NotList;
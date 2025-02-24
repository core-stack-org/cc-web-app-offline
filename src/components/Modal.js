import styles from "./Modal.module.css"
import { BottomSheet } from 'react-spring-bottom-sheet'
import 'react-spring-bottom-sheet/dist/style.css'
import closeIcon from  "../asset/close_icon.svg"

const Modal = ({isOpen, onClose, title, body, footer}) => {

    if (!isOpen) {
        return null;
    }

    return (
        <>
            <div className={styles.modal_main}>
                <BottomSheet open={isOpen} onDismiss={onClose} snapPoints={({ minHeight, maxHeight }) => [maxHeight]}>
                    <div className={styles.modal_header}>
                        <div className={styles.modal_title}>
                            {title}
                        </div>
                        <button className={styles.modal_close_button} onClick={onClose}><img src={closeIcon} width={25} height={25} className={styles.close_button}/></button>
                    </div>
                    {body}
                </BottomSheet>
            </div>

        </>
    )
}

export default Modal
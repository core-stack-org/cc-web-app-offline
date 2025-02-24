import styles from "./Button.module.css";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import layerIcon from "../asset/layerIcon.svg"

const Button = ({
  isIcon = false,
  isNext = false,
  isBack = false,
  icon = null,
  label,
  isSelect = false,
  isDropdown = false,
  onClick,
  isDisabled = true,
  active = false,
  isButtonIcon = false,
}) => {
  return (
    <>
      {isDropdown ? (
        <button className={styles.dropdown_button_class} onClick={onClick}>
          <span className={styles.dropdown_button_label_class}>{label}</span>
        </button>
      ) : 
      isIcon ? (
        <button className={styles.icon_button_class} onClick={onClick}>
          <FontAwesomeIcon icon={icon} />
        </button>
      ) : isSelect ? (
        <button
          className={
            active
              ? styles.header_select_button_active
              : styles.header_select_button_class
          }
          onClick={onClick}
        >
          {label}
          {icon !== null ? <FontAwesomeIcon icon={icon} className={styles.copy_button}/> : <></>}
        </button>
      ) : isNext ? (
        <button
          className={styles.footer_button_class}
          disabled={!isDisabled}
          onClick={onClick}
        >
          <span className={styles.next_button_label}>
            {label}
          </span>
        </button>
      ) : isBack ? (
        <button
          className={styles.layers_button_toggle}
          disabled={!isDisabled}
          onClick={onClick}
        >
          <span className={styles.layer_button_label}>
            <img src={layerIcon} className={styles.layer_icon_style}/>
            {label}
          </span>
        </button>
      ) : (
        <button
          className={styles.footer_button_class}
          disabled={!isDisabled}
          onClick={onClick}
        >
          {label}
          {isButtonIcon ? <FontAwesomeIcon icon={icon} size={"lg"} /> : ""}
        </button>
      )}
    </>
  );
};

export default Button;

import { useState } from "react";
import styles from "./HamMenu.module.css";
import useMainScreenModal from "../hooks/useMainModal";
import { useTranslation } from "react-i18next";
import i18next from "i18next";
import {
  faMapMarkedAlt,
  faLanguage,
  faFileAlt,
  faFileUpload,
  faSync
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";


const HamMenu = ({ screenTitle, screenIcon }) => {
  const { t } = useTranslation();

  const [isopen, setOpen] = useState(false);


  const onOpen = useMainScreenModal((state) => state.onOpen);
  const onSetLocationModal = useMainScreenModal(
    (state) => state.onSetLocationModal
  );

  const onSetUploadKML = useMainScreenModal((state) => state.onSetUploadKML);

  const onSetGenerateDPR = useMainScreenModal(
    (state) => state.onSetGenerateDPR
  );

  const onSetLanguageChange = useMainScreenModal(
    (state) => state.onSetLanguage
  );

  const onSetBugReportModal = useMainScreenModal(
    (state) => state.onSetBugReportModal
  );

  const onSetFormToggle = useMainScreenModal((state) => state.onSetFormToggle)

  const handleToggle = (toggle) => {
    setOpen(false);
    onOpen();
    toggle();
  };


  return (
    <>
      <div className={isopen ? styles.wrapper_show : styles.wrapper_hide}>
        <div className={styles.top_menu_wrapper}>
          <label
            className={styles.menu_toggle}
            onClick={() => setOpen(!isopen)}
          >
            <svg
              width="35"
              height="35"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fff"
              strokeWidth="2"
              strokeLinecap="butt"
              strokeLinejoin="arcs"
            >
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </label>
          <div className={styles.screen_name_wrapper}>
            <label className={styles.screen_name}>
              {screenIcon !== null ? (
                <img src={screenIcon} className={styles.icon_style} />
              ) : (
                ""
              )}
              {t(`${screenTitle}`)}
            </label>
          </div>
        </div>

        <div className={isopen ? styles.m_menu_visible : styles.m_menu}>
          <div className={styles.m_menu__header}>
            <label
              className={styles.m_menu__toggle}
              onClick={() => setOpen(!isopen)}
            >
              <svg
                width="35"
                height="35"
                viewBox="0 0 24 24"
                fill="none"
                stroke="#000000"
                strokeWidth="2"
                strokeLinecap="butt"
                strokeLinejoin="arcs"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </label>
            <span>{"Commons Connect"}</span>
          </div>
          <div className={styles.menu_item_section}>
            <div className={styles.menu_top}>
              <div
                className={styles.menu_item}
                onClick={() => handleToggle(onSetLocationModal)}
              >
                <FontAwesomeIcon icon={faMapMarkedAlt} />
                <div className={styles.menu_item_start}>{t("Select Location")}</div>
              </div>
              <div
                className={`${styles.menu_item}`} // unset when the functionality is working fine
                onClick={() => handleToggle(onSetLanguageChange)}
              >
                <FontAwesomeIcon icon={faLanguage} />
                <div className={styles.menu_item_start}>
                  {`${t("Choose Language")} [${i18next.language}]`}
                </div>
              </div>
              <div
                className={styles.menu_item}
                onClick={() => handleToggle(onSetGenerateDPR)}
              >
                <FontAwesomeIcon icon={faFileAlt} />
                <div className={styles.menu_item_start}>{t("Generate pre-DPR")}</div>
              </div>
              <div
                className={styles.menu_item}
                onClick={() => handleToggle(onSetUploadKML)}
              >
                <FontAwesomeIcon icon={faFileUpload} />
                <div className={styles.menu_item_start}>{t("Upload KML")}</div>
              </div>
              {/* <div className={styles.menu_item_disabled}>
                <FontAwesomeIcon icon={faQuestion} />
                <div className={styles.menu_item_start}>{t("How to use")}</div>
              </div> */}
              {/* <div className={styles.menu_item_disabled}>
                <FontAwesomeIcon icon={faUser} />
                <div className={styles.menu_item_start}>
                  {t("Login")}
                </div>
              </div> */}
            </div>
            {/* <div
              className={styles.menu_last}
              onClick={() => handleToggle(onSetBugReportModal)}
            >
              <FontAwesomeIcon icon={faBug} style={{ marginRight: '7px' }} />
              <div className={styles.menu_item_last}>{t("Report a Bug")}</div>

            </div> */}
            <div
              className={styles.menu_last}
              onClick={() => handleToggle(onSetFormToggle)}
            >
              <FontAwesomeIcon icon={faSync} style={{ marginRight: '7px' }} />
              <div className={styles.menu_item_last}>{t('Sync Offline Data')}</div>

            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default HamMenu;

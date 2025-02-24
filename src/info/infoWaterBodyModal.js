import React from "react" ;
import { useTranslation } from 'react-i18next';

const InfoWaterBodyModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;
  
    return (
      <div style={infoModalStyle}>
          <div style={infoModalContentStyle}>
              <h2>{t("Surface WaterBodies")}</h2>
              <p>{t("info_wb_1")}</p>
              <h4>{t("info_wb_2")}</h4>
              <p>{t("info_wb_3")}</p>
              <h3>{t("Analyze")}</h3>
              <p>{t("info_wb_4")}</p>
              <h3>{t("Propose Maintenance")}</h3>
              <p>{t("info_wb_5")}</p>
              <div style={closeButtonContainerStyle}>
                  <button onClick={onClose} style={closeButtonStyle}>Close</button>
              </div>
              
            </div>
        </div>
    );
  };
  

export default InfoWaterBodyModal;

  
const infoModalStyle = {
    position: 'absolute',
    top: '0',
    left: '0',
    width: '100%',
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    backdropFilter: 'blur(5px)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: '1000',
  };

const infoModalContentStyle = {
    width: '300px',
    padding: '20px',
    backgroundColor: '#fff',
    borderRadius: '10px',
    textAlign: 'left',
};

const closeButtonContainerStyle = {
    textAlign: 'center',
    marginTop: '10px'
};

const closeButtonStyle = {
    backgroundColor: 'white',
    border: '2px solid #333',
    borderRadius: '5px',
    color: '#333',
    padding: '5px 10px',
    cursor: 'pointer',
    marginTop: '10px',
    transition: '0.3s all',
    '&:hover': {
        backgroundColor: '#f7f7f7',
    }
};
import React from "react";
import { useTranslation } from 'react-i18next';

const InfoLivelihoodModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();

    if (!isOpen) return null;

    return (
        <div style={infoModalStyle}>
            <div style={infoModalContentStyle}>
                <h2>{t("Livelihood")}</h2>
                <p>{t("info_liveli_1")}</p>

                <div style={closeButtonContainerStyle}>
                    <button onClick={onClose} style={closeButtonStyle}>Close</button>
                </div>

            </div>
        </div>
    );
};


export default InfoLivelihoodModal;


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

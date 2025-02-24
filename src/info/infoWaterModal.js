import React from "react";
import { useTranslation } from 'react-i18next';

const InfoWaterModal = ({ isOpen, onClose, currentLegend }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    const renderMWSLegend = () => (
        <>
        <h3>Well Depth Legend</h3>
                <div style={{ ...legendStyle, display: 'flex', alignItems: 'center' }}>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#ff0000' }}></div>
                        <span>Less than -5m</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#ffff00' }}></div>
                        <span>-5m to -1m</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#25B63C' }}></div>
                        <span>-1m to 1m</span>
                    </div>
                    <div style={{ ...legendItemStyle }}>
                        <div style={{ ...colorPill, backgroundColor: '#1017F8' }}></div>
                        <span>More than 1m</span>
                    </div>
                </div>
        </>
    );

    const renderClartLegend = () => (
        <>
        <h3>CLART Legend</h3>
                <div style={legendGridStyle}>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#F5F6FE' }}></div>
                        <span>Empty</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#4EE323' }}></div>
                        <span>Good recharge</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#F3FF33' }}></div>
                        <span>Moderate recharge</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#B40F7D' }}></div>
                        <span>Regeneration</span>
                    </div>
                    <div style={{ ...legendItemStyle }}>
                        <div style={{ ...colorPill, backgroundColor: '#1774DE' }}></div>
                        <span>High runoff zone</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#F21223' }}></div>
                        <span>Surface water harvesting</span>
                    </div>
                </div>
        </>
    );

    return (
        <div style={infoModalStyle}>
            <div style={infoModalContentStyle}>

                <h2>{t("GroundWater")}</h2>
                <p>{t("info_gw_1")}</p>
                <h3>{t("Analyze")}</h3>
                <p>{t("info_gw_2")}</p>
                <h3>{t("Start Planning")}</h3>
                <p>{t("info_gw_3")}</p>
                <p>Note: Well depth tab need to selected</p>

                {currentLegend === "MWS" ? renderMWSLegend() : null}
                {currentLegend === "CLART" ? renderClartLegend() : null}

                <div style={closeButtonContainerStyle}>
                    <button onClick={onClose} style={closeButtonStyle}>Close</button>
                </div>



            </div>
        </div>
    );
};


export default InfoWaterModal;


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
    maxHeight: '70vh',
    width: '300px',
    overflowY: 'auto',
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


const legendGridStyle = {
    display: 'grid',
    gridTemplateColumns: 'repeat(2, 1fr)', // Two equal-width columns
    gap: '10px 20px', 
    alignItems: 'center',
    maxWidth: '100%',
};

const legendStyle = {
    padding: '10px 0',
};

const legendItemStyle = {
    display: 'flex',
    alignItems: 'center',
    flexWrap: 'nowrap', 
    maxWidth: '200px',  
};

const colorPill = {
    width: '14px',
    height: '24px',
    borderRadius: '7px',
    marginRight: '5px',
};
import React from "react" ;
import { useTranslation } from 'react-i18next';

const InfoAgriModal = ({ isOpen, onClose, currentLegend }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

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

    const renderLulcLegend = () => (
        <>
            <h3>LULC Legend</h3>
                <div style={legendGridStyle}>
                    {/* <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#030364' }}></div>
                        <span>Water body</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#C6B98B' }}></div>
                        <span>Built-up</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#EA95E8' }}></div>
                        <span>Barren land</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#0D4007' }}></div>
                        <span>Forest</span>
                    </div> */}
                    <div style={{ ...legendItemStyle }}>
                        <div style={{ ...colorPill, backgroundColor: '#c6e46d' }}></div>
                        <span>Single Kharif</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#eee05d' }}></div>
                        <span>Single Non-Kharif</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#f9b249' }}></div>
                        <span>Double crop</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#fb5139' }}></div>
                        <span>Triple crop</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#A9A9A9' }}></div>
                        <span>Barren Lands</span>
                    </div>
                    <div style={{ ...legendItemStyle, marginRight: '20px' }}>
                        <div style={{ ...colorPill, backgroundColor: '#A9A9A9' }}></div>
                        <span>Shrubs and Scrubs</span>
                    </div>
                </div>
        </>
    );

    return (
      <div style={infoModalStyle}>
          <div style={infoModalContentStyle}>
              <h2>{t("Agri")}</h2>
              <p>{t("info_agri_1")}</p>
              <h3>{t("Analyze")}</h3>
              <p>{t("info_agri_2")}</p>
              <h3>{t("Start Planning")}</h3>
              <p>{t("info_agri_3")}</p>
              <h3>{t("Irrigation")}</h3>
              <p>{t("info_agri_4")}</p>


              {currentLegend === "CLART" ? renderClartLegend() : null}
              {currentLegend === "LULC" ? renderLulcLegend() : null}


              <div style={closeButtonContainerStyle}>
                  <button onClick={onClose} style={closeButtonStyle}>Close</button>
              </div>

            </div>
        </div>
    );
  };

export default InfoAgriModal;


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

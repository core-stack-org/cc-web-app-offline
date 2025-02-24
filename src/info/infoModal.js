import React, { useEffect, useState } from "react";
import { useTranslation } from 'react-i18next';
import "./infoModal.css"
import usePlansStore from "../hooks/usePlans.js";

const InfoModal = ({ isOpen, onClose }) => {
    const { t } = useTranslation();
    const [planMetaData, setPlanMetaData] = useState(null)
    const { currentPlan } = usePlansStore((state) => {
        return {
          currentPlan: state.currentPlan
        };
    });
    
    useEffect(()=>{
        if(currentPlan !== null){
            let tempStore = []
            Object.keys(currentPlan).map(key => {
                tempStore.push(<div className="plan_metadata_main">
                    <div className="plan_metadata_key">{`${key.toUpperCase()} : `}</div>
                    <div className="plan_metadata_data">{currentPlan[key]}</div>
                </div>)
            })
            setPlanMetaData(tempStore)
        }
    },[currentPlan])
    
    if (!isOpen) return null;

    return (
        <div className="container">
            <div className="tab-wrap">
                {/* 
                 */}
                <input type="radio" id="tab1" name="tabGroup1" class="tab" checked/>
                <label for="tab1">{t("Information")}</label>

                <input type="radio" id="tab2" name="tabGroup1" class="tab"/>
                <label for="tab2">Plan Information</label>

                <div class="tab__content">

                    <p>{t("Step")} 1: {t("info_main_1")}</p>
                    <p>{t("Step")} 2: {t("info_main_2")}</p>
                    <p>{t("Step")} 3: {t("info_main_3")}</p>
                    <h3>{t("GroundWater")}</h3>
                    <p>{t("info_main_4")}</p>
                    <h3>{t("Surface WaterBodies")}</h3>
                    <p>{t("info_main_5")}</p>
                    <h3>{t("Agri")}</h3>
                    <p>{t("info_main_6")}</p>
                    <h3>{t("Livelihood")}</h3>
                    <p>{t("info_main_7")}</p>
                </div>

                <div class="tab__content">
                {planMetaData !== null && planMetaData.map((item)=>{
                    return item
                })}

                {planMetaData === null ? <>
                    <h2>Plan not Selected !!</h2>
                </> : <></>}

                </div>

                <div className="closeButtonContainerStyle">
                    <button onClick={onClose} className="closeButtonStyle">Close</button>
                </div>
            </div>
        </div>
    );
};

export default InfoModal;

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

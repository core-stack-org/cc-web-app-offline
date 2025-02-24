import styles from "./Modal.module.css"
import 'react-spring-bottom-sheet/dist/style.css'
import { useState } from "react";
import useMainScreenModal from "../hooks/useMainModal";
import axios from 'axios'
import toast from "react-hot-toast";
import Modal from "./Modal";
import usePlansStore from "../hooks/usePlans";
import { api_url } from "../helper/constants";
import getFormsSubmissions from "../actions/getSubmissionsUpdate"

import useMapLayers from "../hooks/useMapLayers.js";
import i18next from "i18next";
import { useTranslation } from "react-i18next";

const MainScreenModal = () => {

    const isOpen = useMainScreenModal((state) => state.isOpen)
    const onClose = useMainScreenModal((state) => state.onClose)

    const LayerStore = useMapLayers((state) => state);

    //? For getting State, district and Block data
    const [state, setState] = useState("")
    const [district, setDistrict] = useState("")
    const [block, setBlock] = useState("")
    const locationModal = useMainScreenModal((state) => state.locationModal)
    const locationData = useMainScreenModal((state) => state.locationData)
    const onSetLocationModal = useMainScreenModal((state) => state.onSetLocationModal)


    //? States For handling KML upload
    const [file, setFile] = useState();
    const [uploadedFile, setUploadedFile] = useState();
    const [error, setError] = useState();
    const uploadKMLModal = useMainScreenModal((state) => state.uploadKMLModal)
    const onSetUploadKML = useMainScreenModal((state) => state.onSetUploadKML)

    //? States for handling Language Changes
    const languageModal = useMainScreenModal((state) => state.changeLanguage)
    const available_language = i18next.languages
    const language_abbrevation = {
        "hi" : "Hindi",
        "en" : "English"
    }
    const [currentLang, setCurrentLang] = useState(i18next.language)
    const { t } = useTranslation();

    //? States for Handling DPR Generation
    const planID = usePlansStore((state) => state.currentPlan)
    const [email, setEmail] = useState("")
    const generateDPR = useMainScreenModal((state) => state.generateDPR)
    const onSetGenerateDPR = useMainScreenModal((state) => state.onSetGenerateDPR)

    //? States for Handling the Info Display
    const settlementInfo = useMainScreenModal((state) => state.settlementInfo)
    const assetData = useMainScreenModal((state) => state.assetData)
    const onSettlementToggle = useMainScreenModal((state) => state.onSettlementToggle)
    const assetType = useMainScreenModal((state) => state.assetType)
    const assetAllowedNames = {
        "settlement" : {
          "Settlement" : "Settlement ID",
          "Settleme_1" : "Settlement Name",
          "block_name" : "Block Name",
          "number_hou" : "Number of Houses",
          "CASTE_1" : "Largest Caste",
          "CASTE_2" : "Second Largert Caste",
          "assets" : "Type of Assets",
          "Settleme_2" : "Settlement Type",
          "select_one" : "Demands",
          "q1" : "Works Proposed",
          "select_mul" : "Main Issues",
          "plan_id" : "Plan Id",
          "plan_name" : "Plan Name",
          "latitude" : "Latitude",
          "longitude" : "Longitude",
          "Livestock_" : "Livestock Census",
          "farmer_fam" : "Farmer Census",
          "total_hous" : "Total Number of Houses",
          "select_o_1" : "Community Willing to Come together",
          "households":"Total households benefited ?",
        },
        "well" : {
          "plan_id" : "Plan Id",
          "plan_name" : "Plan Name",
          "latitude" : "Latitude",
          "longitude" : "Longitude",
          "select_one" : "Well Owned By",
          "well_id" : "Well Id",
          "households" : "Number of Houselhold Benefitted",
          "beneficiar" : "Beneficiary Settlement Name",
          "block_name" : "Block Name",
          "select_mul" : "Well used by Caste",
          "select_o_1" : "Well Status",
          "select_o_2" : "Maintainence Required",
        },
        "waterStructure" : {
          "identified" : "Waterbody is identified through",
          "wbs_type" : "Type of the water structure",
          "wb_id" : "Water bodies ID",
          "plan_id" : "Plan Id",
          "plan_name" : "Plan Name",
          "latitude" : "Latitude",
          "longitude" : "Longitude",
          "Benefici_1" : "Beneficiary Contact Number",
          "beneficiar" : "Beneficiary Settlement Name",
          "block_name" : "Block Name",
          "select_mul" : "Which Caste Group Uses Water Structure",
          "select_o_5" : "Does it needs Maintainence",
          "select_one" : "Managed By",
          "need_maint": "Maintenance Required",

        }
    }

    //? States of Handling the Bug Report Display
    const BugReportModal = useMainScreenModal((state) => state.BugReportModal)
    const onSetBugReportModal = useMainScreenModal((state) => state.onSetBugReportModal)

    //? States for Handling form submission
    let formsOptions = [
        {"label" : "Settlement Forms", "value" : "add_Settlement_Form"},
        {"label" : "Well Forms", "value" : "add_Well_Form"},
        {"label" : "Water Structure Forms", "value" : "add_Water_Structures_Form"}
    ]
    const [isSyncing, setIsSyncing] = useState(false);
    const formSubmissionModal = useMainScreenModal((state) => state.formSubmissionModal)
    const onSetFormToggle = useMainScreenModal((state) => state.onSetFormToggle)
    const formType = useMainScreenModal((state) => state.formType)
    const onSetFormType = useMainScreenModal((state) => state.onSetFormType)


    const tableStyle = {
        borderCollapse: 'collapse',
        width: '100%',
        marginBottom : '4em'
    };

    const cellStyle = {
        border: '1px solid #ddd',
        padding: '8px',
    };

    if (!isOpen) {
        return null;
    }

    const handleClose = () => {
        if (locationModal) { onSetLocationModal() }
        else if (uploadKMLModal) { onSetUploadKML() }
        else if (settlementInfo){ onSettlementToggle() }
        else if (generateDPR) { onSetGenerateDPR() }
        else if (BugReportModal) { onSetBugReportModal() }
        else if (formSubmissionModal) { onSetFormToggle() }
        onClose()
    }


    const handleChange = (e) => {
        if (e.target.id == "state")
            setState(e.target.value)
        else if (e.target.id == "district")
            setDistrict(e.target.value)
        else
            setBlock(e.target.value)
    }

    const handleLocationChange = () => {
        if (district !== "" && block !== "") {
            const url = `https://nrm.gramvaanidev.org/maps?geoserver_url=https://geoserver.core-stack.org:8443&block_pkey=null&app_name=nrmApp&state_name=${state}&dist_name=${district}&block_name=${block}`
            setState("")
            setDistrict("")
            setBlock("")
            console.log(url)
            window.location.replace(url)
        }
        console.log("Reached Here !")
    }

    const handleKMLFileUpload = (e) => {
        e.preventDefault();
        
        const url = `${api_url}upload_kml/`;
        const formData = new FormData();
        formData.append('file', file);

        formData.append('state', "Gramvaani")
        formData.append('district', localStorage.getItem('dist_name'))
        formData.append('block', localStorage.getItem('block_name'))

        const config = {
            headers: {
                'content-type': 'multipart/form-data',
            },
        };
        axios.post(url, formData, config)
            .then((response) => {
                console.log(response.data);
                setUploadedFile(response.data.file);
                toast.success("File Uploaded !")

                LayerStore.setCustomKMLStatus()
            })
            .catch((error) => {
                console.error("Error uploading file: ", error);
                setError(error);
                toast.error("Error in Uploading")
            });
    }

    const handleFileChange = (e) => {
        setFile(e.target.files[0])
    }

    const handleDPRGeneration = () => {
        console.log("DPR Button Clicked !")

        if (planID !== null) {

            const body = { "plan_id": planID.plan_id, "email_id": email }

            console.log(body)

            const response = fetch(`${api_url}generate_dpr/`, {
                method: "POST",
                headers: {
                    "ngrok-skip-browser-warning": "1",
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(body)
            })
            toast.success("You will receive an email from contact@core-stack.org upon DPR generation. Please check spam box in case you don't find the email.")
        }
        else {
            toast.error("No Plan id selected !")
        }

    }

    const handleLanguageChange = (e) => {
        setCurrentLang(e.target.value)
    }

    const handleLanguage = () => {
        i18next.changeLanguage(currentLang)
        onClose()
    }

    const handleSync = async () => {
        if (isSyncing) return;
        setIsSyncing(true);
        try {
          await getFormsSubmissions(formType)
        } catch (error) {
          console.error('Sync failed:', error);
        } finally {
          setIsSyncing(false);
        }
    };

    const LocationBody = (
        <div className={styles.select_option_group}>
            <div className={styles.select_option}>
                <label className={styles.select_option_label}>{t("Select State")} :</label>
                <select name="state" id="state" value={state} onChange={handleChange} className={styles.select_dropdown}>
                    <option value={""}>None</option>
                    {locationData?.map((item, idx) => {
                        return (<option key={idx} value={item.label}>{item.label}</option>)
                    })}
                </select>
            </div>
            <div className={styles.select_option}>
                <label className={styles.select_option_label} >{t("Select District")} :</label>
                <select name="district" id="district" value={district} onChange={handleChange} className={styles.select_dropdown} disabled={state !== "" ? false : true}>
                    <option value={""}>None</option>
                    {locationData?.map((item) => {
                        if (item.label === state) {
                            return (item.district.map((data, idx) => {
                                return <option key={idx} value={data.label}>{data.label}</option>
                            }))
                        }
                    })}
                </select>
            </div>
            <div className={styles.select_option}>
                <label className={styles.select_option_label}>{t("Select Block")} :</label>
                <select name="block" id="block" value={block} onChange={handleChange} className={styles.select_dropdown} disabled={district !== "" ? false : true}>
                    <option value={""}>None</option>
                    {locationData?.map((item) => {
                        if (item.label === state) {
                            return (item.district.map((data) => {
                                if (data.label == district) {
                                    return (data.blocks.map((val, idx) => {
                                        return <option key={idx} value={val.label}>{val.label}</option>
                                    }))
                                }
                            }))
                        }
                    })}
                </select>
            </div>
            <button className={styles.location_submit_button} onClick={handleLocationChange}>{t("Change Location")}</button>
        </div>
    )

    const uploadKMLBody = (
        <div className={styles.select_option_group}>
            <div className={styles.select_option}>
                <form onSubmit={handleKMLFileUpload}>
                    <label className={styles.select_option_label}>{t("Select File")} :</label>
                    <input type="file" onChange={handleFileChange} accept=".kml" />
                    <button className={styles.location_submit_button} type="submit">Upload</button>
                </form>
            </div>
        </div>
    )

    const generateDPRBody = (
        <div className={styles.select_option_group}>
            <div className={styles.select_option}>
                <label className={styles.select_option_label}>{t("Enter Email")}</label>
                <input className={styles.input_box} value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <button className={styles.location_submit_button} onClick={handleDPRGeneration}>{t("Generate pre-DPR")}</button>
        </div>
    )

    const languageChangeBody = (
        <div className={styles.select_option_group}>
        <div className={styles.select_option}>
            <label className={styles.select_option_label}>{t("Select Language")} :</label>
            <select name="state" id="state" value={currentLang} onChange={handleLanguageChange} className={styles.select_dropdown}>
                <option value={""}>None</option>
                {available_language?.map((item, idx) => {
                    return (<option key={idx} value={item}>{language_abbrevation[item]}</option>)
                })}
            </select>
        </div>
        <button className={styles.location_submit_button} onClick={handleLanguage}>{t("Change Language")}</button>
    </div>
    )

    const informationBody = (
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          padding: '1em',
          marginTop: '0.8em'
          }}>
          <table style={tableStyle}>
              <tbody>
                  {assetData != null && Object.keys(assetData).map((key,idx) =>{
                      if(key != "geometry" && key in assetAllowedNames[assetType]){
                        return(
                            <tr key={idx}>
                                <th style={cellStyle}>{assetAllowedNames[assetType][key]}</th>
                                <td style={cellStyle}>{assetData[key]}</td> 
                            </tr>
                        )
                        
                      }
                  })}
              </tbody>
          </table>
        </div>
    )

    const syncFormDataBody = (
        <div className={styles.select_option_group}>
        <div className={styles.select_option}>
            <label className={styles.select_option_label}>{t("Select Form Type")} :</label>
            <select name="formName" id="formName" value={formType} onChange={(e) => onSetFormType(e.target.value)} className={styles.select_dropdown}>
                <option value={""}>None</option>
                {formsOptions?.map((item, idx) => {
                    return (<option key={idx} value={item.value}>{item.label}</option>)
                })}
            </select>
        </div>
        <button className={styles.location_submit_button} onClick={handleSync}>{isSyncing ? t('Syncing...') : t('Sync Offline Data')}</button>
    </div>
    )
    
    // https://heyform.net/f/CrNngUD1
    const bugReportBody = (
        <>
        <iframe
        title={"Bug Report"}
            // src={"https://docs.google.com/forms/d/e/1FAIpQLSeqc22wzm5e7o6ABKLC2C_avthRoJB8lWWFDt-hBKaTroxT4g/viewform?embedded=true"}
            src={"https://heyform.net/f/CrNngUD1"}
            style={{ width: "100vw", height: "100vh" , marginBottom : '2em'}}
        />
        </>
    )

    let title = null 
    let body = null 

    if(locationModal){title = "Location Selection"; body = LocationBody}
    else if(uploadKMLModal) {title = "Upload KML File"; body = uploadKMLBody}
    else if(generateDPR) {title = "Generate DPR"; body = generateDPRBody}
    else if(settlementInfo) {title = "Asset Information"; body = informationBody}
    else if(BugReportModal) {title = "Report Bug"; body = bugReportBody}
    else if(languageModal) {title = "Choose Language"; body = languageChangeBody}
    else if(formSubmissionModal) {title = "Sync Saved Forms"; body = syncFormDataBody}

    return (
        <>
            <Modal isOpen={isOpen} onClose={handleClose} title={title} body={body} />
        </>
    )
}

export default MainScreenModal

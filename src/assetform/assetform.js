import "reactjs-popup/dist/index.css";
import useOdkModal from "../hooks/useOdkModal";
import Modal from "../components/Modal";
import { useEffect, useCallback, useState } from "react";

import toast from "react-hot-toast";
import { api_url } from "../helper/constants";

import { Feature } from "ol";
import Point from "ol/geom/Point.js";
import { Icon, Style } from "ol/style.js";

import 'survey-core/defaultV2.min.css';
import { Model } from 'survey-core';
import { Survey } from 'survey-react-ui';


const Assetform = () => {

    const isOpen = useOdkModal((state) => state.isOpen)
    const onClose = useOdkModal((state) => state.onClose)
    const currentScreen = useOdkModal((state) => state.currentScreen);

    const odkState = useOdkModal((state) => state.odkState)
    const updateStatus = useOdkModal((state) => state.updateStatus)
    const updateLoadingState = useOdkModal((state) => state.updateLoadingState)
    const updateLayerState = useOdkModal((state) => state.updateLayerStatus)
    const settlementName = useOdkModal((state) => state.settlementName)
    const dbConnection = useOdkModal((state) => state.dbConnection)

    const [modalBody, setModalBody] = useState(<></>)

    let templatesMapping = {
        'add_Settlement_Form': "addSettlement",
        'add_Well_Form': "addWell",
        'add_Water_Structures_Form': "addWaterStructures",
        'add_crop_info': "addCropInfo",

        'propose_recharge_structure': "proposeRechargeStructure",
        'propose_maintenance_groundwater': "proposeMaintenanceGroundwater",

        'propose_maintenance_remote_sense': "proposeMaintenanceRemoteSense",

        'propose_irrigation_work': "proposeNewIrrigation",
        'propose_maintainence_irrigation': "proposeMaintenanceIrrigation"
    }

    let urlMapping = {
        'add_Settlement_Form': "Add_Settlements_form%20_V1.0.1",
        'add_Well_Form': "Add_well_form_V1.0.1",
        'add_Water_Structures_Form': "Add_Waterbodies_Form_V1.0.3",
    }


    // MARK: LOAD EVENT
    const handleOnLoadEvent = async (next_screen, formData) => {

        if (next_screen !== "")
            updateStatus(next_screen)

        const planName = odkState["planName"]
        const plan_id = odkState["planID"]
        const resourceType = odkState["resourceType"]
        const layerName = odkState["layerName"]
        const state = odkState["state"]
        const work_type = odkState["work_type"]
        const layerRef = odkState["layerRef"]
        const updateHook = odkState["updateHook"]
        const iconHook = odkState["iconHook"] 
        const screen_code = odkState["screen_code"];

        // MARK: MAPPING
        if (state == "mapping") {
                try {
                    updateLoadingState(true);

                    const tempFeature = new Feature({
                        geometry : new Point([formData.GPS_point["longitude"], formData.GPS_point["latitude"]]),
                        ...formData
                    });

                    tempFeature.setStyle(
                        new Style({
                          image:
                            new Icon({ src: iconHook})
                        })
                    )

                    await layerRef.current.getSource().addFeature(tempFeature)

                    updateHook(layerRef.current)

                    const submissions = JSON.parse(localStorage.getItem(screen_code) || '[]');

                    submissions.push(formData)

                    const arrayString = JSON.stringify(submissions);

                    localStorage.setItem(screen_code, arrayString);

                    updateLoadingState(false);

                    toast.success("Resource saved offline!");

                } catch (error) {
                    console.error('Error handling offline submission:', error);
                    updateLoadingState(false);
                    toast.error("Failed to save offline submission");
                }
        }

        // // MARK: PLANNING
        // else if (state == "planning") {

        //     try {

        //         updateLoadingState(true)

        //         const payload = {
        //             layer_name: layerName,
        //             work_type: work_type,
        //             plan_id: plan_id,
        //             plan_name: planName,
        //             district_name: localStorage.getItem("dist_name"),
        //             block_name: localStorage.getItem("block_name"),
        //         };

        //         const response = await fetch(`${api_url}add_works/`, {
        //             method: 'POST',
        //             headers: {
        //                 'Content-Type': 'application/json'
        //             },
        //             body: JSON.stringify(payload)
        //         })

        //         const res = await response.json()

        //         if (res.message == "Success") {
        //             toast.success("New Work added !")
        //             updateLayerState(true)
        //         }
        //         else {
        //             toast.error(res.error)
        //         }

        //         updateLoadingState(false)
        //     }
        //     catch (err) {
        //         console.log(err)
        //         updateLoadingState(false)
        //         toast.error("Internal Server Error ! Try Again.")
        //     }
        // }

        onClose()
    }

    // MARK: Temporary saves for offline mode
    const surveyComplete = useCallback((sender) => {
        const formData = sender.data;
        console.log(formData)
        handleOnLoadEvent(odkState["next_screen"],formData);
        onClose();
    }, [odkState, handleOnLoadEvent, onClose]);

    // MARK: Template Forms
    useEffect(() => {
        if (odkState !== null) {
            const screen_code = odkState["screen_code"];

            import(`../templates/${templatesMapping[screen_code]}.json`).then((res) => {

                const screen_code = odkState["screen_code"];
                const latlong = odkState["latlong"];
                const block_name = odkState["block_name"]
                const plan_id = odkState["planID"]
                let planName = odkState["planName"]
                let work_id = odkState["work_id"]
                let grid_id = odkState["grid_id"]

                // MARK: Offline IDs
                let settlementID = crypto.randomUUID().substring(0, 15)
                let wellID = crypto.randomUUID().substring(0, 15)
                let waterbodyID = crypto.randomUUID().substring(0, 15)

                let tempSurvey = new Model(res.default)

                // MARK: Pre fill data
                if (screen_code !== "add_crop_info") {
                    tempSurvey.data = { Settlements_id: settlementID, well_id: wellID, waterbodies_id: waterbodyID, plan_id: plan_id, plan_name: planName, GPS_point: { latitude: latlong[1], longitude: latlong[0] }, block_name: block_name, beneficiary_settlement: settlementName, Corresponding_Work_ID: work_id }
                }
                else {
                    tempSurvey.data = { crop_Grid_id: grid_id, beneficiary_settlement: settlementName, plan_id: plan_id, plan_name: planName }
                }

                tempSurvey.onComplete.add(surveyComplete)

                let tempBody = (<Survey model={tempSurvey} />)
                setModalBody(tempBody)

            }).catch((e) => console.log(e))
        }
    }, [odkState])

    return (<Modal body={modalBody} isOpen={isOpen} onClose={onClose} />)

};

export default Assetform;
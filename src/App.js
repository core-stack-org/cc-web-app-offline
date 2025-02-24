import "./App.css";
import { useState, useEffect } from "react";
import MainMap from "./maps/MainMap.js";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import GroundWaterScreen from "./water/GroundWaterScreen";
import WaterBodiesScreen from "./waterbodies/WaterBodiesScreen";
import AgriScreen from "./agri/AgriScreen";
import ResourceMappingScreen from "./socialmapping/socialmapping";

import HamMenu from "./components/HamMenu.js";
import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import getStates from "./actions/getStates.js";
import useMainScreenModal from "./hooks/useMainModal.js";
import MainScreenModal from "./components/MainScreenModal.js";
import Livelihood from "./livelihood/Livelihood.js";
import usePlansStore from "./hooks/usePlans.js";

import { api_url } from "./helper/constants.js";
import useOdkModal from "./hooks/useOdkModal.js";

function App() {
    const [banner, setBannerVisible] = useState(false)

    const [gpsLocationMain, setGpsLocationMain] = useState(null)

    //State for The Current Screen Name and Icon
    const [screenTitle, setScreenTitle] = useState("")
    const [screenIcon, setScreenIcon] = useState(null)

    // State to set Data for Change Location Modal
    const onSetState = useMainScreenModal((state) => state.onSetState)
    const fetchPlanData = usePlansStore((state) => state.fetchPlans)

    //State to fetch the current selected Settlement
    const settlementName = useOdkModal((state) => state.settlementName)
    const updateDBConnection = useOdkModal((state) => state.updateDBConnection)

    const getCurrentDimension = () => {
        let vh = window.innerHeight * 0.01;
        let vw = window.innerWidth * 0.01;
        document.documentElement.style.setProperty('--vh', `${vh}px`)
        document.documentElement.style.setProperty('--vw', `${vw}px`)
    }

    const getStatesData = async () => {
        let data = await getStates()
        onSetState(data)
    }

    useEffect(() => {

        getCurrentDimension()

        getStatesData()

        //? Grabbing info from the URL
        const queryParameters = new URLSearchParams(window.location.search);

        //? Initialize DB
        // const openRequest = window.indexedDB.open("notes_db", 1);
        // openRequest.addEventListener("error", () =>
        //     console.error("Database failed to open"),
        // );

        // openRequest.addEventListener("success", () => {
        //     console.log("Database opened successfully");
          
        //     // Store the opened database object in the db variable. This is used a lot below
        //     updateDBConnection(openRequest.result)
          
        //     // Run the displayData() function to display the notes already in the IDB
        //     //displayData();
        // });

        // openRequest.addEventListener("upgradeneeded", (e) => {
        //     // Grab a reference to the opened database
        //     let db = e.target.result;
          
        //     // Create an objectStore in our database to store notes and an auto-incrementing key
        //     // An objectStore is similar to a 'table' in a relational database
        //     const objectStore = db.createObjectStore("notes_os", {
        //       keyPath: "id",
        //       autoIncrement: true,
        //     });
          
        //     // Define what data items the objectStore will contain
        //     objectStore.createIndex("title", "title", { unique: false });
        //     objectStore.createIndex("body", "body", { unique: false });
          
        //     console.log("Database setup complete");
        // });

        // MARK: Fetch Plan Data
        localStorage.setItem("isOffline", queryParameters.get("isOffline"));
        let block_id = localStorage.getItem("block_id");

        fetchPlanData(`${api_url}get_plans/?block_id=${block_id}`)

        function updateDimension() {
            let vh = window.innerHeight * 0.01;
            let vw = window.innerWidth * 0.01;
            document.documentElement.style.setProperty('--vh', `${vh}px`)
            document.documentElement.style.setProperty('--vw', `${vw}px`)
        }

        window.addEventListener("resize", updateDimension)
        return () => {
            window.removeEventListener("resize", updateDimension);
            //window.removeEventListener("success")
            //window.removeEventListener("error")
        };
    }, []);

    const handleLatLongClick = () => {
        if (gpsLocationMain != null) {
            navigator.clipboard.writeText(gpsLocationMain)
        }
    }

    return (
        <>
            <HamMenu screenTitle={screenTitle} screenIcon={screenIcon} />
            <BrowserRouter>
                <Routes>
                    <Route path="/maps" element={<MainMap setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/water" element={<GroundWaterScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/waterbodies" element={<WaterBodiesScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/socialmapping" element={<ResourceMappingScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/agri" element={<AgriScreen setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />}/>
                    <Route path="/livelihood" element={<Livelihood setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />} />
                    <Route path="/forest" element={<Livelihood setScreenTitle={setScreenTitle} setScreenIcon={setScreenIcon} setGpsLocationMain={setGpsLocationMain} />} />
                </Routes>
            </BrowserRouter>

            <div className="bottom-bar-banner">
                <div className="bottom-banner-main">
                    {settlementName !== null && (
                        <div className="bottom-banner-text">
                            <strong>Settlement:</strong> {settlementName}
                        </div>
                    )}                    
                    <div className="bottom-banner-text"><strong>Lat:</strong>{" "}{gpsLocationMain !== null ? Math.round(gpsLocationMain[1] * 100) / 100 : "Location not found."}</div>
                    <div className="bottom-banner-text"><strong>Long:</strong>{" "}{gpsLocationMain !== null ? Math.round(gpsLocationMain[0] * 100) / 100 : "Location not found."}</div>
                    <div>
                        <button className="bottom-copy-button" onClick={handleLatLongClick}>
                            <FontAwesomeIcon icon={faCopy} className="" />
                        </button>
                    </div>
                </div>
            </div>

            <div className="location-selector-modal">
                <MainScreenModal />
            </div>
        </>
    );
}

export default App;

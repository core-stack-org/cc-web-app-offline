import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import styles from "./Livelihood.module.css";

import * as extent from "ol/extent";
import * as proj from "ol/proj";

import { Fill, Icon, Stroke, Style } from "ol/style.js";
import { Map, View, Geolocation, Feature } from "ol";
import { Vector as VectorSource } from "ol/source.js";
import React, { useEffect, useRef, useState } from "react";
import {
    mapContainerStyle,
} from "./styles";
import { faCompass, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { getVectorLayer } from "../helper/utils";
import toast, { Toaster } from 'react-hot-toast';

import { fetchTileInfo } from "../helper/fetchTileInfo.js";
import { loadOfflineBaseLayer } from "../helper/offlineBaseLayer.js";

import { Circle as CircleStyle } from "ol/style.js";
import InfoLivelihoodModal from "../info/infoLivelihoodModal";
import Loader from "../info/loader"
import Point from "ol/geom/Point.js";
import Select from "ol/interaction/Select.js";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";

import map_marker from "../asset/map_marker.svg";
import yellow_marker from "../asset/settlement_icon.svg";
import selectSettlementIcon from "../asset/selected_settlement.svg";
import selectlivelihoodIcon from "../asset/livelihood_proposed.svg";
import { useNavigate } from "react-router-dom";

import Button from "../components/Button.js";

import useOdkModal from '../hooks/useOdkModal';
import Assetform from "../assetform/assetform.js";
import usePlansStore from "../hooks/usePlans.js";

import resourceScreenIcon from "../asset/resourceScreenIcon.svg"
import MenuSimple from "../components/MenuSimple.js";

import { useTranslation } from 'react-i18next';

function Livelihood({ setScreenTitle, setScreenIcon, setGpsLocationMain }) {

    const mapElement = useRef();
    const mapRef = useRef();
    const osmLayerRef = useRef();
    const adminLayerRef = useRef();
    const featureLayerRef = useRef();
    const positionFeatureRef = useRef();
    const hamletLayerRef = useRef();
    const planLayerRef = useRef();


    const [currentlatlong, setCurrentLatLong] = useState(null);
    const [run, setRun] = useState(false);
    const [gpsLocation, setGpsLocation] = useState(null);
    const [isInBlock, setIsInBlock] = useState(true);
    const [showInfoSmModal, setShowInfoSmModal] = useState(false);
    const [isMapClicked, setMapClicked] = useState(false)

    const [currentHemlat, setCurrentHemlat] = useState(null);
    const [nextScreen, setNextScreen] = useState(false);

    const onSetState = useOdkModal((state) => state.onSetState)
    const onOpen = useOdkModal((state) => state.onOpen)
    const onCloseOdk = useOdkModal((state) => state.onClose);

    const updateStatus = useOdkModal((state) => state.updateStatus)

    const updateSettlementName = useOdkModal((state) => state.updateSettlementName)

    const isLayerUpdating = useOdkModal((state) => state.isLoading);
    const isLayerUpdated = useOdkModal((state) => state.LayerUpdated);
    const updateLayerState = useOdkModal((state) => state.updateLayerStatus);

    const { t } = useTranslation();

    const { currentPlan, zoomLevel, mapCenter, setZoomLevel, setMapCenter } = usePlansStore((state) => {
        return { 
            currentPlan: state.currentPlan,
            zoomLevel : state.zoomLevel,
            mapCenter : state.mapCenter,
            setZoomLevel : state.setZoomLevel,
            setMapCenter : state.setMapCenter
        };
    });

    const iconFeature = new Feature({
        geometry: new Point([0, 0]),
    });

    const iconStyle = new Style({
        image: new Icon({
            anchor: [0.5, 46],
            anchorXUnits: "fraction",
            anchorYUnits: "pixels",
            src: map_marker,
        }),
    });

    iconFeature.setStyle(iconStyle);
    const navigate = useNavigate();
    
    // MARK: Handle Button Clicks
    const handleAddLivelihoodbutton = () => {

        if (!currentlatlong) {
            window.alert("Place the marker before clicking the button.");
        } else {
            let redirectState = {
                latlong: currentlatlong,
                screen_code: "add_livelihood",
                block_name: localStorage.getItem("block_name"),
                redirect_url: "",
                next_screen: "",
                planID: currentPlan.plan_id,
                planName: currentPlan.plan.toLowerCase(),
                settlementName : currentHemlat,
                state: "planning",
                layerName: "planning_layer",
                work_type: "livelihood",
            }

            onSetState(redirectState)

            onOpen()
        }
    };


    const zoomToBlockExtents = () => {
        if (mapRef.current) {
            const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
            const blockCenter = extent.getCenter(blockExtent);

            // Zoom to block extents
            mapRef.current.getView().setCenter(blockCenter);
            mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed

            setIsInBlock(true);
        }
    };


    const handleInfoClick = () => {
        setShowInfoSmModal(true);
    };

    const handleInfoClose = () => {
        setShowInfoSmModal(false);
    };



    const zoomToGPSLocation = () => {
        // For the time being, zooming to current location for testing
        // To zoom only within the extent of the block, remove the marked lines and uncomment the lines below it.
        try {
            if (mapRef.current && gpsLocation) {
                mapRef.current.getView().setCenter(gpsLocation);
                positionFeatureRef.current.setGeometry(new Point(gpsLocation));
                mapRef.current.getView().setZoom(18); // remove after testing
            }
            const blockExtent = adminLayerRef.current.getSource().getExtent();
            const gpsCoordinate = proj.fromLonLat(gpsLocation);
            const isWithinBlock = extent.containsCoordinate(blockExtent, gpsLocation);
            setIsInBlock(isWithinBlock);
        } catch (err) {
            toast("Getting Location !")
            console.log(err)
        }
    };

    const handleLayerToggle = (layer) => {
        layer.setVisible(!layer.getVisible());
    };

    const handleFinishButton = () => {
        const url =
            "/maps?geoserver_url=" +
            localStorage.getItem("geoserver_url") +
            "&block_pkey=" +
            localStorage.getItem("block_pkey") +
            "&app_name=" +
            localStorage.getItem("app_name") +
            "&dist_name=" +
            localStorage.getItem("dist_name") +
            "&block_name=" +
            localStorage.getItem("block_name");
        navigate(url);
    };

    const handleSettlementSelection = () =>{
        mapRef.current.removeLayer(hamletLayerRef.current)
        setNextScreen(true)
    }

    useEffect(() => {
        setScreenTitle("Livelihood")
        setScreenIcon(resourceScreenIcon)

        updateStatus("add_hemlet")
        onCloseOdk()

        const promptForGeolocation = () => {
            if ("geolocation" in navigator) {
                navigator.geolocation.getCurrentPosition(
                    (position) => {
                        const { latitude, longitude } = position.coords;
                        setGpsLocation([longitude, latitude]);
                        setGpsLocationMain([longitude, latitude])
                    },
                    (error) => {
                        console.error("Error accessing geolocation:", error);
                    }
                );
            } else {
                console.error("Geolocation is not available in this browser.");
            }
        };

        promptForGeolocation();
    }, []);

    let isOffline = localStorage.getItem("isOffline");
    console.log("isOffline", isOffline);
    console.log("LIVELIHOOD SCREEN");

    // MARK: Layers
    useEffect(() => {
        let BaseLayer = null
        let planLayer = null
        let pointLayer = null
        let settlementLayer = null;
        let view = null;

        if (isOffline) {
            console.log("Loading offline tiles");
            const tileInfo = fetchTileInfo();
            const offlineBaseLayer = loadOfflineBaseLayer(tileInfo.zoom, tileInfo.minX, tileInfo.maxX, tileInfo.minY, tileInfo.maxY);
            BaseLayer = offlineBaseLayer.layer;
      
            view = new View({
              projection: 'EPSG:4326',
              extent: offlineBaseLayer.extent,
              constrainOnlyCenter: true,
              zoom: 17,
              minZoom: 17,
              maxZoom: 17
            });
      
            const centerX = (offlineBaseLayer.extent[0] + offlineBaseLayer.extent[2]) / 2;
            const centerY = (offlineBaseLayer.extent[1] + offlineBaseLayer.extent[3]) / 2;
            view.setCenter([centerX, centerY]);
          } else {
            console.log("Loading online tiles");
            BaseLayer = new TileLayer({
              source: new XYZ({
                url: "https://mt1.google.com/vt/lyrs=s&x={x}&y={y}&z={z}",
                maxZoom: 30,
              }),
              visible: true,
            });
      
            view = new View({
              center: [78.9, 20.5],
              zoom: zoomLevel !== null ? zoomLevel : 11,
              projection: "EPSG:4326",
              multiWorld: true,
            });
          }

        if (settlementLayer === null) {
                settlementLayer = getVectorLayer(
                    "resources",
                    "settlement_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
                    true,
                    true,
                    "settlement", // used for offline mode to fetch the correct resource
                    currentPlan.plan_id,
                    isOffline
                  );
        }

        // TODO: Add the plan layer for livelihood
        // Are we making the livelihood plan layer??
        if(planLayer == null){
            planLayer = getVectorLayer(
                "works",
                "hemlet_layer" + localStorage.getItem("block_name").toLowerCase(),
                true,
                false,
                "livelihood",
                currentPlan.plan_id
            );
        }


        //if(adminLayer === null){

        const adminLayer = getVectorLayer(
            "panchayat_boundaries",
            localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
            true,
            false,
            null,
            null,
            isOffline,
            null,
            null
          );

        //  //LayerStore.UpdateAdminLayer_Social(adminLayer)
        //}

        const positionFeature = new Feature({
            // geometry: new Point([78.9, 20.5]),
            style: new Style({
                image: new CircleStyle({
                    radius: 6,
                    fill: new Fill({
                        color: "#3399CC",
                    }),
                    stroke: new Stroke({
                        color: "#3399CC",
                        width: 5,
                    }),
                }),
            }),
            visible: true,
        });



        if (pointLayer === null) {

            pointLayer = new VectorLayer({
                source: new VectorSource({
                    features: [positionFeature],
                }),
            });

            //LayerStore.UpdatePointLayer_LH(pointLayer)
        }

        const vectorSource = new VectorSource({
            features: [iconFeature],
        });

        const featureLayer = new VectorLayer({
            source: vectorSource,
            visible: true,
        });

        osmLayerRef.current = BaseLayer;
        adminLayerRef.current = adminLayer;
        positionFeatureRef.current = positionFeature;
        featureLayerRef.current = featureLayer;
        hamletLayerRef.current = settlementLayer;
        planLayerRef.current = planLayer;

        positionFeatureRef.current.setStyle(
            new Style({
                image: new CircleStyle({
                    radius: 8,
                    fill: new Fill({
                        color: '#3399CC',
                    }),
                    stroke: new Stroke({
                        color: '#fff',
                        width: 3,
                    }),
                }),
            })
        );

        hamletLayerRef.current.setStyle(
            new Style({
                image: new Icon({ src: yellow_marker, scale : 0.4 }),
            })
        )

        if (gpsLocation) {
            const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
            //const gpsCoordinate = proj.fromLonLat(gpsLocation);
            positionFeatureRef.current.setGeometry(new Point(gpsLocation));
            const isWithinExtent = extent.containsCoordinate(
                blockExtent,
                gpsLocation
            );

            if (isWithinExtent) {
                // Zoom to GPS location and adjust the view
                mapRef.current.getView().setCenter(gpsLocation);
                mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed
            }
        }

        

        const selected_style_settlement = new Style({
            image: new Icon({ src: selectSettlementIcon }),
          });

        planLayer.setStyle(
            new Style({
                image: new Icon({ src: selectlivelihoodIcon }),
            })
        );

      
        const select_Settlement = new Select({ style: selected_style_settlement });

        // MARK: Initialize the map
        const initialMap = new Map({
            target: mapElement.current,
            layers: [
                BaseLayer,
                adminLayer,
                settlementLayer,
                featureLayer,
                planLayer,
                new VectorLayer({
                    source: new VectorSource({
                        features: [positionFeature]
                })
            })
            ],
            view: view
        });

        mapRef.current = initialMap;

        initialMap.on("click", (e) => {

            setCurrentLatLong(e.coordinate);

            initialMap.removeInteraction(select_Settlement);

            setMapClicked(true)

            initialMap.forEachFeatureAtPixel(
                e.pixel,
                function(feature, layer) {

                    if (layer == adminLayer) {

                        handleLayerToggle(featureLayerRef.current);
                        //toast.success(`Selected admin Layer with id ${feature.values_.waterbodie}`)

                        iconFeature.setStyle(iconStyle);
                        iconFeature.getGeometry().setCoordinates(e.coordinate);
                    }

                    if(layer == settlementLayer){
                        updateSettlementName(feature.values_.Settleme_1)
                        setCurrentHemlat(feature.values_.Settleme_1)
                        initialMap.addInteraction(select_Settlement);
                    }

                    featureLayerRef.current.setVisible(true);
                    iconFeature.setStyle(iconStyle);
                    iconFeature.getGeometry().setCoordinates(e.coordinate);
                }
            );
            iconFeature.setStyle(iconStyle);
            iconFeature.getGeometry().setCoordinates(e.coordinate);

        });

        const layerFilter = (temp) => {
            if (temp == planLayer)
                return true
            return false
        }

        initialMap.on('pointermove', function(e) {
            const pixel = initialMap.getEventPixel(e.originalEvent)
            const hit = initialMap.hasFeatureAtPixel(pixel, { layerFilter })
            initialMap.getTarget().style.cursor = hit ? 'pointer' : '';
        });

        const Vectorsource = adminLayer.getSource();
        Vectorsource.once("change", function(e) {
            if (Vectorsource.getState() === "ready") {
                //const arr = Vectorsource.getExtent();
                //const mapcenter = [(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2];
                initialMap.getView().setCenter(mapCenter);
                //initialMap.getView().setZoom(13);
            }
        });

        mapRef.current.on('moveend', (e) => {
            let newZoom = mapRef.current.getView().getZoom()
            var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
            setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
            setZoomLevel(newZoom)
        })

        const accuracyFeature = new Feature();
        //}

        //if(geolocation === null){

        const geolocation = new Geolocation({
            // enableHighAccuracy must be set to true to have the heading value.
            trackingOptions: {
                enableHighAccuracy: true,
            },
            projection: view.getProjection(),
        });

        geolocation.on('change:accuracyGeometry', function() {
            accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
        });

        geolocation.on('change', function() {
            const coordinates = geolocation.getPosition();
            const accuracy = geolocation.getAccuracy();
            setGpsLocation(coordinates)
            positionFeatureRef.current.setGeometry(coordinates ? new Point(coordinates) : null);
        });

        geolocation.setTracking(true);

        new VectorLayer({
            map: initialMap,
            source: new VectorSource({
                features: [accuracyFeature, positionFeature]
            })
        })

        return () => {
            initialMap.setTarget(null);
        };
    }, [currentPlan]);  

    useEffect(() => {
        if (isLayerUpdated) {
          let planLayer = null;
    
          planLayer = getVectorLayer(
            "works",
            "hemlet_layer" + localStorage.getItem("block_name").toLowerCase(),
            true,
            false,
            "livelihood",
            currentPlan.plan_id
        );
    
          if (planLayer !== null) {
            planLayer.setStyle(
                new Style({
                    image: new Icon({ src: selectlivelihoodIcon }),
                })
            );
    
          }
    
          mapRef.current.removeLayer(planLayerRef.current);
    
          planLayerRef.current = planLayer;
    
          mapRef.current.addLayer(planLayer);
    
          updateLayerState(false);
        }
      }, [isLayerUpdated]);

    return (
        <>
            <div style={mapContainerStyle} className="t2">
                <Toaster />
                <Assetform />

                <div ref={mapElement} style={{ width: "100%", height: "100%" }} />

                <Loader isOpen={isLayerUpdating} onClose={handleInfoClose} />

                <div className={styles.header_buttons}>
                    <MenuSimple isDisabled={true}/>

                </div>

                <div className={styles.header_secondary_buttons}>
                    <div className={styles.header_secondary_button}>
                        <Button onClick={handleInfoClick} isIcon={true} icon={faInfoCircle} />
                    </div>
                    <div className={styles.header_secondary_button}>
                        <Button onClick={zoomToGPSLocation} isIcon={true} icon={faCrosshairs} />
                    </div>
                    {!isInBlock && (
                        <Button onClick={zoomToBlockExtents} isIcon={true} icon={faCompass} />
                    )}
                </div>

                <InfoLivelihoodModal isOpen={showInfoSmModal} onClose={handleInfoClose} />

                {!nextScreen &&
                    <div className={styles.footer_buttons}>
                        <Button onClick={handleSettlementSelection} label={t("Add Livelihood")} isNext={true} isDisabled={isMapClicked}/>
                    </div>
                }

                {nextScreen &&
                    <div className={styles.footer_buttons}>
                        <Button onClick={handleAddLivelihoodbutton} label={t("Provide Specifications")} isNext={true} isDisabled={isMapClicked}/>
                        <Button onClick={handleFinishButton} label={t("Finish")} isNext={true} />
                    </div>
                }

            </div>
        </>
    );
}

export default Livelihood;

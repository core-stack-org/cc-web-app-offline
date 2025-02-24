import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import styles from "./WaterBodiesScreen.module.css";

import * as extent from "ol/extent";

import { Circle, Fill, Icon, Stroke, Style } from "ol/style.js";
import { Feature, Map, View, Geolocation } from "ol";
import React, { useEffect, useRef, useState } from "react";

import { faCompass, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import toast, { Toaster } from "react-hot-toast";

import { fetchTileInfo } from "../helper/fetchTileInfo.js";
import { loadOfflineBaseLayer } from "../helper/offlineBaseLayer.js";

import { Circle as CircleStyle } from "ol/style.js";
import InfoWaterBodyModal from "../info/infoWaterBodyModal";
import Loader from "../info/loader";
import { Point } from "ol/geom";
import PopUpSheet from "../info/NregaInfoBox.js";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import { getVectorLayer } from "../helper/utils";
import map_marker from "../asset/map_marker.svg";
import { useNavigate } from "react-router-dom";

import settlement_proposed from "../asset/settlement_icon.svg";
import waterbodies_proposed from "../asset/waterbodies_proposed.svg";
import checkDam_proposed from "../asset/check_dam_proposed.svg";
import canals_proposed from "../asset/canal_proposed.svg";
import tcb_proposed from "../asset/tcb_proposed.svg";
import fisheries_proposed from "../asset/fisheries_proposed.svg";

import Button from "../components/Button";

import useAnalyzeModal from "../hooks/useAnalyzeModal";
import useOdkModal from "../hooks/useOdkModal";
import Assetform from "../assetform/assetform.js";
import WaterBodiesModal from "../analyze/WaterBodiesModal.js";

import waterbodiesScreenIcon from "../asset/waterbodiesScreenIcon.svg";
import useLayersModal from "../hooks/useLayersModal.js";
import usePlansStore from "../hooks/usePlans.js";
import MenuSimple from "../components/MenuSimple.js";
import LayersBottomSheet from "../components/LayersBottomSheet.js";
import useMapLayers from "../hooks/useMapLayers.js";
import useNregaYears from "../hooks/useNregaYears.js";

import { useTranslation } from "react-i18next";

const notify_provide_maintenance = () =>
  toast("Place the marker on the map and provide specifications", {
    duration: 6000,
    position: "top-center",
    style: {
      borderRadius: "10px",
      background: "#333",
      color: "#fff",
    },
  });

function WaterBodiesScreen({
  setScreenTitle,
  setScreenIcon,
  setGpsLocationMain,
}) {
  const mapElement = useRef();
  const mapRef = useRef();
  const osmLayerRef = useRef();
  const adminLayerRef = useRef();
  const waterBodiesLayerRef = useRef();
  const nregaLayerRef = useRef();
  const hemletLayerRef = useRef();
  const planLayerRef = useRef();
  const positionFeatureRef = useRef();
  const markerFeatureRef = useRef();
  const drainageLayerRef = useRef();
  const waterBodiesResourceLayerRef = useRef();

  const [currentfeature, setCurrentFeature] = useState(null);
  const [buttondisplay, setButtonDisplay] = useState(null);
  const [showInfoWaterBodyModal, setShowInfoWaterBodyModal] = useState(false);
  const [selectedFeatures, setSelectedFeatures] = useState([]);
  const [showBottomSheet, setShowBottomSheet] = useState(false);
  const [currentlatlong, setCurrentLatLong] = useState(null);
  const [isProposeMaintenanceActive, setIsProposeMaintenanceActive] =
    useState(false);

  const [isAnalyzeActive, setAnalyzeActive] = useState(false);

  const [gpsLocation, setGpsLocation] = useState(null);
  const [isInBlock, setIsInBlock] = useState(true);

  const [isWaterBodySelected, setIsWaterBodySelected] = useState(null);
  const [selectedWork, setSelectedWork] = useState(null);

  const onOpen = useAnalyzeModal((state) => state.onOpen);

  const onSetState = useOdkModal((state) => state.onSetState);
  const onOpenOdk = useOdkModal((state) => state.onOpen);
  const onCloseOdk = useOdkModal((state) => state.onClose);

  const currentScreen = useOdkModal((state) => state.currentScreen);

  const updateStatus = useOdkModal((state) => state.updateStatus);
  const isLayerUpdating = useOdkModal((state) => state.isLoading);
  const isLayerUpdated = useOdkModal((state) => state.LayerUpdated);
  const updateLayerState = useOdkModal((state) => state.updateLayerStatus);

  const onOpenLayers = useLayersModal((state) => state.onOpen);

  const { t } = useTranslation();

  const LayerStore = useMapLayers((state) => state);

  const { currentPlan, zoomLevel, mapCenter, setZoomLevel, setMapCenter } =
    usePlansStore((state) => {
      return {
        currentPlan: state.currentPlan,
        zoomLevel: state.zoomLevel,
        mapCenter: state.mapCenter,
        setZoomLevel: state.setZoomLevel,
        setMapCenter: state.setMapCenter,
      };
    });

  const nregaYears = useNregaYears((state) => state.nregaYears);
  const setNregaYears = useNregaYears((state) => state.setNregaYears);

  const navigate = useNavigate();

  //? State Machine Code
  const STATE_MACHINE = {
    main_screen: {
      Screen: "main_screen",
    },
    add_hemlet: {
      Screen: "add_hemlet",
      BACK: "main_screen",
    },
  };

  const state_transition = (newScreen) => {
    updateStatus(newScreen);
    window.history.pushState(null, "", `#${newScreen}`);
  };

  // MARK: Handle Button Click
  const handleInfoClick = () => {
    setShowInfoWaterBodyModal(true);
  };

  const handleInfoClose = () => {
    setShowInfoWaterBodyModal(false);
  };

  const handleAnalyzeButtonClick = () => {
    const keysToStore = [
      "k_18-19", "kr_18-19", "krz_18-19",
      "k_19-20", "kr_19-20", "krz_19-20",
      "k_20-21", "kr_20-21", "krz_20-21",
      "k_21-22", "kr_21-22", "krz_21-22",
      "k_22-23", "kr_22-23", "krz_22-23",
      "area_ored"
    ];

    keysToStore.forEach(key => {
      try {
        const value = currentfeature.values_[key];
        if (value !== undefined) {
          sessionStorage.setItem(key, value);
        } else {
          console.warn(`Warning: ${key} is undefined in currentfeature.values_`);
        }
      } catch (error) {
        console.error(`Error storing ${key}:`, error);
      }
    });

    // Force modal to update by closing and reopening
    useAnalyzeModal.getState().onClose();
    setTimeout(() => {
      useAnalyzeModal.getState().onOpen();
    }, 0);
  };


  const handleProposeMaitenance = () => {
    if (currentPlan !== null) {
      setIsProposeMaintenanceActive(true);
      state_transition("add_hemlet");
      waterBodiesLayerRef.current.setVisible(false);
      hemletLayerRef.current.setVisible(true);
      notify_provide_maintenance();

      // show layer
      waterBodiesLayerRef.current.setVisible(true);
    } else {
      toast.error("First, select a plan!");
    }
  };

  const handleFinishButton = () => {
    setIsProposeMaintenanceActive(false);

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

  const handleFeedbackButtonClick = (latlong) => {
    if (isWaterBodySelected) {
      let redirectState = {
        latlong: latlong,
        screen_code: "add_propose_maintainence_satellite",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "show_hamlet_layer",
        layerName: "planning_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        state: "planning",
        work_type: "main_swb",
        work_id: selectedWork,
      };

      onSetState(redirectState);

      onOpenOdk();
    } else {
      let redirectState = {
        latlong: latlong,
        screen_code: "add_remote_sensed_waterbodies",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "show_hamlet_layer",
        layerName: "planning_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        state: "planning",
        work_type: "main_swb",
        work_id: selectedWork,
      };

      onSetState(redirectState);

      onOpenOdk();
    }
  };

  const drainageColors = [
    "03045E",
    "023E8A",
    "0077B6",
    "0096C7",
    "00B4D8",
    "48CAE4",
    "90E0EF",
    "ADE8F4",
    "CAF0F8",
  ];

  useEffect(() => {
    setScreenTitle("Surface WaterBodies");
    setScreenIcon(waterbodiesScreenIcon);
    updateStatus("main_screen");
    onCloseOdk();
    const promptForGeolocation = () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const { latitude, longitude } = position.coords;
            setGpsLocation([longitude, latitude]);
            setGpsLocationMain([longitude, latitude]);
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
  console.log("SURFACE WATERBODIES SCREEN");

  // MARK: Map Layers
  useEffect(() => {
    const blockName = localStorage.getItem("block_name")?.toLowerCase().replace(/\s+/g, '_');
    const distName = localStorage.getItem("dist_name")?.toLowerCase().replace(/\s+/g, '_');
    let waterBodyLayerName = "surface_waterbodies_" + distName + "_" + blockName;

    let BaseLayer = null;
    let waterBodiesLayer = null;
    let nregaLayer = null;
    let hamlet_layer = null;
    let planLayer = null;
    let adminLayer = null;
    let waterbodies_resource_layer = null;
    let drainageLayer = null;
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

    if (waterBodiesLayer === null) {
      waterBodiesLayer = getVectorLayer("water_bodies", waterBodyLayerName, true, true, "surface_waterbodies", null, isOffline, null, null);
    }

    if (nregaLayer === null) {
      nregaLayer = getVectorLayer(
        "nrega_assets",
        localStorage.getItem("dist_name").toLowerCase() +
        "_" +
        localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        null,
        null,
        isOffline,
        null,
        setNregaYears
      );
    }

    adminLayer = getVectorLayer(
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

    if (hamlet_layer === null) {
      hamlet_layer = getVectorLayer(
        "resources",
        "settlement_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "settlement", // used for offline mode to fetch the correct resource
        currentPlan.plan_id,
        isOffline
      );

    }

    if (planLayer === null) {
      planLayer = getVectorLayer(
        "works",
        "plan_layer_wb" + localStorage.getItem("block_name").toLowerCase(),
        true,
        false,
        "main_swb",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );
    }

    // MARK: Resource Layer
    if (waterbodies_resource_layer == null) {
      waterbodies_resource_layer = getVectorLayer(
        "resources",
        "wb_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "waterbody",
        currentPlan.plan_id,
        isOffline
      );
    }

    if (drainageLayer === null) {
      drainageLayer = getVectorLayer(
        "drainage",
        localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
        false,
        true,
        "drainage",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );
    }

    drainageLayer.setStyle(function (feature) {
      let order = feature.values_.ORDER;

      return new Style({
        stroke: new Stroke({
          color: `#${drainageColors[order - 1]}`,
          width: 2.0,
        }),
      });
    });

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

    positionFeature.setStyle(
      new Style({
        image: new CircleStyle({
          radius: 8,
          fill: new Fill({
            color: "#3399CC",
          }),
          stroke: new Stroke({
            color: "#fff",
            width: 3,
          }),
        }),
      })
    );

    waterbodies_resource_layer.setStyle(
      new Style({
        image: new Icon({ src: waterbodies_proposed }),
      })
    );

    osmLayerRef.current = BaseLayer;
    adminLayerRef.current = adminLayer;
    waterBodiesLayerRef.current = waterBodiesLayer;
    nregaLayerRef.current = nregaLayer;
    hemletLayerRef.current = hamlet_layer;
    planLayerRef.current = planLayer;
    positionFeatureRef.current = positionFeature;
    drainageLayerRef.current = drainageLayer;
    waterBodiesResourceLayerRef.current = waterbodies_resource_layer;

    planLayerRef.current.setStyle(function (feature) {
      let stats = feature.values_.work_type;

      if (stats == "Repair water body") {
        return new Style({
          image: new Icon({ src: waterbodies_proposed }),
        });
      }
      if (stats == "Repair check dam") {
        return new Style({
          image: new Icon({ src: checkDam_proposed }),
        });
      }
      if (stats == "Repair TCB") {
        return new Style({
          image: new Icon({ src: tcb_proposed }),
        });
      }
      if (stats == "Repair canal") {
        return new Style({
          image: new Icon({ src: canals_proposed }),
        });
      }
      if (stats == "Plan fishery") {
        return new Style({
          image: new Icon({ src: fisheries_proposed }),
        });
      }
    });

    hemletLayerRef.current.setStyle(
      new Style({
        image: new Icon({ src: settlement_proposed, scale: 0.4 }),
      })
    );

    waterBodiesLayer.setStyle(
      new Style({
        stroke: new Stroke({ color: "#6495ed", width: 5 }),
        fill: new Fill({ color: "rgba(100, 149, 237, 0.5)" }),
      })
    );

    // const view = new View({
    //   center: [78.9, 20.5],
    //   zoom: zoomLevel !== null ? zoomLevel : 13,
    //   projection: "EPSG:4326",
    // });

    // const initialMap = new Map({
    //   target: mapElement.current,
    //   layers: [
    //     BaseLayer,
    //     waterBodiesLayer,
    //     nregaLayer,
    //     adminLayer,
    //     drainageLayer,
    //     hamlet_layer,
    //     planLayer,
    //     waterbodies_resource_layer,
    //   ],
    //   view: view,
    // });

    // mapRef.current = initialMap;

    // MARK: Initial Map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        BaseLayer,
        waterBodiesLayer,
        nregaLayer,
        adminLayer,
        drainageLayer,
        hamlet_layer,
        planLayer,
        waterbodies_resource_layer,
        new VectorLayer({
          source: new VectorSource({
            features: [positionFeature]
          })
        })
      ],
      view: view
    });

    mapRef.current = initialMap;

    //! For Cleaning if any layers present in it then change status to reflect changes in bottomsheet

    LayerStore.updateStatus(false);

    LayerStore.resetLayersState();

    LayerStore.addLayersState(
      "Water Body Layer",
      waterBodiesLayerRef,
      LayerStore.Layers
    );
    LayerStore.addLayersState("NREGA Layer", nregaLayerRef, LayerStore.Layers);
    LayerStore.addLayersState(
      "Drainage Layer",
      drainageLayerRef,
      LayerStore.Layers
    );
    LayerStore.addLayersState("Plan Layer", planLayerRef, LayerStore.Layers);
    LayerStore.addLayersState(
      "Settlement Layer",
      hemletLayerRef,
      LayerStore.Layers
    );
    LayerStore.addLayersState(
      "Water Structures Layer",
      waterBodiesResourceLayerRef,
      LayerStore.Layers
    );

    LayerStore.updateStatus(true);

    const Vectorsource = adminLayer.getSource();
    Vectorsource.once("change", function (e) {
      if (Vectorsource.getState() === "ready") {
        initialMap.getView().setCenter(mapCenter);
      }
    });

    mapRef.current.on("moveend", (e) => {
      let newZoom = mapRef.current.getView().getZoom();
      var arr = mapRef.current
        .getView()
        .calculateExtent(mapRef.current.getSize());
      setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2]);
      setZoomLevel(newZoom);
    });

    const accuracyFeature = new Feature();

    const geolocation = new Geolocation({
      // enableHighAccuracy must be set to true to have the heading value.
      trackingOptions: {
        enableHighAccuracy: true,
      },
      projection: view.getProjection(),
    });

    geolocation.on("change:accuracyGeometry", function () {
      accuracyFeature.setGeometry(geolocation.getAccuracyGeometry());
    });

    geolocation.on("change", function () {
      const coordinates = geolocation.getPosition();
      const accuracy = geolocation.getAccuracy();
      setGpsLocation(coordinates);
      positionFeatureRef.current.setGeometry(
        coordinates ? new Point(coordinates) : null
      );
    });

    geolocation.setTracking(true);

    new VectorLayer({
      map: initialMap,
      source: new VectorSource({
        features: [accuracyFeature, positionFeature],
      }),
    });

    const markerFeature = new Feature();

    const iconStyle = new Style({
      image: new Icon({
        anchor: [0.5, 46],
        anchorXUnits: "fraction",
        anchorYUnits: "pixels",
        src: map_marker,
      }),
    });

    markerFeatureRef.current = new VectorLayer({
      map: mapRef.current,
      source: new VectorSource({
        features: [markerFeature],
      }),
      style: iconStyle,
    });

    mapRef.current.on("click", (e) => {
      setCurrentLatLong(e.coordinate);

      markerFeature.setGeometry(new Point(e.coordinate));

      markerFeatureRef.current.setVisible(true);

      setButtonDisplay(false);

      setSelectedWork(null);

      setAnalyzeActive(false);

      initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (layer === waterBodiesLayer) {
          setCurrentFeature(feature);
          setButtonDisplay(true);
          toast.success(`Selected Water bodies Layer with id ${feature.id_}`);
          setIsWaterBodySelected(true);
          setSelectedWork(feature.values_.UID);
          setAnalyzeActive(true);
        }

        if (layer == waterbodies_resource_layer) {
          setButtonDisplay(true);
          setIsWaterBodySelected(false);
          setSelectedWork(feature.values_.wb_id);
        }
        if (layer == planLayer) {
          setButtonDisplay(true);
        }
      });

      const features = initialMap.getFeaturesAtPixel(e.pixel, {
        layerFilter: (layer) => layer === nregaLayerRef.current,
      });
      if (features.length > 0) {
        setSelectedFeatures(features);
        setShowBottomSheet(true);
      }
    });

    return () => {
      initialMap.setTarget(null);
    };
  }, [currentPlan]);

  // MARK: Layer Update
  useEffect(() => {
    if (isLayerUpdated) {
      let planLayer = null;

      planLayer = getVectorLayer(
        "works",
        "plan_layer_wb" + localStorage.getItem("block_name").toLowerCase(),
        true,
        false,
        "main_swb",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );

      mapRef.current.removeLayer(planLayerRef.current);

      planLayerRef.current = planLayer;

      planLayerRef.current.setStyle(function (feature) {
        let stats = feature.values_.work_type;

        if (stats == "Repair water body") {
          return new Style({
            image: new Icon({ src: waterbodies_proposed }),
          });
        }
        if (stats == "Repair check dam") {
          return new Style({
            image: new Icon({ src: checkDam_proposed }),
          });
        }
        if (stats == "Repair TCB") {
          return new Style({
            image: new Icon({ src: tcb_proposed }),
          });
        }
        if (stats == "Repair canal") {
          return new Style({
            image: new Icon({ src: canals_proposed }),
          });
        }
        if (stats == "Repair fishery") {
          return new Style({
            image: new Icon({ src: fisheries_proposed }),
          });
        }
      });

      mapRef.current.addLayer(planLayer);

      updateLayerState(false);
    }
  }, [isLayerUpdated]);

  useEffect(() => {
    const handleBackButton = () => {
      const currentState = STATE_MACHINE[currentScreen];
      if (currentState && currentState.BACK) {
        updateStatus(currentState.BACK);
        if (currentState.BACK == "main_screen") {
          setIsProposeMaintenanceActive(false);
          state_transition("add_hemlet");
          waterBodiesLayerRef.current.setVisible(true);
          hemletLayerRef.current.setVisible(false);
        }
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [currentScreen]);

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
      //const gpsCoordinate = proj.fromLonLat(gpsLocation);
      const isWithinBlock = extent.containsCoordinate(blockExtent, gpsLocation);
      setIsInBlock(isWithinBlock);
    } catch (err) {
      toast("Getting Location !");
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

  const handleLayersButtonToggle = () => {
    onOpenLayers();
  };

  return (
    <div className={styles.map_container}>
      <Toaster />
      <WaterBodiesModal />
      <Assetform />

      <LayersBottomSheet />

      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />

      <div className={styles.header_buttons}>
        <MenuSimple isDisabled={true} />

        <Button
          isBack={true}
          label={t("Layers")}
          onClick={handleLayersButtonToggle}
        />
      </div>

      <div className={styles.header_secondary_buttons}>
        <div className={styles.header_secondary_button}>
          <Button
            onClick={zoomToGPSLocation}
            isIcon={true}
            icon={faCrosshairs}
          />
        </div>
        <div className={styles.header_secondary_button}>
          <Button onClick={handleInfoClick} isIcon={true} icon={faInfoCircle} />
        </div>
        <div className={styles.header_secondary_button}>
          {!isInBlock && (
            <Button
              onClick={zoomToBlockExtents}
              isIcon={true}
              icon={faCompass}
            />
          )}
        </div>
      </div>

      <div className={styles.header_latlong_buttons}></div>

      {isLayerUpdating && (
        <Loader isOpen={isLayerUpdating} onClose={handleInfoClose} />
      )}

      <InfoWaterBodyModal
        isOpen={showInfoWaterBodyModal}
        onClose={handleInfoClose}
      />

      <div className={styles.footer_buttons}>
        {currentScreen === "main_screen" && buttondisplay && (
          <div className={styles.footer_buttons_main_group}>
            <Button
              onClick={handleAnalyzeButtonClick}
              label={t("Analyse")}
              isDisabled={isAnalyzeActive}
            />
            <Button
              onClick={handleProposeMaitenance}
              label={t("Propose Maintenance")}
            />
          </div>
        )}

        {(currentScreen === "add_hemlet" ||
          currentScreen === "show_hamlet_layer" ||
          currentScreen === "mapping_complete") && (
            <div className={styles.footer_buttons_main_group}>
              {isProposeMaintenanceActive && (
                <Button
                  label={t("Provide Specifications")}
                  isDisabled={buttondisplay}
                  onClick={() => handleFeedbackButtonClick(currentlatlong)}
                />
              )}

              <Button label={t("Finish")} onClick={handleFinishButton} />
            </div>
          )}
      </div>

      {showBottomSheet && (
        <PopUpSheet
          features={selectedFeatures}
          onClose={() => setShowBottomSheet(false)}
        />
      )}
    </div>
  );
}

export default WaterBodiesScreen;

import "ol/ol.css";
import styles from "./AgriScreen.module.css";

import * as extent from "ol/extent";
import * as proj from "ol/proj";

import { Fill, Icon, Stroke, Style } from "ol/style.js";
import { Feature, Map, View, Geolocation } from "ol";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";
import { faCompass, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { getImageLayer, getVectorLayer } from "../helper/utils";
import toast, { Toaster } from "react-hot-toast";

import { fetchTileInfo } from "../helper/fetchTileInfo.js";
import { loadOfflineBaseLayer } from "../helper/offlineBaseLayer.js";

import Box from "@mui/material/Box";
import { Circle as CircleStyle } from "ol/style.js";
import InfoAgriModal from "../info/infoAgriModal";
import Loader from "../info/loader";
import { Point } from "ol/geom";
import Select from "ol/interaction/Select.js";
import Slider from "@mui/material/Slider";
import TileLayer from "ol/layer/Tile";
import TileWMS from "ol/source/TileWMS.js";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import XYZ from "ol/source/XYZ";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import map_marker from "../asset/map_marker.svg";
import { useNavigate } from "react-router-dom";
import yellow_marker from "../asset/settlement_icon.svg";

import farm_pond_proposed from "../asset/farm_pond_proposed.svg";
import land_leveling_proposed from "../asset/land_leveling_proposed.svg";
import well_mrker from "../asset/well_proposed.svg";
import wb_mrker from "../asset/waterbodies_proposed.svg";

import Button from "../components/Button";

import useAnalyzeModal from "../hooks/useAnalyzeModal";
import AgricultureModal from "../analyze/AgricultureModal";
import Assetform from "../assetform/assetform.js";
import useMapLayers from "../hooks/useMapLayers.js";
import useOdkModal from "../hooks/useOdkModal";
import usePlansStore from "../hooks/usePlans.js";

import agriScreenIcon from "../asset/agriScreenIcon.svg";
import useLayersModal from "../hooks/useLayersModal.js";
import MenuSimple from "../components/MenuSimple.js";
import LayersBottomSheet from "../components/LayersBottomSheet.js";

import { useTranslation } from "react-i18next";

const selectedStyle = new Style({
  fill: new Fill({
    color: "rgba(0, 0, 0, 0.9)",
  }),
  stroke: new Stroke({
    color: "#1AA7EC",
    width: 1,
  }),
});

const blankStyle = new Style({
  stroke: new Stroke({
    color: "#e4c1f9",
    width: 1,
  }),
  fill: new Fill({
    color: "rgba(255, 255, 255, 0)",
  }),
});

// numbers represents the years
const LULCdata = [
  ["17", "18"],
  ["18", "19"],
  ["19", "20"],
  ["20", "21"],
  ["21", "22"],
  ["22", "23"],
];

const marks = LULCdata.map((entry, index) => ({
  value: index,
  label: `${entry[0]}-${entry[1]}`,
}));

function valuetext(value) {
  return LULCdata[value].value;
}

const theme = createTheme({
  components: {
    MuiSlider: {
      styleOverrides: {
        markLabel: {
          color: "white",
          fontSize: "11px",
          fontWeight: "bold",
        },
      },
    },
  },
});

const fullstyle = new Style({
  stroke: new Stroke({
    color: "#f00",
    width: 1.5,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 0, 0)",
  }),
});

const notify_propose_irrigation_work = () =>
  toast("Place the marker on the map and provide specifications", {
    duration: 6000,
    position: "top-center",
    style: {
      borderRadius: "10px",
      background: "#333",
      color: "#fff",
    },
  });

const STATE_MACHINE = {
  main_screen: {
    START_PLANNING: "start_planning",
  },
  start_planning: {
    PROPOSE_NEW_IRRIGATION_WORK: "add_hemlet",
    BACK: "main_screen",
  },
  add_hemlet: {
    PROVIDE_SPECIFICATIONS: "mapping_complete",
    BACK: "start_planning",
  },
  mapping_complete: {
    FINISH: "main_screen",
    BACK: "add_hemlet",
  },
};

function AgriScreen({ setScreenTitle, setScreenIcon, setGpsLocationMain }) {
  const [currentscreen, setCurrentScreen] = useState("main_screen");

  const mapElement = useRef();
  const mapRef = useRef();
  const osmLayerRef = useRef();
  const adminLayerRef = useRef();
  const equityLayerRef = useRef();
  const clartLayerRef = useRef();
  const deltaGLayerRef = useRef();
  const droughtLayerRef = useRef();
  const croppingPatternLayerRef = useRef();
  const positionFeatureRef = useRef();
  const drainageLayerRef = useRef();

  const featuresRef = useRef({
    droughtFeature: null,
    croppingPatternFeature: null,
  });

  const hemletLayerRef = useRef();
  const lulcref = [useRef(), useRef(), useRef(), useRef(), useRef(), useRef()];
  const planLayerRef = useRef();
  const navigate = useNavigate();

  const [lulcSlider, setLulcSlider] = useState(true);
  const [clartlayer, setClartLayer] = useState(null);
  const [lulcLayers, setLulclayers] = useState([]);
  const [buttondisplay, setButtonDisplay] = useState(false);
  const [showInfoAgriModal, setShowInfoAgriModal] = useState(false);
  const [clartLayerVisible, setClartLayerVisible] = useState(false);
  const [lulcLayerVisible, setLulcLayerVisible] = useState(true);
  const [currentLegend, setCurrentLegend] = useState("LULC");
  const [currentlatlong, setLatLong] = useState(null);
  const [onclicklatlong, setOnClickLatLong] = useState(null);
  const [isProposeIrrigationActive, setIsProposeIrrigationActive] =
    useState(false);
  const [isIconFeatureActive, setIsIconFeatureActive] = useState(false);
  const [hasNotifiedHamletSelection, setHasNotifiedHamletSelection] =
    useState(false);
  const [isTransientState, setIsTransientState] = useState(false);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isInBlock, setIsInBlock] = useState(true);
  const [showProposeButton, setShowProposeButton] = useState(false);
  const [selectedWork, setSelectedWork] = useState(null);

  const onOpen = useAnalyzeModal((state) => state.onOpen);

  const onSetState = useOdkModal((state) => state.onSetState);
  const onOpenOdk = useOdkModal((state) => state.onOpen);

  const isLayerUpdating = useOdkModal((state) => state.isLoading);
  const isLayerUpdated = useOdkModal((state) => state.LayerUpdated);
  const updateLayerState = useOdkModal((state) => state.updateLayerStatus);

  const LayerStore = useMapLayers((state) => state);

  const onOpenLayers = useLayersModal((state) => state.onOpen);

  const { t } = useTranslation();

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

  const notify_hamlet_selection = () => {
    if (!hasNotifiedHamletSelection) {
      toast("Select a settlement to map it to the work", {
        duration: 4000,
        position: "top-center",
        style: {
          borderRadius: "10px",
          background: "#333",
          color: "#fff",
        },
      });
      setHasNotifiedHamletSelection(true);
    }
  };

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

  // MARK: Handle Button Click
  const handleFinishButton = () => {
    setIsProposeIrrigationActive(false);
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

  const handleAnalyzeButtonClick = () => {
    const values = featuresRef.current.droughtFeature.values_;
    
    if (featuresRef.current.droughtFeature) {
      // Store drought data
      sessionStorage.setItem(
        "drlb_2016",
        featuresRef.current.droughtFeature.values_.drlb_2016
      );
      sessionStorage.setItem(
        "drlb_2017",
        featuresRef.current.droughtFeature.values_.drlb_2017
      );
      sessionStorage.setItem(
        "drlb_2018",
        featuresRef.current.droughtFeature.values_.drlb_2018
      );
      sessionStorage.setItem(
        "drlb_2019",
        featuresRef.current.droughtFeature.values_.drlb_2019
      );
      sessionStorage.setItem(
        "drlb_2020",
        featuresRef.current.droughtFeature.values_.drlb_2020
      );
      sessionStorage.setItem(
        "drlb_2021",
        featuresRef.current.droughtFeature.values_.drlb_2021
      );
      sessionStorage.setItem(
        "drlb_2022",
        featuresRef.current.droughtFeature.values_.drlb_2022
      );

      // Store dry spell data
      sessionStorage.setItem("drysp_2017", featuresRef.current.droughtFeature.values_.drysp_2017);
      sessionStorage.setItem("drysp_2018", featuresRef.current.droughtFeature.values_.drysp_2018);
      sessionStorage.setItem("drysp_2019", featuresRef.current.droughtFeature.values_.drysp_2019);
      sessionStorage.setItem("drysp_2020", featuresRef.current.droughtFeature.values_.drysp_2020);
      sessionStorage.setItem("drysp_2021", featuresRef.current.droughtFeature.values_.drysp_2021);
      sessionStorage.setItem("drysp_2022", featuresRef.current.droughtFeature.values_.drysp_2022);
    }

    if (featuresRef.current.croppingPatternFeature) {
      // Store single crop data
      sessionStorage.setItem(
        "single_kha",
        featuresRef.current.croppingPatternFeature.values_.single_kha
      );
      sessionStorage.setItem(
        "single_k_1",
        featuresRef.current.croppingPatternFeature.values_.single_k_1
      );
      sessionStorage.setItem(
        "single_k_2",
        featuresRef.current.croppingPatternFeature.values_.single_k_2
      );
      sessionStorage.setItem(
        "single_k_3",
        featuresRef.current.croppingPatternFeature.values_.single_k_3
      );
      sessionStorage.setItem(
        "single_k_4",
        featuresRef.current.croppingPatternFeature.values_.single_k_4
      );
      sessionStorage.setItem(
        "single_k_5",
        featuresRef.current.croppingPatternFeature.values_.single_k_5
      );
      sessionStorage.setItem(
        "single_k_6",
        featuresRef.current.croppingPatternFeature.values_.single_k_6
      );

      sessionStorage.setItem(
        "single_non",
        featuresRef.current.croppingPatternFeature.values_.single_non
      );
      sessionStorage.setItem(
        "single_n_1",
        featuresRef.current.croppingPatternFeature.values_.single_n_1
      );
      sessionStorage.setItem(
        "single_n_2",
        featuresRef.current.croppingPatternFeature.values_.single_n_2
      );
      sessionStorage.setItem(
        "single_n_3",
        featuresRef.current.croppingPatternFeature.values_.single_n_3
      );
      sessionStorage.setItem(
        "single_n_4",
        featuresRef.current.croppingPatternFeature.values_.single_n_4
      );
      sessionStorage.setItem(
        "single_n_5",
        featuresRef.current.croppingPatternFeature.values_.single_n_5
      );
      sessionStorage.setItem(
        "single_n_6",
        featuresRef.current.croppingPatternFeature.values_.single_n_6
      );

      // Store double crop data
      sessionStorage.setItem(
        "doubly_cro",
        featuresRef.current.croppingPatternFeature.values_.doubly_cro
      );
      sessionStorage.setItem(
        "doubly_c_1",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_1
      );
      sessionStorage.setItem(
        "doubly_c_2",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_2
      );
      sessionStorage.setItem(
        "doubly_c_3",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_3
      );
      sessionStorage.setItem(
        "doubly_c_4",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_4
      );
      sessionStorage.setItem(
        "doubly_c_5",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_5
      );
      sessionStorage.setItem(
        "doubly_c_6",
        featuresRef.current.croppingPatternFeature.values_.doubly_c_6
      );

      // Store triple crop data
      sessionStorage.setItem(
        "triply_cro",
        featuresRef.current.croppingPatternFeature.values_.triply_cro
      );
      sessionStorage.setItem(
        "triply_c_1",
        featuresRef.current.croppingPatternFeature.values_.triply_c_1
      );
      sessionStorage.setItem(
        "triply_c_2",
        featuresRef.current.croppingPatternFeature.values_.triply_c_2
      );
      sessionStorage.setItem(
        "triply_c_3",
        featuresRef.current.croppingPatternFeature.values_.triply_c_3
      );
      sessionStorage.setItem(
        "triply_c_4",
        featuresRef.current.croppingPatternFeature.values_.triply_c_4
      );
      sessionStorage.setItem(
        "triply_c_5",
        featuresRef.current.croppingPatternFeature.values_.triply_c_5
      );
      sessionStorage.setItem(
        "triply_c_6",
        featuresRef.current.croppingPatternFeature.values_.triply_c_6
      );

      // Store total and cropping intensity data
      sessionStorage.setItem(
        "total_crop",
        featuresRef.current.croppingPatternFeature.values_.total_crop
      );
      sessionStorage.setItem(
        "cropping_i",
        featuresRef.current.croppingPatternFeature.values_.cropping_i
      );
      sessionStorage.setItem(
        "cropping_1",
        featuresRef.current.croppingPatternFeature.values_.cropping_1
      );
      sessionStorage.setItem(
        "cropping_2",
        featuresRef.current.croppingPatternFeature.values_.cropping_2
      );
      sessionStorage.setItem(
        "cropping_3",
        featuresRef.current.croppingPatternFeature.values_.cropping_3
      );
      sessionStorage.setItem(
        "cropping_4",
        featuresRef.current.croppingPatternFeature.values_.cropping_4
      );
      sessionStorage.setItem(
        "cropping_5",
        featuresRef.current.croppingPatternFeature.values_.cropping_5
      );
      sessionStorage.setItem(
        "cropping_6",
        featuresRef.current.croppingPatternFeature.values_.cropping_6
      );
    }

    // Force modal to update by closing and reopening
    useAnalyzeModal.getState().onClose();
    setTimeout(() => {
      useAnalyzeModal.getState().onOpen();
    }, 0);
  };


  const handleClartButtonClick = useCallback(() => {
    // Make the CLART layer visible/invisible based on current visibility
    if (currentPlan !== null) {
      setCurrentScreen("start_planning");
      const currentVisibility = clartLayerRef.current.getVisible();
      clartLayerRef.current.setVisible(!currentVisibility);
      drainageLayerRef.current.setVisible(true);
      setClartLayerVisible(!currentVisibility);
      if (lulcLayerVisible) {
        handleLulcButtonClick();
      }
      if (!currentVisibility) setCurrentLegend("CLART");
      else setCurrentLegend("LULC");
    } else {
      toast.error("First, select a plan!");
    }
    transition(STATE_MACHINE.main_screen.START_PLANNING);
  }, [lulcLayerVisible]);

  const handleProposeNewWork = () => {
    setIsProposeIrrigationActive(true);
    setCurrentScreen("add_hemlet");
    // hemletLayerRef.current.setVisible(true);
  };

  const handleProposeNewIrrigationWork = () => {
    handleProposeNewWork();
    notify_propose_irrigation_work();
  };

  // WIP
  const handleFeedbackButtonClick = () => {
    if (!currentlatlong) {
      window.alert("Place the marker before clicking the button.");
    } else {
      let redirectState = {
        latlong: currentlatlong,
        screen_code: "agri_irr_work",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "",
        layerName: "planning_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        state: "planning",
        work_type: "plan_agri",
      };
      onSetState(redirectState);

      onOpenOdk();
    }
  };

  const handleLulcButtonClick = useCallback(() => {
    setLulcLayerVisible(!lulcLayerVisible);
    setLulcSlider(!lulcSlider);
    if (!lulcSlider) {
      handleLulcSlider(0);
    } else {
      handleLulcSlider(-1);
    }

    if (!lulcLayerVisible) {
      setCurrentLegend("LULC");
    } else {
      setCurrentLegend("CLART");
    }
  }, [lulcSlider, lulcLayers, lulcLayerVisible]);

  const handleInfoClick = () => {
    setShowInfoAgriModal(true);
  };

  const handleInfoClose = () => {
    setShowInfoAgriModal(false);
  };

  const lulcLink = (start, end, blk) => {
    if (blk === "lakshmipur") {
      return `https://geoserver.core-stack.org:8443/geoserver/LULC_level_3/wms?service=WMS&version=1.1.0&request=GetMap&layers=LULC_level_3%3ALULC_${start}_${end}_${localStorage.getItem("dist_name").toLowerCase()}_${blk}_level_3&width=768&height=387&srs=EPSG%3A4326&styles=&format=application/openlayers.com/geoserver/wms`
    }
    else { return `https://geoserver.core-stack.org:8443/geoserver/LULC_level_3/wms?service=WMS&version=1.1.0&request=GetMap&layers=LULC_level_3%3ALULC_${start}_${end}_${blk}_level_3&width=768&height=387&srs=EPSG%3A4326&styles=&format=application/openlayers.com/geoserver/wms`; }
  }

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

  const transition = (newScreen) => {
    //updateStatus(newScreen);
    window.history.pushState(null, "", `#${newScreen}`);
  };

  useEffect(() => {
    const handleBackButton = () => {
      const currentState = STATE_MACHINE[currentscreen];
      if (currentState && currentState.BACK) {
        setCurrentScreen(currentState.BACK);
      }
    };

    window.addEventListener("popstate", handleBackButton);

    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  }, [currentscreen]);

  const s = (newScreen) => {
    setCurrentScreen(newScreen);
    window.history.pushState(null, "", `#${newScreen}`);
  };

  useEffect(() => {
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
    setScreenTitle("Agri");
    setScreenIcon(agriScreenIcon);
  }, []);

  let isOffline = localStorage.getItem("isOffline");
  console.log("isOffline", isOffline);
  console.log("AGRI SCREEN");

  // MARK: Layers
  // Map structure setup
  useEffect(() => {
    let BaseLayer = null;
    let equityLayer = null;
    let planLayer = null;
    let clartLayer = null;
    let deltaGLayer = null;
    let droughtLayer = null;
    let croppingPatternLayer = null;
    let hamlet_layer = null;
    let waterbodies_layer = null;
    let well_layer = null;
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

    // if (equityLayer === null) {
    //   equityLayer = getVectorLayer(
    //     "equity",
    //     localStorage.getItem("block_name").toLowerCase() + "_equity"
    //   );
    // }

    // equityLayer.setStyle(fullstyle);

    if (planLayer === null) {
      planLayer = getVectorLayer(
        "works",
        "plan_agri_" + localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
        true,
        false,
        "plan_agri",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );
    }

    if (waterbodies_layer === null) {
      waterbodies_layer = getVectorLayer(
        "resources",
        "wb_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "waterbody",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );
    }

    waterbodies_layer.setStyle(function (feature) {
      const status = feature.values_;
      if (status.type_wbs == "Farm pond") {
        return new Style({
          image: new Icon({ src: farm_pond_proposed }),
        });
      }
    });

    if (well_layer === null) {
      well_layer = getVectorLayer(
        "resources",
        "well_layer" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "well",
        currentPlan.plan_id,
        isOffline,
        null,
        null
      );
    }

    well_layer.setStyle(
      new Style({
        image: new Icon({ src: well_mrker }),
      })
    );

    if (clartLayer === null) {
      clartLayer = getImageLayer(
        "clart",
        localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase() + "_clart"
      );
    }

    clartLayer.setOpacity(0.5);
    setClartLayer(clartLayer);

    if (deltaGLayer === null) {
      deltaGLayer = getVectorLayer(
          "mws_layers",
          "deltaG_well_depth_" + localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
          false,
          true,
          "mws_well_depth",
          null,
          isOffline,
          null,
          null
      );
  }

    deltaGLayer.setStyle(blankStyle);
    deltaGLayer.setVisible(true);
    deltaGLayer.setOpacity(0.8);

    // Keep them invisible and just use their values
    // Used for calculation of drought frequency and intensity

    if (droughtLayer === null) {
      droughtLayer = getVectorLayer(
        "cropping_drought",
        localStorage.getItem("dist_name").toLowerCase() +
        "_" +
        localStorage.getItem("block_name").toLowerCase() +
        "_drought",
        false,
        true,
        "drought",
        null,
        isOffline,
        null,
        null
      );
    }

    droughtLayer.setStyle(blankStyle);
    droughtLayer.setVisible(true);
    droughtLayer.setOpacity(0.1);

    if (croppingPatternLayer === null) {
      croppingPatternLayer = getVectorLayer(
        "cropping_intensity",
        localStorage.getItem("dist_name").toLowerCase() + "_" +
        localStorage.getItem("block_name").toLowerCase() + "_intensity",
        false,
        true,
        "cropping_intensity",
        null,
        isOffline,
        null,
        null
      );
    }

    croppingPatternLayer.setStyle(blankStyle);
    croppingPatternLayer.setVisible(true);
    croppingPatternLayer.setOpacity(0.1);

    if (hamlet_layer === null) {
      hamlet_layer = getVectorLayer(
        "resources",
        "settlement_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "settlement", // used for offline mode to fetch the correct resource
        currentPlan.plan_id,
        isOffline
      );
    }
    hemletLayerRef.current = hamlet_layer;
    hemletLayerRef.current.setStyle(
      new Style({
        image: new Icon({ src: yellow_marker, scale: 0.4 }),
      })
    );

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

    drainageLayerRef.current = drainageLayer;

    const vectorSource = new VectorSource({
      features: [iconFeature],
    });

    const featureLayer = new VectorLayer({
      source: vectorSource,
      visible: true,
    });

    const positionFeature = new Feature({
      geometry: new Point([78.9, 20.5]),
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

    const pointLayer = new VectorLayer({
      source: new VectorSource({
        features: [positionFeature],
      }),
    });

    const lulclayers = [];
    for (let i = 0; i < lulcref.length; i++) {
      lulcref[i].current = new TileLayer({
        source: new TileWMS({
          url: lulcLink(
            LULCdata[i][0],
            LULCdata[i][1],
            localStorage.getItem("block_name").toLowerCase()
          ),
          serverType: "geoserver",
          crossOrigin: "anonymous",
        }),
        visible: false,
      });
      lulclayers.push(lulcref[i].current);
    }

    lulcref[0].current.setVisible(true);

    setLulclayers(lulclayers);

    equityLayerRef.current = equityLayer;
    osmLayerRef.current = BaseLayer;
    clartLayerRef.current = clartLayer;
    adminLayerRef.current = adminLayer;
    deltaGLayerRef.current = deltaGLayer;
    droughtLayerRef.current = droughtLayer;
    croppingPatternLayerRef.current = croppingPatternLayer;
    hemletLayerRef.current = hamlet_layer;
    positionFeatureRef.current = positionFeature;

    //! TODO : Add LULC Layer Option Here
    LayerStore.resetLayersState();

    LayerStore.updateStatus(false);

    LayerStore.addLayersState("CLART Layer", clartLayerRef, LayerStore.Layers);
    LayerStore.addLayersState("MWS Layer", deltaGLayerRef, LayerStore.Layers);
    LayerStore.addLayersState(
      "Equity Layer",
      equityLayerRef,
      LayerStore.Layers
    );
    //LayerStore.addLayersState("Drought Frequency Layer", droughtLayerRef, LayerStore.Layers)
    LayerStore.addLayersState("Plan Layer", planLayerRef, LayerStore.Layers);
    LayerStore.addLayersState(
      "Settlement Layer",
      hemletLayerRef,
      LayerStore.Layers
    );
    //LayerStore.addLayersState("Cropping Intensity Layer", croppingPatternLayerRef, LayerStore.Layers)

    LayerStore.updateStatus(true);

    positionFeatureRef.current.setStyle(
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

    planLayerRef.current = planLayer;
    planLayerRef.current.setStyle(function (feature) {
      const status = feature.values_;

      if (status.TYPE_OF_WO == "New farm pond") {
        return new Style({
          image: new Icon({ src: farm_pond_proposed }),
        });
      } else if (status.TYPE_OF_WO == "Land leveling") {
        return new Style({
          image: new Icon({ src: land_leveling_proposed }),
        });
      } else if (status.TYPE_OF_WO == "New well") {
        return new Style({
          image: new Icon({ src: well_mrker }),
        });
      } else {
        return new Style({
          image: new Icon({ src: wb_mrker }),
        });
      }
    });

    if (gpsLocation) {
      const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
      const gpsCoordinate = proj.fromLonLat(gpsLocation);
      positionFeatureRef.current.setGeometry(new Point(gpsCoordinate));
      const isWithinExtent = extent.containsCoordinate(
        blockExtent,
        gpsCoordinate
      );

      if (isWithinExtent) {
        // Zoom to GPS location and adjust the view
        mapRef.current.getView().setCenter(gpsCoordinate);
        mapRef.current.getView().setZoom(13); // Adjust the zoom level as needed
      }
    }

    // Handle layer visibility when Hamlet layer is on
    if (currentscreen === "show_hamlet_layer") {
      hemletLayerRef.current.setVisible(true);
      lulclayers.forEach((layer) => layer.setVisible(false));
      clartLayer.setVisible(true);
      setLulcSlider(false);
      setIsProposeIrrigationActive(true);
      notify_hamlet_selection();
    }

    if (currentscreen === "mapping_complete") {
      setIsProposeIrrigationActive(true);
      setLulcSlider(false);
    }

    // const view = new View({
    //   center: [78.9, 20.5],
    //   zoom: zoomLevel !== null ? zoomLevel : 13,
    //   projection: "EPSG:4326",
    // });

    // const initialMap = new Map({
    //   target: mapElement.current,
    //   layers: [
    //     BaseLayer,
    //     ...lulclayers,
    //     clartLayer,
    //     deltaGLayer,
    //     droughtLayer,
    //     croppingPatternLayer,
    //     adminLayer,
    //     drainageLayer,
    //     hamlet_layer,
    //     planLayer,
    //     waterbodies_layer,
    //     well_layer,
    //     pointLayer,
    //     featureLayer,
    //   ],
    //   view: view,
    // });

    // mapRef.current = initialMap;

    // MARK: Initial Map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
          BaseLayer,
          ...lulclayers,
          clartLayer,
          deltaGLayer,
          droughtLayer,
          croppingPatternLayer,
          adminLayer,
          drainageLayer,
          hamlet_layer,
          planLayer,
          waterbodies_layer,
          well_layer,
          featureLayer,
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
      setLatLong(e.coordinate);
      setShowProposeButton(false);
      setSelectedWork(null);

      initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        if (layer === droughtLayerRef.current) {
          toast.success(`Selected Drought Layer with id ${feature.id_}`);
          featuresRef.current.droughtFeature = feature;
          setButtonDisplay(true);
        } else if (layer === croppingPatternLayerRef.current) {
          toast.success(
            `Selected Cropping Pattern Layer with id ${feature.id_}`
          );
          featuresRef.current.croppingPatternFeature = feature;
          setButtonDisplay(true);
        } else if (layer === hamlet_layer) {
          toast.success(`Selected Hamlet Layer with id ${feature.id_}`);
          setButtonDisplay(true);
        } else if (layer === planLayer) {
          setShowProposeButton(true);
          setSelectedWork(feature.values_.work_id);
        } else if (layer == well_layer) {
          setShowProposeButton(true);
          setSelectedWork(feature.values_.well_id);
        }

        const select = new Select({
          layers: [
            deltaGLayerRef.current,
            droughtLayerRef.current,
            croppingPatternLayerRef.current,
          ],
          style: selectedStyle,
        });

        initialMap.addInteraction(select);
        select.on("select", (e) => {
          const selectedFeatures = select.getFeatures();
          selectedFeatures.forEach((feature) => {
            if (feature.get("layer") === "mws") {
              feature.setStyle(selectedStyle);
            }
          });
        });

        iconFeature.setStyle(iconStyle);
        iconFeature.getGeometry().setCoordinates(e.coordinate);
        setIsIconFeatureActive(true);
      });
    });

    const Vectorsource = adminLayer.getSource();
    Vectorsource.once("change", function (e) {
      if (Vectorsource.getState() === "ready") {
        // const arr = Vectorsource.getExtent();
        // const mapcenter = [(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2];
        initialMap.getView().setCenter(mapCenter);
        //initialMap.getView().setZoom(13);
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

    return () => {
      initialMap.setTarget(null);
    };
  }, [currentPlan]);

  useEffect(() => {
    if (isLayerUpdated) {
      let planLayer = null;

      planLayer = getVectorLayer(
        "works",
        "plan_layer_agri" + localStorage.getItem("block_name").toLowerCase(),
        true,
        false,
        "plan_agri",
        currentPlan.plan_id,
        isOffline
      );

      if (planLayer !== null) {
        planLayer.setStyle(function (feature) {
          const status = feature.values_;

          if (status.TYPE_OF_WO == "New farm pond") {
            return new Style({
              image: new Icon({ src: farm_pond_proposed }),
            });
          } else if (status.TYPE_OF_WO == "Land leveling") {
            return new Style({
              image: new Icon({ src: land_leveling_proposed }),
            });
          } else if (status.TYPE_OF_WO == "New well") {
            return new Style({
              image: new Icon({ src: well_mrker }),
            });
          } else {
            return new Style({
              image: new Icon({ src: wb_mrker }),
            });
          }
        });
      }

      mapRef.current.removeLayer(planLayerRef.current);

      planLayerRef.current = planLayer;

      mapRef.current.addLayer(planLayer);

      updateLayerState(false);
    }
  }, [isLayerUpdated]);

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

  const handleLulcSlider = function (idx) {
    for (let i = 0; i < lulcref.length; i++) {
      lulcref[i].current.setVisible(false);
    }
    if (idx >= 0) {
      lulcref[idx].current.setVisible(true);
    }
  };

  const handleProposeMaintainenceButton = () => {
    if (!currentlatlong) {
      window.alert("Place the marker before clicking the button.");
    } else {
      let redirectState = {
        latlong: currentlatlong,
        screen_code: "propose_maintenance_agri_irrigation",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "",
        layerName: "planning_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        state: "planning",
        work_type: "plan_agri",
        work_id: selectedWork,
      };

      onSetState(redirectState);

      onOpenOdk();
    }
  };

  const handleLayersButtonToggle = () => {
    onOpenLayers();
  };

  return (
    <div className={styles.map_container}>
      <Toaster />
      <div className={`${styles.slider_container} t2`}>
        {lulcSlider && (
          <ThemeProvider theme={theme}>
            <CustomSlider
              className={styles.custom_slider}
              handlePropChange={handleLulcSlider}
              data={LULCdata}
            />
          </ThemeProvider>
        )}
      </div>
      <div ref={mapElement} className={styles.map} />

      <AgricultureModal />

      <Assetform />

      <LayersBottomSheet />

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
        {!isInBlock && (
          <Button onClick={zoomToBlockExtents} isIcon={true} icon={faCompass} />
        )}
      </div>

      <Loader isOpen={isLayerUpdating} onClose={handleInfoClose} />

      <InfoAgriModal
        isOpen={showInfoAgriModal}
        onClose={handleInfoClose}
        currentLegend={currentLegend}
      />

      <div className={styles.footer_buttons}>
        {currentscreen === "main_screen" && (
          <Button
            label={t("Analyse")}
            isDisabled={buttondisplay}
            onClick={handleAnalyzeButtonClick}
          />
        )}

        {currentscreen === "main_screen" && (
          <Button
            label={t("Start Planning")}
            isDisabled={!clartLayerVisible}
            onClick={handleClartButtonClick}
          />
        )}

        {currentscreen === "start_planning" && (
          <Button
            label={t("Propose new irrigation work")}
            onClick={() => {
              handleProposeNewIrrigationWork();
              transition(
                STATE_MACHINE.start_planning.PROPOSE_NEW_IRRIGATION_WORK
              );
            }}
          />
        )}
        {currentscreen === "start_planning" && (
          <Button
            label={t("Propose Maintenance")}
            onClick={handleProposeMaintainenceButton}
            isDisabled={showProposeButton}
          />
        )}

        {currentscreen === "add_hemlet" && (
          <div className={styles.footer_buttons}>
            {isProposeIrrigationActive && (
              <Button
                label={t("Provide Specifications")}
                isDisabled={isIconFeatureActive}
                onClick={() => {
                  handleFeedbackButtonClick(onclicklatlong);
                  transition(STATE_MACHINE.add_hemlet.PROVIDE_SPECIFICATIONS);
                }}
              />
            )}

            <Button label={t("Finish")} onClick={handleFinishButton} />
          </div>
        )}

        {currentscreen === "show_hamlet_layer" && (
          <div className={styles.footer_buttons}>
            {isProposeIrrigationActive && (
              <button
                className={`${styles.footer_button} ${!showProposeButton ? "transient-button" : ""
                  }`}
                onClick={() => handleFeedbackButtonClick(currentlatlong)}
                disabled={showProposeButton}
              >
                {t("Provide Specifications")}
              </button>
            )}

            <button
              className={styles.footer_button}
              onClick={handleFinishButton}
            >
              {t("Finish")}
            </button>
          </div>
        )}

        {currentscreen === "mapping_complete" && (
          <div className={styles.footer_buttons}>
            {isProposeIrrigationActive && (
              <button
                className={`${styles.footer_button} ${!isTransientState ? "transient-button" : ""
                  }`}
                onClick={() => handleFeedbackButtonClick(currentlatlong)}
                disabled={!isTransientState}
              >
                {t("Provide Specifications")}
              </button>
            )}
            <button
              className={styles.footer_button}
              onClick={handleFinishButton}
            >
              {t("Finish")}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

const CustomSlider = ({ handlePropChange }) => {
  const [currentValue, setCurrentValue] = useState(0);

  return (
    <Box sx={{ width: 250 }}>
      <Slider
        aria-label="Years"
        defaultValue={0}
        valueLabelDisplay="off"
        step={null}
        marks={marks}
        max={marks.length - 1}
        value={currentValue}
        onChange={(event, newValue) => {
          setCurrentValue(newValue);
          handlePropChange(newValue);
        }}
        getAriaValueText={valuetext}
      />
    </Box>
  );
};

export default AgriScreen;

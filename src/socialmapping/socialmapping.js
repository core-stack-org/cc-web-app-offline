import "ol/ol.css";
import "ol-ext/dist/ol-ext.css";
import styles from "./socialmapping.module.css";

import * as extent from "ol/extent";
import * as proj from "ol/proj";

import { Fill, Icon, Stroke, Style } from "ol/style.js";
import { Map, View, Geolocation, Feature } from "ol";
import { Vector as VectorSource } from "ol/source.js";
import React, { useEffect, useRef, useState } from "react";
import { mapContainerStyle } from "./styles";
import { faCompass, faCrosshairs } from "@fortawesome/free-solid-svg-icons";
import { getVectorLayer } from "../helper/utils";
import toast, { Toaster } from "react-hot-toast";

import { fetchTileInfo } from "../helper/fetchTileInfo.js";
import { loadOfflineBaseLayer } from "../helper/offlineBaseLayer.js";

import { Circle as CircleStyle } from "ol/style.js";

import InfoSmModal from "../info/infoSmModal";
import Loader from "../info/loader";
import Point from "ol/geom/Point.js";
import Select from "ol/interaction/Select.js";
import TileLayer from "ol/layer/Tile";
import VectorLayer from "ol/layer/Vector";
import XYZ from "ol/source/XYZ";
import selectSettlementIcon from "../asset/selected_settlement.svg";
import { faInfoCircle } from "@fortawesome/free-solid-svg-icons";
import map_marker from "../asset/map_marker.svg";
import { useNavigate } from "react-router-dom";

import wb_mrker from "../asset/waterbodies_proposed.svg";
import irrigation_channel from "../asset/Irrigation_channel.svg";
import boulder_proposed from "../asset/Loose_boulder_structure.svg";
import settlementIcon from "../asset/settlement_icon.svg";
import farm_pond_proposed from "../asset/farm_pond_proposed.svg";
import tcb_proposed from "../asset/tcb_proposed.svg";
import canals_proposed from "../asset/canal_proposed.svg";
import checkDam_proposed from "../asset/check_dam_proposed.svg";

//? Offline Icons
import settlement_temporary from "../asset/settlement_icon_edited.svg"
import waterStructure_temporary from "../asset/waterbodiesScreenIcon_offline.svg"
import well_temporary from "../asset/well_proposed_offline.svg"

import well_mrker from "../asset/well_proposed.svg";
import well_mrker_accepted from "../asset/well_accepted.svg";
import well_mrker_rejected from "../asset/well_rejected.svg";

import Button from "../components/Button.js";

//? Hooks Store Imports
import useMapLayers from "../hooks/useMapLayers.js";
import useOdkModal from "../hooks/useOdkModal";
import Assetform from "../assetform/assetform.js";
import usePlansStore from "../hooks/usePlans.js";

import resourceScreenIcon from "../asset/resourceScreenIcon.svg";
import MenuSimple from "../components/MenuSimple.js";
import useMainScreenModal from "../hooks/useMainModal.js";

import { useTranslation } from 'react-i18next';

function ResourceMappingScreen({
  setScreenTitle,
  setScreenIcon,
  setGpsLocationMain,
}) {
  const mapElement = useRef();
  const mapRef = useRef();
  const osmLayerRef = useRef();
  const adminLayerRef = useRef();
  const settlementLayerRef = useRef();
  const wellLayerRef = useRef();
  const cropLayerRef = useRef();
  const positionFeatureRef = useRef();
  const waterBodiesLayerRef = useRef();
  const remote_wb_layerRef = useRef();
  const markerFeatureRef = useRef();

  const currentSettlementLayer = useRef(null)

  const [currentlatlong, setCurrentLatLong] = useState(null);
  const [currentwell, setCurrentWell] = useState(null);
  const [gpsLocation, setGpsLocation] = useState(null);
  const [isInBlock, setIsInBlock] = useState(true);
  const [showInfoSmModal, setShowInfoSmModal] = useState(false);
  const [isButtonActive, setIsButtonActive] = useState(false);
  const [isFirstClick, setFirstClick] = useState(false);
  const [gridId, setGridId] = useState(null)

  const [assetInfoButton, setAssetInfoButton] = useState(false);

  const onSetState = useOdkModal((state) => state.onSetState);
  const onOpen = useOdkModal((state) => state.onOpen);
  const onCloseOdk = useOdkModal((state) => state.onClose);

  const currentScreen = useOdkModal((state) => state.currentScreen);

  const updateStatus = useOdkModal((state) => state.updateStatus);

  const settlementModal = useMainScreenModal((state) => state.onOpen)
  const onSetSettlementInfo = useMainScreenModal((state) => state.onSetSettlementInfo)
  const settlementModalToggle = useMainScreenModal((state) => state.onSettlementToggle)
  const onSetAssetType = useMainScreenModal((state) => state.onSetAssetType)

  const isLayerUpdating = useOdkModal((state) => state.isLoading);
  const isLayerUpdated = useOdkModal((state) => state.LayerUpdated);
  const updateLayerState = useOdkModal((state) => state.updateLayerStatus);
  const updateSettlementName = useOdkModal(
    (state) => state.updateSettlementName
  );

  const LayerStore = useMapLayers((state) => state);

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

  // MARK: Offline Mode
  let isOffline = localStorage.getItem("isOffline");

  const [isOfflineState, setIsOfflineState] = useState(isOffline);

  //MARK: State Machine
  const STATE_MACHINE = {
    "add_settlement": {
      Screen : "add_settlement",
    },
    "add_well": {
      Screen : "add_well",
      BACK: "add_settlement",
    },
    "add_waterbodies": {
      Screen : "add_waterbodies",
      BACK: "add_well",
    },
    "add_crop": {
      Screen : "add_crop",
      BACK: "add_waterbodies",
    },
  };

  const state_transition = (newScreen) => {
    updateStatus(newScreen);
    window.history.pushState(null, "", `#${newScreen}`);
  }

  const [currenthemlet, setHemlet] = useState(null);

  const navigate = useNavigate();

  // MARK: Handle Button Clicks
  // Add Settlement
  const handleAddHamletbutton = () => {
    if (!currentlatlong) {
      window.alert("Place the marker before clicking the button.");
    } else {
      let redirectState = {
        latlong: currentlatlong,
        screen_code: "add_Settlement_Form",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "",
        resourceType: "settlement",
        layerName: "settlement_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        state: "mapping",
        layerRef : settlementLayerRef,
        updateHook : LayerStore.updateSettlementLayer,
        iconHook : settlement_temporary
      };

      onSetState(redirectState);

      onOpen();

      markerFeatureRef.current.setVisible(false);
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

  const handleFinishButton = () => {
    //handleLayerToggle(cropLayerRef.current);
    cropLayerRef.current.setVisible(true)
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

  const handleMoreCropInfo = () => {
    if(gridId !== null){
      let redirectState = {
        screen_code: "add_crop_info",
        hemlet_id: currenthemlet,
        well_id: currentwell,
        redirect_url: "",
        next_screen: "",
        state: "mapping",
        resourceType: "cropgrid",
        layerName: "cropgrid_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        next_screen: "",
        state: "transient",
        grid_id : gridId,
      };

      onSetState(redirectState);

      onOpen();
    }
    else{
      toast.error("Please select the Crop Grid !")
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
      toast("Getting Location !");
    }
  };

  const handleSkipWBButton = () => {
    mapRef.current.removeLayer(waterBodiesLayerRef.current);
    mapRef.current.removeLayer(remote_wb_layerRef.current);
    mapRef.current.addLayer(cropLayerRef.current);
    state_transition("add_crop")
    markerFeatureRef.current.setVisible(false);
  };

  const handleMarkResource = () =>{

    mapRef.current.removeLayer(settlementLayerRef.current);

    const settlementMarker = new Feature({
      geometry : new Point(currentlatlong)
    });

    const settlementIcon = new Style({
      image: new Icon({
        src: selectSettlementIcon,
      }),
    });

    let settlementIconLayer = new VectorLayer({
      source: new VectorSource({
        features: [settlementMarker],
      }),
      style: settlementIcon,
    });

    mapRef.current.addLayer(settlementIconLayer)

    currentSettlementLayer.current = settlementIconLayer


    mapRef.current.addLayer(wellLayerRef.current);
    setFirstClick(false);
    markerFeatureRef.current.setVisible(false);
    state_transition("add_well")
  };

  const handleAddWB = () => {
    waterBodiesLayerRef.current.setVisible(true);

    if (!currentlatlong) {
      window.alert("Please select lat long first");
    } else {
      let redirectState = {
        latlong: currentlatlong,
        screen_code: "add_Water_Structures_Form",
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        next_screen: "",
        resourceType: "waterbody",
        layerName: "waterbody_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        next_screen: "",
        state: "mapping",
        layerRef : waterBodiesLayerRef,
        updateHook : LayerStore.updateWaterStructure,
        iconHook : waterStructure_temporary
      };

      onSetState(redirectState);

      onOpen();
    }
  };

  const handleAddWell = () => {
    setIsButtonActive(false);
    if (!currentlatlong) {
      window.alert("Please select lat long first");
    } else {
      let redirectState = {
        latlong: currentlatlong,
        screen_code: "add_Well_Form",
        hemlet_id: currenthemlet,
        block_name: localStorage.getItem("block_name"),
        redirect_url: "",
        resourceType: "well",
        layerName: "well_layer",
        planID: currentPlan.plan_id,
        planName: currentPlan.plan.toLowerCase(),
        next_screen: "",
        state: "mapping",
        layerRef : wellLayerRef,
        updateHook : LayerStore.updateWellLayer,
        iconHook : well_temporary
      };

      onSetState(redirectState);

      onOpen();
    }
  };

  const handleWellSkipButton = async() => {
    state_transition("add_waterbodies")
    setFirstClick(false);
    mapRef.current.removeLayer(wellLayerRef.current);
    mapRef.current.addLayer(remote_wb_layerRef.current);
    mapRef.current.addLayer(waterBodiesLayerRef.current);
    markerFeatureRef.current.setVisible(false);
  };

  const handleAssetInfoModal = (assetType) => {
    onSetAssetType(assetType)
    settlementModalToggle()
    settlementModal()
  }

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

    updateStatus("add_settlement");
    setScreenTitle("Resource Mapping");
    setScreenIcon(resourceScreenIcon);
    promptForGeolocation();

    onCloseOdk()
  }, []);


  // MARK: Back Button
  useEffect(() => {
    const handleBackButton = () => {
      const currentState = STATE_MACHINE[currentScreen];
      if (currentState && currentState.BACK) {
        updateStatus(currentState.BACK);
        if(currentState.BACK == "add_settlement"){
          mapRef.current.removeLayer(wellLayerRef.current)
          mapRef.current.removeLayer(currentSettlementLayer.current)
          mapRef.current.addLayer(settlementLayerRef.current)
        }
        else if(currentState.BACK == "add_well"){
          mapRef.current.removeLayer(waterBodiesLayerRef.current)
          mapRef.current.removeLayer(remote_wb_layerRef.current)
          mapRef.current.addLayer(wellLayerRef.current)
        }
        else if(currentState.BACK == "add_waterbodies"){
          mapRef.current.removeLayer(cropLayerRef.current)
          mapRef.current.addLayer(waterBodiesLayerRef.current)
          mapRef.current.addLayer(remote_wb_layerRef.current)
        }
      }
    };
    window.addEventListener("popstate", handleBackButton);
    return () => {
      window.removeEventListener("popstate", handleBackButton);
    };
  },[currentScreen])

  // MARK: Layers
  useEffect(() => {
    let BaseLayer = null;
    let settlement_layer = LayerStore.settlementLayer;
    let well_layer = LayerStore.wellLayer;
    let waterbodies_layer = LayerStore.waterStructure;
    let cropgridLayer = null;
    let remote_sensed_waterBodies_layer = null;
    let view = null;

    console.log("-----------------Social Mapping LAYERS-----------------");
    //? fetching Layers
    if (isOfflineState === "true") {
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

    // MARK: Plan based layers
    if (settlement_layer === null) {
      settlement_layer = getVectorLayer(
        "resources",
        "settlement_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "settlement",
        currentPlan.plan_id,
        isOfflineState === "true"
      );
      LayerStore.updateSettlementLayer(settlement_layer);
    }

    if (well_layer === null) {
      well_layer = getVectorLayer(
        "resources",
        "well_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "well",
        currentPlan.plan_id,
        isOfflineState === "true"
      );
      LayerStore.updateWellLayer(well_layer);
    }

    if (waterbodies_layer === null) {
      waterbodies_layer = getVectorLayer(
        "resources",
        "waterbody_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "waterbody",
        currentPlan.plan_id,
        isOfflineState === "true"
      );
      LayerStore.updateWaterStructure(waterbodies_layer);
    }

    // MARK: Crop Grid
    if (cropgridLayer === null) {
      cropgridLayer = getVectorLayer(
        "crop_grid_layers",
        localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase() + "_grid",
        true,
        true,
        null,
        null,
        isOfflineState === "true"
      );
    }

    // MARK: Remote Water Bodies
    if (remote_sensed_waterBodies_layer == null) {
      remote_sensed_waterBodies_layer = getVectorLayer(
        "water_bodies",
        "surface_waterbodies_" +
        localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
        true,
        true
      );
    }

    const adminLayer = getVectorLayer(
      "panchayat_boundaries",
      localStorage.getItem("dist_name").toLowerCase() + "_" + localStorage.getItem("block_name").toLowerCase(),
      true,
      false,
      null,
      null,
      isOfflineState === "true",
      null,
      null
    );

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

    osmLayerRef.current = BaseLayer;
    wellLayerRef.current = well_layer;
    settlementLayerRef.current = settlement_layer;
    adminLayerRef.current = adminLayer;
    cropLayerRef.current = cropgridLayer;
    waterBodiesLayerRef.current = waterbodies_layer;
    positionFeatureRef.current = positionFeature;
    remote_wb_layerRef.current = remote_sensed_waterBodies_layer;

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

    if (gpsLocation) {
      const blockExtent = adminLayerRef.current.getSource().getExtent(); // Get the extent of the active block
      positionFeatureRef.current.setGeometry(new Point(gpsLocation));
      const isWithinBlock = extent.containsCoordinate(blockExtent, gpsLocation);
      setIsInBlock(isWithinBlock);
    }

    settlementLayerRef.current.setStyle(
      new Style({
        image: new Icon({ src: settlementIcon, scale: 0.4 }),
      })
    );

    wellLayerRef.current.setStyle(function (feature) {
      const status = feature.values_;
      if (status.status_re == "approved") {
        return new Style({
            image: new Icon({ src: well_mrker_accepted }),
          });
        } else if (status.status_re == "rejected") {
          return new Style({
            image: new Icon({ src: well_mrker_rejected }),
          });
        } else {
          return new Style({
            image: new Icon({ src: well_mrker }),
          });
        }
    });

    waterBodiesLayerRef.current.setStyle(function (feature) {
      const status = feature.values_;

      if (status.type_wbs == "Large water body") {
        return new Style({
          image: new Icon({ src: wb_mrker }),
        });
      } else if (status.type_wbs == "Farm pond") {
        return new Style({
          image: new Icon({ src: farm_pond_proposed }),
        });
      } else if (status.type_wbs == "Check dam") {
        return new Style({
          image: new Icon({ src: checkDam_proposed }),
        });
      } else if (status.type_wbs == "Loose boulder structure") {
        return new Style({
          image: new Icon({ src: boulder_proposed }),
        });
      } else if (status.type_wbs == "Trench cum bund network") {
        return new Style({
          image: new Icon({ src: tcb_proposed }),
        });
      } else if (status.type_wbs == "Canal") {
        return new Style({
          image: new Icon({ src: canals_proposed }),
        });
      } else if (status.type_wbs == "Irrigation channel") {
        return new Style({
          image: new Icon({ src: irrigation_channel }),
        });
      } else {
        return new Style({
          image: new Icon({ src: wb_mrker }),
        });
      }
    });

    remote_wb_layerRef.current.setStyle(
      new Style({
        stroke: new Stroke({ color: "#6495ed", width: 5 }),
        fill: new Fill({ color: "rgba(100, 149, 237, 0.5)" }),
      })
    );

    // MARK: Initial Map
    const initialMap = new Map({
      target: mapElement.current,
      layers: [
        BaseLayer,
        adminLayer,
        settlement_layer,
        new VectorLayer({
          source: new VectorSource({
            features: [positionFeature]
          })
        })
      ],
      view: view
    });

    mapRef.current = initialMap;

    const Vectorsource = adminLayer.getSource();
    Vectorsource.once("change", function (e) {
      if (Vectorsource.getState() === "ready") {
        initialMap.getView().setCenter(mapCenter);
      }
    });

    //? Code for Listening The Zoom Event and Scale Icons

    let currentZoom = mapRef.current.getView().getZoom()

    mapRef.current.on('moveend', (e) => {
      let newZoom = mapRef.current.getView().getZoom()
      var arr = mapRef.current.getView().calculateExtent(mapRef.current.getSize());
      setMapCenter([(arr[0] + arr[2]) / 2, (arr[1] + arr[3]) / 2])
      setZoomLevel(newZoom)
      if(currentZoom > newZoom){
        currentZoom = newZoom
        let newScale = (newZoom % 10) * 0.1
        if(newScale <= 0.4)
          newScale = 0.4
        settlementLayerRef.current.setStyle(
          new Style({
            image:
              new Icon({ src: settlementIcon, scale: newScale })
          })
        );
      }
      else if(currentZoom < newZoom){
        currentZoom = newZoom
        let newScale = (newZoom % 10) * 0.1
        if(newScale <= 0.4)
          newScale = 0.4
        if(newScale >= 0.8)
          newScale = 0.8

        settlementLayerRef.current.setStyle(
          new Style({
            image:
              new Icon({ src: settlementIcon, scale: 0.4 })
          })
        );
      }
    })

    // MARK: GPS Features
    // ? Code for GPS Feature for the Maps

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

    return () => {
      initialMap.setTarget(null);
    };
  }, [currentPlan]);

  // MARK: Map Marker Interaction
  useEffect(() => {

    const selected_style_settlement = new Style({
      image: new Icon({ src: selectSettlementIcon}),
    });

    const select_Settlement = new Select({ style: selected_style_settlement });

    // ? Code for the custom marker dropped by user to select location

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

    const layerFilter = (temp) => {
      if (
        temp == settlementLayerRef.current ||
        temp == waterBodiesLayerRef.current ||
        temp == cropLayerRef.current ||
        temp == wellLayerRef.current
      )
        return true;
      else return false;
    };

    if (mapRef !== null && currentScreen !== null) {
      mapRef.current.on("singleclick", (e) => {
        setCurrentLatLong(e.coordinate);

        markerFeature.setGeometry(new Point(e.coordinate));

        markerFeatureRef.current.setVisible(true);

        setIsButtonActive(false);
        setFirstClick(true);
        setAssetInfoButton(false);

        mapRef.current.forEachFeatureAtPixel(
          e.pixel,
          function (feature, layer) {
            if (layer === settlementLayerRef.current) {

              setHemlet(feature.values_.hemlet_id);

              mapRef.current.removeInteraction(select_Settlement);

              mapRef.current.addInteraction(select_Settlement);

              setIsButtonActive(true);

              updateSettlementName(feature.values_.Settleme_1);

              onSetSettlementInfo(feature.values_)
            }
            else if (layer == wellLayerRef.current) {
              mapRef.current.removeInteraction(select_Settlement);
              setCurrentWell(feature.values_.well_id);
              setFirstClick(false);
              onSetSettlementInfo(feature.values_)
              setAssetInfoButton(true);
            }
            else if (layer == waterBodiesLayerRef.current) {
              mapRef.current.removeInteraction(select_Settlement);
              setFirstClick(false);
              onSetSettlementInfo(feature.values_)
              setAssetInfoButton(true);
            }
            else if(layer == remote_wb_layerRef.current){
              onSetSettlementInfo(feature.values_)
              setAssetInfoButton(true);
            }
            else if (layer == cropLayerRef.current) {
              setIsButtonActive(true);
              setGridId(feature.values_.geometry.ol_uid)
              onSetSettlementInfo(feature.values_)
            }
          },
          { layerFilter }
        );
      });
    }
  }, [mapRef.current]);

  // MARK: Again?
  // MARK: Settlement Layer
  useEffect(() => {
    if (currentScreen == "add_settlement" && isLayerUpdated) {
      let settlement_layer = getVectorLayer(
        "resources",
        "settlement_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "settlement",
        currentPlan.plan_id,
        isOfflineState
      );

      settlement_layer.setStyle(
        new Style({
          image:
            new Icon({ src: settlementIcon, scale: 0.4 })
        })
      );

      mapRef.current.removeLayer(settlementLayerRef.current);

      settlementLayerRef.current = settlement_layer;

      mapRef.current.addLayer(settlement_layer);

      updateLayerState(false);
    } else if (currentScreen == "add_well" && isLayerUpdated) {
      let well_layer = getVectorLayer(
        "resources",
        "well_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "well",
        currentPlan.plan_id,
        isOfflineState
      );

      well_layer.setStyle(
        new Style({
          image:
            new Icon({ src: well_mrker, scale: 0.4 })
        })
      );

      mapRef.current.removeLayer(wellLayerRef.current);

      wellLayerRef.current = well_layer;

      mapRef.current.addLayer(well_layer);

      updateLayerState(false);
    } else if (currentScreen == "add_waterbodies" && isLayerUpdated) {
      let waterbodies_layer = getVectorLayer(
        "resources",
        "waterbody_" + currentPlan.plan_id + "_" + localStorage.getItem("dist_name").toLowerCase() + "_" +localStorage.getItem("block_name").toLowerCase(),
        true,
        true,
        "waterbody",
        currentPlan.plan_id,
        isOfflineState
      );

      waterbodies_layer.setStyle(
        new Style({
          image: 
            new Icon({ src: wb_mrker, scale: 0.4 })
        })
      );

      mapRef.current.removeLayer(waterBodiesLayerRef.current);

      waterBodiesLayerRef.current = waterbodies_layer;

      waterBodiesLayerRef.current.setStyle(function (feature) {
        const status = feature.values_;

        if (status.type_wbs == "Large water body") {
          return new Style({
            image: new Icon({ src: wb_mrker }),
          });
        } else if (status.type_wbs == "Farm pond") {
          return new Style({
            image: new Icon({ src: farm_pond_proposed }),
          });
        } else if (status.type_wbs == "Check dam") {
          return new Style({
            image: new Icon({ src: checkDam_proposed }),
          });
        } else if (status.type_wbs == "Loose boulder structure") {
          return new Style({
            image: new Icon({ src: boulder_proposed }),
          });
        } else if (status.type_wbs == "Trench cum bund network") {
          return new Style({
            image: new Icon({ src: tcb_proposed }),
          });
        } else if (status.type_wbs == "Canal") {
          return new Style({
            image: new Icon({ src: canals_proposed }),
          });
        } else if (status.type_wbs == "Irrigation channel") {
          return new Style({
            image: new Icon({ src: irrigation_channel }),
          });
        } else {
          return new Style({
            image: new Icon({ src: wb_mrker }),
          });
        }
      });

      mapRef.current.addLayer(waterbodies_layer);

      updateLayerState(false);
    }
  }, [isLayerUpdated]);

  return (
    <>
      <div style={mapContainerStyle} className="t2">
        <Toaster />
        <Assetform ref={mapRef}/>

        <div ref={mapElement} style={{ width: "100%", height: "100%" }} />

        <div className={styles.header_buttons}>
          <MenuSimple isDisabled={true} />
        </div>

        <div className={styles.header_secondary_buttons}>
          <div className={styles.header_secondary_button}>
            <Button
              onClick={handleInfoClick}
              isIcon={true}
              icon={faInfoCircle}
            />
          </div>
          <div className={styles.header_secondary_button}>
            <Button
              onClick={zoomToGPSLocation}
              isIcon={true}
              icon={faCrosshairs}
            />
          </div>
          {!isInBlock && (
            <Button
              onClick={zoomToBlockExtents}
              isIcon={true}
              icon={faCompass}
            />
          )}
        </div>

        <InfoSmModal isOpen={showInfoSmModal} onClose={handleInfoClose} />

        {isLayerUpdating && <Loader isOpen={isLayerUpdating} />}

        <div className={styles.footer_buttons}>
          {currentScreen == "add_settlement" && !isButtonActive && (
            <Button
              onClick={handleAddHamletbutton}
              label={t("Add Settlement")}
              isNext={true}
              isDisabled={isFirstClick}
            />
          )}

          {currentScreen == "add_settlement" && isButtonActive && (
            <div className={styles.footer_buttons_main_group}>
              <Button
                onClick={handleMarkResource}
                label={t("Mark Resources")}
                isNext={true}
              />
              <Button
                onClick={() => handleAssetInfoModal("settlement")}
                label={t("Settlement Info")}
                isNext={true}
              />
            </div>
          )}

          {currentScreen == "add_well" && (
            <>
              <div className={styles.footer_buttons_main_group}>
                <Button
                  onClick={handleAddWell}
                  label={t("Add Well")}
                  isDisabled={isFirstClick}
                />
                <Button
                  onClick={handleWellSkipButton}
                  label={t("Next")}
                  isNext={true}
                />
              </div>
              <div className={styles.footer_buttons_main_group}>
                <Button
                  onClick={() => handleAssetInfoModal("well")}
                  label={t("Asset Info")}
                  isNext={true}
                  isDisabled={assetInfoButton}
                />
              </div>
            </>
          )}

          {currentScreen == "add_waterbodies" && (
            <>
              <div className={styles.footer_buttons_main_group}>
                <Button
                  onClick={handleAddWB}
                  label={t("Add Water Structures")}
                  isDisabled={isFirstClick}
                />
                <Button
                  onClick={handleSkipWBButton}
                  label={t("Next")}
                  isNext={true}
                />
              </div>
              <div className={styles.footer_buttons_main_group}>
              <Button
                  onClick={() => handleAssetInfoModal("waterStructure")}
                  label={t("Asset Info")}
                  isNext={true}
                  isDisabled={assetInfoButton}
              />
              </div>
            </>
          )}

          {
            currentScreen == "add_crop" && (
              <>
                <div className={styles.footer_buttons_main_group}>
                  <Button
                    onClick={handleMoreCropInfo}
                    label={t("Provide Crop Info")}
                    isDisabled={isButtonActive}
                  />
                </div>
                <div className={styles.footer_buttons_main_group}>
                  <Button
                    onClick={handleFinishButton}
                    label={t("Finish")}
                    isNext={true}
                  />
                </div>
              </>
            )
          }
        </div>
      </div>
    </>
  );
}

export default ResourceMappingScreen;

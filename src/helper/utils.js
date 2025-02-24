import * as AWS from "aws-sdk";
import * as constant from "../helper/constants";

import { Fill, Stroke, Style, Text, Circle } from "ol/style.js";
import { Point } from 'ol/geom';
import { Feature } from 'ol';
import toast from "react-hot-toast";
import GeoJSON from "ol/format/GeoJSON";
import ImageLayer from "ol/layer/Image";
import ImageWMS from "ol/source/ImageWMS";
import Vector from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";

import WebGLPointsLayer from "ol/layer/WebGLPoints.js";
import * as proj from 'ol/proj';

const colorMapping = {
  // "Household Livelihood": "#C2678D", // Maroon
  // "Others - HH, Community": "#355070", // Blue-Grey
  // "Agri Impact - HH, Community": "#FFA500", // Yellow
  // "SWC - Landscape level impact": "#6495ED", // Brown
  // "Irrigation - Site level impact": "#1A759F", // Blue
  // "Plantation": "#52B69A", // Green
  // "Un Identified": "#6D597A", // Lavender
  // "Default": "#EAAC8B", // Tan
  "Household Livelihood": 1, // Maroon
  "Others - HH, Community": 2, // Blue-Grey
  "Agri Impact - HH, Community": 3, // Yellow
  "SWC - Landscape level impact": 4, // Brown
  "Irrigation - Site level impact": 5, // Blue
  Plantation: 6, // Green
  "Un Identified": 7, // Lavender
  Default: 8, // Tan
};

const createTextStyle = (feature, resolution) => {
  try{
    return new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      scale : 1.4,
      text: feature.values_.Panchaya_1.charAt(0).toUpperCase() + feature.values_.Panchaya_1.slice(1),
      fill: new Fill({color: '#ffffff'}),
      stroke: new Stroke({color: '#000000', width: 2}),
      offsetX: 0,
      offsetY: 0,
      overflow: true,
    });
  } catch(e){
    return new Text({
      textAlign: 'center',
      textBaseline: 'middle',
      scale : 1.4,
      text: feature.values_.vill_name.charAt(0).toUpperCase() + feature.values_.vill_name.slice(1),
      fill: new Fill({color: '#ffffff'}),
      stroke: new Stroke({color: '#000000', width: 2}),
      offsetX: 0,
      offsetY: 0,
      overflow: true,
    });
  }
}


const PanchayatBoundariesStyle = (feature, resolution) => {
  return new Style({
    stroke: new Stroke({
      color: "#292929",
      width: 2.0,
    }),
    fill: new Fill({
      color: "rgba(255, 255, 255, 0)",
    }),
    text: createTextStyle(feature, resolution),
  });
};

// MARK: Get URL
// TODO: remove the offline mode condition and check for drainage loading 
function getUrl(store_name, layer_name) {
  // const isOffline = localStorage.getItem("isOffline") === "true";
  const serverUrl = "https://geoserver.core-stack.org:8443";

  const dist = localStorage.getItem('dist_name').toLowerCase().replace(/ /g, "_");
  const block = localStorage.getItem('block_name').toLowerCase().replace(/ /g, "_");

  if (store_name === "drainage" || store_name === "customkml") {
    return `${serverUrl}/geoserver/${store_name}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${store_name}:${dist}_${block}&outputFormat=application/json&screen=main`;
  } else {
    // Use the original online URL construction
    return `${serverUrl}/geoserver/${store_name}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${store_name}:${layer_name}&outputFormat=application/json&screen=main`;
  }
}

// function getNewUrl(store_name, resource_type, plan_id) {
//   const isOffline = localStorage.getItem("isOffline") === "true";
//   const geoserver_url = isOffline
//     ? "http://localhost:3000"
//     : localStorage.getItem("geoserver_url");
//   const dist = localStorage.getItem("dist_name").toLowerCase();
//   const block = localStorage.getItem("block_name").toLowerCase();
//   let geojson_url;
//   if (isOffline) {
//     geojson_url = `${geoserver_url}/geoserver/${store_name}/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=${store_name}:${resource_type}_${plan_id}_${dist}_${block}&outputFormat=application/json&screen=main`;
//   } else if (store_name !== "drainage" && store_name !== "customkml")
//     geojson_url =
//       geoserver_url +
//       "/geoserver/" +
//       store_name +
//       "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
//       store_name +
//       "%3A" +
//       resource_type +
//       "_" +
//       plan_id +
//       "_" +
//       dist +
//       "_" +
//       block +
//       "&outputFormat=application/json&screen=main";
//   else {
//     geojson_url =
//       geoserver_url +
//       "/geoserver/" +
//       store_name +
//       "/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=" +
//       store_name +
//       "%3A" +
//       dist +
//       "_" +
//       block +
//       "&outputFormat=application/json&screen=main";
//   }

//   return geojson_url;
// }

// MARK: Offline File Config
// Helper function to get the correct offline file path
function getOfflineFilePath(layer_store, resource_type = null, plan_id = null) {
  const basePath = 'vector_layers';

  switch (layer_store) {
    case "nrega_assets":
      return `${basePath}/nrega_assets.geojson`;

    case "panchayat_boundaries":
      return `${basePath}/admin_boundaries.geojson`;

    case "mws_layers":
      return resource_type === "mws_fortnight"
        ? `${basePath}/well_depth_fortnightly.geojson`
        : `${basePath}/well_depth_yearly.geojson`;

    case "resources":
      switch (resource_type) {
        case "settlement":
          return `${basePath}/settlement_${plan_id}.geojson`;
        case "waterbody":
          return `${basePath}/waterbody_${plan_id}.geojson`;
        case "well":
          return `${basePath}/well_${plan_id}.geojson`;
        default:
          return `${basePath}/${resource_type}_${plan_id}.geojson`;
      }

    case "works":
      switch (resource_type) {
        case "plan_gw":
          return `${basePath}/plan_gw_${plan_id}.geojson`;
        case "plan_agri":
          return `${basePath}/plan_agri_${plan_id}.geojson`;
        case "main_swb":
          return `${basePath}/main_swb_${plan_id}.geojson`;
      }

    case "drainage":
      return `${basePath}/drainage.geojson`;

    // surface water bodies
    case "water_bodies":
      return `${basePath}/surface_waterbodies.geojson`;

    case "cropping_drought":
      return `${basePath}/cropping_drought.geojson`;

    case "cropping_intensity":
      return `${basePath}/cropping_intensity.geojson`;

    case "crop_grid_layers":
      return `${basePath}/crop_grid.geojson`;

    default:
      console.error("Unknown layer_store for offline mode:", layer_store);
      return null;
  }
}

// MARK: Get Vector Layer
function getVectorLayer(
  layer_store,
  layer_name,
  setVisible = true,
  setActive = true,
  resource_type = null,
  plan_id = null,
  isOffline = false,
  temp_layer = null,
  setNregaYears = null
) {
  let container_name = localStorage.getItem("container_name");
  //console.log("IS OFFLINE IN GETVECTORLAYER:", isOffline);
  const localServerURL = "http://localhost:3000";
  //console.log(`getVectorLayer called for ${layer_store}, isOffline: ${isOffline}`);

  // Determine the correct URL based on online/offline mode
  // TODO: You do not hit getUrl in case of offline mode, change the function according to that.. 
  let url;
  if (isOffline) {
    const offlinePath = getOfflineFilePath(layer_store, resource_type, plan_id);
    if (!offlinePath) return null;

    url = `${localServerURL}/containers/${container_name}/${offlinePath}`;
    console.log(`Loading offline layer from: ${url}`);
  } else {
    url = getUrl(layer_store, layer_name);
    //console.log(`Loading online layer from: ${url}`);
  }

  let nregaYears_temp = [];
  const vectorSource = new Vector({
    url: url,
    format: new GeoJSON({
      dataProjection: 'EPSG:4326',
      featureProjection: 'EPSG:4326'
    }),
    loader: async function(extent, resolution, projection) {
      try {
       // console.log(`Attempting to fetch ${layer_store} from ${url}`);
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error("Network response was not ok for " + layer_name);
        }
        const json = await response.json();
       // console.log(`Received ${json.features.length} features for ${layer_store}`);

        // Ensure CRS is set in the GeoJSON if not present
        if (!json.crs) {
          json.crs = {
            type: 'name',
            properties: {
              name: 'EPSG:4326'
            }
          };
        }

        const features = vectorSource.getFormat().readFeatures(json, {
          dataProjection: 'EPSG:4326',
          featureProjection: 'EPSG:4326'
        });

        vectorSource.addFeatures(
          features.map((item) => {
            if (layer_store === "nrega_assets") {
              item.values_.itemColor = colorMapping[item.values_.WorkCatego]
                ? colorMapping[item.values_.WorkCatego]
                : colorMapping["Default"];
              let temp_year = new Date(
                Date.parse(item.values_.creation_t)
              ).getFullYear();
              item.values_.workYear = temp_year.toString();
              if (!nregaYears_temp.includes(temp_year)) {
                nregaYears_temp.push(temp_year);
                nregaYears_temp.sort();
              }
            }
            return item;
          })
        );

      } catch (error) {
        console.error(`Error loading ${layer_store}:`, error);
        toast.error(
          `Failed to load "${layer_name}". ${isOffline
            ? 'Check if offline data is available.'
            : 'Check your connection.'}`,
          {
            duration: 6000,
            position: "top-center",
            style: {
              borderRadius: "10px",
              background: "#333",
              color: "#fff",
            },
          }
        );
      }
    }
  });

  // Create appropriate layer based on type
  let wmsLayer;
  if (layer_store === "nrega_assets") {
    const style = {
      filter: ["in", ["get", "workYear"], [2016, 2017, 2018]],
      "shape-points": 10,
      "shape-radius": 13,
      "shape-fill-color": [
        "match",
        ["get", "itemColor"],
        4,
        "#6495ED",
        "#00000000"
      ]
    };
    wmsLayer = new WebGLPointsLayer({
      source: vectorSource,
      style: style
    });
    if (setNregaYears) setNregaYears(nregaYears_temp);
  } else {
    wmsLayer = new VectorLayer({
      source: vectorSource,
      visible: setVisible,
      properties: {
        hover: setActive,
        myData: Math.random()
      },
      updateWhileAnimating: true,
      updateWhileInteracting: true
    });
  }

  // Apply special styles if needed
  if (layer_store === "panchayat_boundaries") {
    wmsLayer.setStyle(PanchayatBoundariesStyle);
  }

  return wmsLayer;
}

function calculateWaterBodyPercent(value_obj) {
  const sum_wb =
    (value_obj.k_p_perc * 1) / 3 +
    (value_obj.k_r_p_perc * 2) / 3 +
    (value_obj.k_r_z_perc * 3) / 3;
  return sum_wb;
}

function getImageLayer(layer_store, layer_name, setVisible = false) {
  //console.log(getUrl(layer_store, layer_name));
  const wmsLayer = new ImageLayer({
    source: new ImageWMS({
      url: "https://geoserver.core-stack.org:8443/geoserver/wms",
      params: { LAYERS: layer_store + ":" + layer_name },
      ratio: 1,
      serverType: "geoserver",
    }),
    visible: setVisible,
  });
  //console.log(wmsLayer)
  return wmsLayer;
}

function buildChartData(feature) {
  const data = [
    {
      title: "% area of water under only Kharif",
      value: feature.k_p_perc,
      color: "#E38627",
    },
    {
      title: "% area of water under Kharif and rabi",
      value: feature.k_r_p_perc,
      color: "#C13C37",
    },
    {
      title: "% area of water under Rabi, Kharif and Zayed",
      value: feature.k_r_z_perc,
      color: "#6A2135",
    },
  ];
  return data;
}

function getLayerName(url) {
  //console.log(url);
  const url_array = url.split("/");
  //console.log(url_array[4]);
  return url_array[4];
}



export {
  getUrl,
  getVectorLayer,
  getOfflineFilePath,
  calculateWaterBodyPercent,
  getImageLayer,
  buildChartData,
  getLayerName,
}

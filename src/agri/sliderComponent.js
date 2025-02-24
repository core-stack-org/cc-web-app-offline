import React, { useState, useEffect, useRef } from "react";
import { Feature, Map, View } from "ol";
import TileLayer from "ol/layer/Tile";
import Vector from "ol/source/Vector";
import OSM from "ol/source/OSM";
import "ol/ol.css";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import newTestJamui from "./newTestJamui.geojson";
import { Circle, Fill, Stroke, Style } from "ol/style.js";
import ReactSlider from "react-slider";
import {
  dropdownStyle,
  dropdownStyle2,
  customSlider,
  checkboxStyle,
  layersButtonStyle,
  layersButtonStyle2,
  mapContainerStyle,
  infoStyle,
  pointStyle,
} from "./styles";
import { coordinateRelationship } from "ol/extent";
const data = [2015, 2016, 2017, 2018, 2019];

function changePolygonColor(color) {
  return new Style({
    fill: new Fill({
      color: color,
    }),
    stroke: new Stroke({
      color: "black",
      width: 2,
    }),
  });
}

function SliderComponent() {
  const mapElement = useRef();
  const mapRef = useRef();
  const osmLayerRef = useRef();
  const wmsLayerRef = useRef();
  const wmsLayer3Ref = useRef();
  const [showLayerDropdown, setShowLayerDropdown] = useState(false); // To toggle layer dropdown
  const [sliderVis, setSliderVis] = useState(false);
  const handleLayerToggle = (layer) => {
    layer.setVisible(!layer.getVisible());
    setShowLayerDropdown(false);
  };

  useEffect(() => {
    const osmLayer = new TileLayer({
      source: new OSM(),
      visible: true,
    });

    const wmsLayer = new VectorLayer({
      source: new Vector({
        url: "http://13.200.45.247/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Ajamui&outputFormat=application%2Fjson",
        format: new GeoJSON(),
      }),
      visible: false,
    });

    const wmsLayer3 = new VectorLayer({
      source: new Vector({
        // url: "http://13.200.45.247/geoserver/cite/ows?service=WFS&version=1.0.0&request=GetFeature&typeName=cite%3Adeltag&outputFormat=application%2Fjson",
        url: newTestJamui,
        format: new GeoJSON(),
      }),
      visible: false,
    });

    osmLayerRef.current = osmLayer;
    wmsLayerRef.current = wmsLayer;
    wmsLayer3Ref.current = wmsLayer3;
    const initialMap = new Map({
      target: mapElement.current,
      layers: [osmLayer, wmsLayer, wmsLayer3],
      view: new View({
        center: [86.27, 24.7],
        zoom: 11,
        projection: "EPSG:4326",
      }),
    });

    mapRef.current = initialMap;

    initialMap.on("click", (e) => {
      initialMap.forEachFeatureAtPixel(e.pixel, function (feature, layer) {
        console.log(feature.values_);
      });
    });

    return () => {
      initialMap.setTarget(null);
    };
  }, []);
  const handlePropChange = function (year) {
    console.log("CALLED");
    wmsLayer3Ref.current.getSource().forEachFeature(function (feature) {
      const featureVal = feature.get(`Microwater_${data[year]}`);
      //console.log(`featureval for year ${data[year]} is ${featureVal}`);
      if (featureVal <= 50) feature.setStyle(changePolygonColor("red"));
      else if (featureVal <= 100)
        feature.setStyle(changePolygonColor("yellow"));
      else if (featureVal <= 150) feature.setStyle(changePolygonColor("green"));
      else feature.setStyle(changePolygonColor("blue"));
    });
  };

  return (
    <div>
      {sliderVis && (
        <Slider style={customSlider} handlePropChange={handlePropChange} />
      )}
      <div style={mapContainerStyle}>
        <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
        {showLayerDropdown && (
          <div style={dropdownStyle}>
            <label>
              <input
                type="checkbox"
                checked={wmsLayerRef.current.getVisible()}
                onChange={() => handleLayerToggle(wmsLayerRef.current)}
              />
              Jamui Layer
            </label>
            
            <label>
              <input
                type="checkbox"
                checked={wmsLayer3Ref.current.getVisible()}
                onChange={() => {
                  handleLayerToggle(wmsLayer3Ref.current);
                  setSliderVis(!sliderVis);
                }}
              />
              Sample Delta G Layer
            </label>
          </div>
        )}

        <button
          className="layersButtonStyle"
          onClick={() => setShowLayerDropdown((prevShow) => !prevShow)}
        >
          Layers
        </button>

        
      </div>
    </div>
  );
}

const Slider = ({ handlePropChange }) => {
  const [currentValue, setCurrentValue] = useState(0);
  return (
    <ReactSlider
      className="customSlider"
      trackClassName="customSlider-track"
      thumbClassName="customSlider-thumb"
      markClassName="customSlider-mark"
      marks={data}
      min={0}
      max={data.length - 1}
      defaultValue={0}
      value={currentValue}
      onChange={(value) => {
        handlePropChange(value);
        setCurrentValue(value);
      }}
    />
  );
};

export default SliderComponent;
import { Circle, Fill, Stroke, Style } from "ol/style.js";
export const dropdownStyle = {
  position: "absolute",
  top: "50px",
  right: "10px",
  background: "white",
  borderRadius: "5px",
  padding: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
};
export const dropdownStyle2 = {
  position: "absolute",
  top: "50px",
  right: "10px",
  background: "white",
  borderRadius: "5px",
  padding: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
};


export const sliderContainer = {
  flex: 1,
  flexDirection: "row",
  position: "absolute",
  top: 60,
  width:300,
  right: 50,
  alignSelf: "center",
  justifyContent: "space-between",
  columnGap: 10,
  backgroundColor: "transparent",
  borderWidth: 0.5,
  borderRadius: 20,
};

export const buttonsContainerStyle = {
  flex: 1,
  flexDirection: "row",
  position: "absolute",
  top: 10,
  right: 10,
  alignSelf: "center",
  justifyContent: "space-between",
  columnGap: 10,
  backgroundColor: "transparent",
  borderWidth: 0.5,
  borderRadius: 20,
};

export const dropdownStyle3 = {
  position: "absolute",
  top: "50px",
  right: "140px",
  background: "white",
  borderRadius: "5px",
  padding: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
};

export const actionbutton1 = {
  padding: "10px 15px",
  borderRadius: "10px",
  // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
  margin: "7px",
  backgroundColor: "#2c2c2c", // greyish-black
  color: "white", // text color
};

export const actionbutton2 = {
  padding: "10px 15px",
  borderRadius: "10px",
  // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
  margin: "7px",
  backgroundColor: "#2c2c2c", // greyish-black
  color: "white", // text color
};

export const actionbutton3 = {
  padding: "10px 15px",
  borderRadius: "10px",
  // boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
  margin: "7px",
  backgroundColor: "#2c2c2c", // greyish-black
  color: "white", // text color
};


export const footerbutton = {
  position: "absolute",
  bottom: "20px",
  left: "20px",
  right: 0,
  margin: "0 auto",
  width: "350px",
  padding: "5px 10px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0)",
  cursor: "pointer",
  zIndex: 1,
};

export const checkboxStyle = {
  display: "block",
  margin: "5px 0",
};

export const layersButtonStyle = {
  background: "white",
  padding: "5px 10px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
  margin: "5px",
};

export const layersButtonStyle2 = {
  background: "white",
  padding: "5px 10px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
  margin: "5px",
};

export const layersButtonStyle3 = {
  position: "absolute",
  top: "10px",
  right: "140px",
  background: "white",
  padding: "5px 10px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  cursor: "pointer",
  zIndex: 1,
};

export const infoButtonStyle = {
  background: 'white',
  padding: '5px 10px',
  borderRadius: '5px',
  cursor: 'pointer',
  zIndex: 1,
  margin: '5px',
  position: 'initial',
  right: '1px',
};


export const mapContainerStyle = {
  position: "relative",
  width: "100vw",
  height: "100vh",
};

export const infoStyle = {
  position: "absolute",
  bottom: "10px",
  left: "10px",
  background: "white",
  padding: "5px",
  borderRadius: "5px",
  boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
  zIndex: 1,
  maxHeight: "50vh",
  overflowY: "auto",
};

export const pointStyle = new Style({
  image: new Circle({
    fill: new Fill({
      color: [245, 10, 14, 0.5],
    }),
    radius: 10,
    stroke: new Stroke({
      color: [245, 10, 14, 0.5],
      width: 5,
    }),
  }),
});

export const pointStyle2 = new Style({
  image: new Circle({
    fill: new Fill({
      color: [194, 103, 141, 0.5],
    }),
    radius: 10,
    stroke: new Stroke({
      color: [194, 103, 141, 0.5],
      width: 5,
    }),
  }),
});

export const optionstyles = {
  mapContainer: {
    position: "relative",
    width: "100vw",
    height: "100vh",
  },
  map: {
    width: '100vw',
    height: '100vh', // Adjust the height as needed
  },
  optionsContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    background: 'rgba(255, 255, 255, 0.8)', // Adjust the background color and transparency
    padding: '10px',
    borderRadius: '8px',
    marginTop: '10px',
  },
  districtSelector: {
    position: "absolute",
    top: "10px",
    right: "175px",
    background: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    zIndex: 1,
  },
  dropdown: {
    marginLeft: '10px',
  },
  worksSelector: {
    position: "absolute",
    display: 'flex',
    flexDirection: 'column',
    top: "50px",
    right: "10px",
    background: "white",
    borderRadius: "5px",
    padding: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    zIndex: 1,
  },
  showHideButton: {
    position: "absolute",
    top: "10px",
    right: "10px",
    background: "white",
    padding: "5px 10px",
    borderRadius: "5px",
    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.2)",
    cursor: "pointer",
    zIndex: 1,
  }
};


export const fullstyle = new Style({
  stroke: new Stroke({
    color: "#f00",
    width: 1.5,
  }),
  fill: new Fill({
    color: "rgba(0, 0, 0, 0)", // Fully opaque black
  }),
});

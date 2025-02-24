import {
  Bar,
  BarChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useState, useEffect } from "react";
import { ThemeProvider, createTheme } from "@mui/material/styles";

import Box from "@mui/material/Box";
import Slider from "@mui/material/Slider";

import Button from "../components/Button";
import useAnalyzeModal from "../hooks/useAnalyzeModal";
import Modal from "../components/Modal";
import useOdkModal from "../hooks/useOdkModal";

import { useTranslation } from "react-i18next";

const theme = createTheme({
  components: {
    MuiSlider: {
      styleOverrides: {
        thumb: {
          color: "#E59866",
        },
        track: {
          color: "#DC7633",
        },
        rail: {
          color: "#FBEEE6",
        },
        markLabel: {
          color: "black",
          fontSize: "11px",
          fontWeight: "bold",
        },
      },
    },
  },
});

const AreaCircle = ({ areaValue }) => {
  const width = 100;
  const height = 100;
  const padding = 10;

  const radius = (width - padding * 2) / 2;

  return (
    <svg width={width + padding * 2} height={height + padding * 2}>
      <circle
        cx={(width + padding * 2) / 2}
        cy={(height + padding * 2) / 2}
        r={radius}
        fill="#ADD8E6"
      />
      <text
        x="50%"
        y="50%"
        dy="-7"
        alignmentBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Arial"
      >
        {`${twoDecimalFormatter(areaValue)}`}
      </text>
      <text
        x="50%"
        y="50%"
        dy="7"
        alignmentBaseline="middle"
        textAnchor="middle"
        fontSize="10"
        fontFamily="Arial"
      >
        acres
      </text>
    </svg>
  );
};

const twoDecimalFormatter = (number) => {
  return number.toFixed(2);
};

const WaterBodiesModal = () => {

  const isOpen = useAnalyzeModal((state) => state.isOpen);
  const onClose = useAnalyzeModal((state) => state.onClose);

  const onOpenOdk = useOdkModal((state) => state.onOpen);
  const onSetState = useOdkModal((state) => state.onSetState);

  const [data, setData] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null);
  const [marks, setMarks] = useState(null)

  const { t } = useTranslation();

  let tempArea = Number(sessionStorage.getItem("area_ored"));
  if (!isNaN(tempArea)) {
    tempArea = tempArea / 4047;
  } else {
    console.error("Area value is not a number");
  }

  useEffect(() => {
    if (isOpen) {
      const dataKeys = ["k_18-19","kr_18-19","krz_18-19","k_19-20","kr_19-20","krz_19-20","k_20-21","kr_20-21","krz_20-21","k_21-22"
        ,"kr_21-22", "krz_21-22", "k_22-23", "kr_22-23", "krz_22-23"]
      const dataYears = ["2018-2019","2019-2020","2020-2021","2021-2022","2022-2023"]

      let tempDataPoints = []

      for(let i = 0; i < dataYears.length; ++i){
        let keyIdx = i * 3;  
        let tempObj = {
          year: dataYears[i],
          Kharif: Number(sessionStorage.getItem(dataKeys[keyIdx])) || 0,
          "Kharif-Rabi": Number(sessionStorage.getItem(dataKeys[keyIdx + 1])) || 0,
          "Kharif-Rabi-Zaid": Number(sessionStorage.getItem(dataKeys[keyIdx + 2])) || 0,
        }
        tempDataPoints.push(tempObj)
      }

      setData(tempDataPoints)
      setSelectedYear(tempDataPoints[tempDataPoints.length - 1].year)  

      const tempMarks = tempDataPoints.map((entry, index) => ({
        value: index,
        label: entry.year,
      }));

      setMarks(tempMarks)
    }
  }, [isOpen]);

  const handleYearChange = (event, newValue) => {
    setSelectedYear(data[newValue].year);
  };

  const handleWBFeedbackClick = () => {
    let redirectState = {
      screen_code: "feedback_wb",
      next_screen: "",
    };

    onSetState(redirectState);

    onOpenOdk();
  };

  const bodyContent = (data !== null && selectedYear !== null ?
    <div style={barGraphContainerStyle}>
      <div style={graphAndSliderContainerStyle}>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data.filter((d) => d.year === selectedYear)}>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{
                value: "% of area with water",
                angle: -90,
                position: "Left",
              }}
              domain={[0, 100]}
            />
            <Tooltip formatter={twoDecimalFormatter} />
            <Legend verticalAlign="top" height={36} />
            <Bar dataKey="Kharif" fill="#E38627" name="Kharif" />
            <Bar dataKey="Kharif-Rabi" fill="#C13C37" name="Rabi" />
            <Bar dataKey="Kharif-Rabi-Zaid" fill="#6A2135" name="Zaid" />
          </BarChart>
        </ResponsiveContainer>
        <ThemeProvider theme={theme}>
          <CustomSlider handleYearChange={handleYearChange} marks={marks} />
        </ThemeProvider>

          <AreaCircle areaValue={tempArea} />
        
      </div>
      <div style={textContainerStyle}>
        <p>{t("info_swb_modal_1")}</p>
      </div>


      <div style={centerStyle}>
        <Button label={"Provide Feedback"} onClick={handleWBFeedbackClick} />
      </div>
    </div> : <></>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Water Bodies Analysis Graph"}
      body={bodyContent}
    />
  );
};

const CustomSlider = ({ handleYearChange, marks, selectedYear }) => {
  return (
    <Box
      sx={{
        width: 300,
        margin: "auto",
        backgroundColor: "#D6D4C8",
        borderRadius: "20px",
        padding: "20px",
        boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.1)",
      }}
    >
      <Slider
        aria-label="Years"
        defaultValue={0}
        valueLabelDisplay="auto"
        step={null}
        marks={marks}
        max={marks.length - 1}
        onChange={handleYearChange}
        color="primary"
        sx={{
          color: "#795664",
          "& .MuiSlider-thumb": {
            borderRadius: "50%",
            width: 20,
            height: 20,
            backgroundColor: "#795664",
            boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.2)",
            "&:hover": {
              boxShadow: "0px 2px 10px rgba(0, 0, 0, 0.3)",
            },
          },
          "& .MuiSlider-rail": {
            height: 6,
            borderRadius: 4,
            backgroundColor: "#795664",
          },
          "& .MuiSlider-track": {
            height: 6,
            borderRadius: 4,
            backgroundColor: "#795664",
          },
        }}
      />
    </Box>
  );
};

export default WaterBodiesModal;

const graphAndSliderContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  padding: "20px",
};

const barGraphContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  height: "auto",
  width: "auto",
};

const textContainerStyle = {
  textAlign: "left",
  fontSize: "13px",
  paddingLeft: "20px",
  paddingRight: "20px",
  marginBottom: "10px",
};

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "20px",
  padding: "20px",
  marginBottom: "20px",
};

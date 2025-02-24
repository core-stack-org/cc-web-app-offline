import {
  Line,
  LineChart,
  Bar,
  BarChart,
  CartesianGrid,
  Dot,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import React, { useEffect, useState } from "react";
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

const AgricultureModal = () => {
  const isOpen = useAnalyzeModal((state) => state.isOpen);
  const onClose = useAnalyzeModal((state) => state.onClose);

  const onOpenOdk = useOdkModal((state) => state.onOpen);
  const onSetState = useOdkModal((state) => state.onSetState);

  const { t } = useTranslation();

  //? Data Variables
  const [marks, setMarks] = useState(null)
  const [selectedYear, setSelectedYear] = useState(null);
  const [droughtFreq, setDroughtFreq] = useState(null)
  const [CropPatternData, setCropPatternData] = useState(null)

  // Update years array to start from 2017
  const years = [2017, 2018, 2019, 2020, 2021, 2022];

  function countValues(arr) {
    let count_0 = 0;
    let count_1 = 0;
    let count_2 = 0;
    let count_3 = 0;

    for (let i = 0; i < arr.length; i++) {
      if (arr[i] === 0) {
        count_0++;
      } else if (arr[i] === 1) {
        count_1++;
      } else if (arr[i] === 2) {
        count_2++;
      } else if (arr[i] === 3) {
        count_3++;
      }
    }

    return { count_0, count_1, count_2, count_3 };
  }

  // Update croppingIntensityData to start from 2017
  const croppingIntensityData = [
    { year: "2017", value: Number(sessionStorage.getItem("cropping_1")) },
    { year: "2018", value: Number(sessionStorage.getItem("cropping_2")) },
    { year: "2019", value: Number(sessionStorage.getItem("cropping_3")) },
    { year: "2020", value: Number(sessionStorage.getItem("cropping_4")) },
    { year: "2021", value: Number(sessionStorage.getItem("cropping_5")) },
    { year: "2022", value: Number(sessionStorage.getItem("cropping_6")) },
  ];

  useEffect(() => {
    if (isOpen) {
      let tempDroughtFreq = []

      //? Calculating Drought Frequency
      for(let i = 0; i < years.length; ++i){
        let tempData = sessionStorage.getItem(`drlb_${years[i]}`);
        const matches = String(tempData).match(/\d+/g);
        tempData = matches ? matches.map(Number) : [];
        let calcValues = countValues(tempData)
        let tempObj = {
          year : years[i],
          mild : calcValues.count_1,
          moderate : calcValues.count_2,
          severe : calcValues.count_3,
          dryspell : Number(sessionStorage.getItem(`drysp_${years[i]}`)) || 0
        }
        tempDroughtFreq.push(tempObj)
      }

      setDroughtFreq(tempDroughtFreq)
      setSelectedYear(tempDroughtFreq[tempDroughtFreq.length - 1].year)

      //? Calculating Cropping Pattern Data
      let total_cropable_area_2016_2022 = Number(sessionStorage.getItem("total_crop"));
      let tempCropPatternData = []
      
      for(let i = 0; i < years.length; ++i){
        // Update the index calculation since we're starting from 2017
        let singleCropping = ((Number(sessionStorage.getItem(`single_k_${i+1}`)) / total_cropable_area_2016_2022) * 100) + 
                            ((Number(sessionStorage.getItem(`single_n_${i+1}`)) / total_cropable_area_2016_2022) * 100);
        
        let doubleCropping = ((Number(sessionStorage.getItem(`doubly_c_${i+1}`)) / total_cropable_area_2016_2022) * 100);

        let tripleCropping = ((Number(sessionStorage.getItem(`triply_c_${i+1}`)) / total_cropable_area_2016_2022) * 100);

        let uncroppedArea = 100 - (singleCropping + doubleCropping + tripleCropping)
        
        let tempObj = {
          year: years[i],
          single: singleCropping,
          double: doubleCropping,
          triple: tripleCropping,
          uncropped: uncroppedArea,
        }
        tempCropPatternData.push(tempObj)
      }

      setCropPatternData(tempCropPatternData)

      const tempMarks = tempDroughtFreq.map((entry, index) => ({
        value: index,
        label: entry.year,
      }));
      setMarks(tempMarks)
    }
  }, [isOpen]);

  const handleYearChange = (event, newValue) => {
    setSelectedYear(droughtFreq[newValue].year);
  };

  const twoDecimalFormatter = (number) => {
    return number.toFixed(2);
  };

  const handleAgriFeedbackClick = () => {
    let redirectState = {
      screen_code: "feedback_agri",
      next_screen: "",
    };

    onSetState(redirectState);

    onOpenOdk();
  };

  const bodyContent = ( droughtFreq !== null && CropPatternData !== null ?
    <div style={barGraphContainerStyle}>
      <div style={graphAndSliderContainerStyle}>
        <h2 style={headerStyle}>Drought Frequency</h2>
        <ResponsiveContainer width="100%" height={250}>
          <BarChart
            data={droughtFreq.filter((d) => d.year === selectedYear)}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="year" />
            <YAxis
              label={{
                value: "Drought frequency (# weeks)",
                angle: -90,
                position: "Left",
              }}
              domain={[0, 52]}
              ticks={[0, 13, 26, 39, 52]}
            />
            <Tooltip formatter={twoDecimalFormatter} />
            <Legend align="center" verticalAlign="top" height={36} />
            <Bar dataKey="mild" fill="#F4D03F" name="Mild" />
            <Bar dataKey="moderate" fill="#EB984E" name="Moderate" />
            <Bar dataKey="severe" fill="#E74C3C" name="Severe" />
            <Bar dataKey="dryspell" fill="#8884d8" name="Dry Spell" />
            <Dot cx={2016} cy={75} r={4} />
          </BarChart>
        </ResponsiveContainer>
        <div style={textContainerStyle}>
          <p>{t("info_agri_modal_1")}</p>
        </div>
        <ThemeProvider theme={theme}>
          <CustomSlider
            handleYearChange={handleYearChange}
            marks={marks}
            selectedYear={selectedYear}
          />
        </ThemeProvider>

        <div style={{ width: "100%", height: "250px", marginTop: "20px" }}>
          <h2 style={headerStyle}>Cropping Intensity</h2>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={CropPatternData.filter((d) => d.year === selectedYear)}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                label={{
                  value: "Cropping Patterns",
                  angle: -90,
                  position: "Left",
                }}
              />
              <Tooltip formatter={twoDecimalFormatter} />
              {/* <Legend verticalAlign="bottom" height={36} /> */}
              <Legend
                align="center"
                verticalAlign="bottom"
                layout="horizontal"
                wrapperStyle={{ lineHeight: "20px" }}
              />
              <Bar
                dataKey="single"
                stackId="a"
                fill="#57ad2b"
                name="Single Cropping"
              />
              <Bar
                dataKey="double"
                stackId="a"
                fill="#e68600"
                name="Double Cropping"
              />
              <Bar
                dataKey="triple"
                stackId="a"
                fill="#b3561d"
                name="Triple Cropping"
              />
              <Bar
                dataKey="uncropped"
                stackId="a"
                fill="#A9A9A9"
                name="Uncropped Area"
              />
            </BarChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={250}>
            <LineChart
              data={croppingIntensityData}
              margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="year" />
              <YAxis
                label={{
                  value: "Cropping Intensity",
                  angle: -90,
                  position: "Left",
                }}
              />
              <Tooltip formatter={twoDecimalFormatter} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <div style={textContainerStyle}>
            <p>{t("info_agri_modal_2")}</p>
          </div>
          {/* Feedback button at the end */}
          <div style={centerStyle}>
            <Button
              label={"Provide Feedback"}
              onClick={handleAgriFeedbackClick}
            />
          </div>
        </div>
      </div>
    </div> : <></>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={"Agriculture Analysis Graph"}
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
        defaultValue={5}
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

export default AgricultureModal;

const graphAndSliderContainerStyle = {
  display: "flex",
  flexDirection: "column",
  alignItems: "left",
  justifyContent: "left",
  padding: "15px",
};

const barGraphContainerStyle = {
  display: "flex",
  flexDirection: "column",
  justifyContent: "left",
  alignItems: "left",
  overflowY: "auto",
  maxHeight: "80vh",
  marginTop: "25px",
};

const textContainerStyle = {
  textAlign: "left",
  padding: "0px",
  fontSize: "13px",
  // marginBottom: '10px' // Add some space before the graphs
};

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  height: "20px",
  padding: "20px",
  marginBottom: "20px",
};

const headerStyle = {
  textAlign: "left",
  width: "100%",
  marginBottom: "20px",
  fontSize: "1.5em",
  fontWeight: "bold",
  color: "#333",
  padding: "10px 0",
};

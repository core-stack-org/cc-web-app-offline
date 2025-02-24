import {
  Bar,
  Line,
  Area,
  AreaChart,
  CartesianGrid,
  ComposedChart,
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
import * as util from "../helper/utils";

import Button from "../components/Button";
import useAnalyzeModal from "../hooks/useAnalyzeModal";
import Modal from "../components/Modal";
import useOdkModal from "../hooks/useOdkModal";

import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

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

const GroundWaterModal = () => {
  const isOpen = useAnalyzeModal((state) => state.isOpen);
  const onClose = useAnalyzeModal((state) => state.onClose);

  const onOpenOdk = useOdkModal((state) => state.onOpen);
  const onSetState = useOdkModal((state) => state.onSetState);

  const featureData = useAnalyzeModal((state) => state.feature);
  const [parsedData, setParsedData] = useState([]);
  const [wellDepthData, setWellDepthData] = useState([]);
  const [selectedYear, setSelectedYear] = useState("All");
  const [wellDepthStats, setWellDepthStats] = useState({
    ET: 0,
    RunOff: 0,
    Precipitation: 0,
    G: 0,
  });

  const { t } = useTranslation();

  const clipGValue = (gValue, min, max) => {
    if (gValue > max) return max;
    if (gValue < min) return min;
    return gValue;
  };

  useEffect(() => {
    if (featureData) {
      console.log("Fortnight Data", featureData.fortnight);
      console.log("Well Depth Data", featureData.welldepth);

      // fortnight data
      const fortnightDateKeys = Object.keys(featureData.fortnight).filter(
        (key) => !["Area", "DN", "uid", "id"].includes(key)
      );

      let newFortnightData = fortnightDateKeys.map((date) => {
        let values;
        try {
          // Try to parse the JSON
          values = JSON.parse(featureData.fortnight[date]);
        } catch (error) {
          // If parsing fails, try to use the value as-is
          values = featureData.fortnight[date];
        }

        // Ensure values is an object
        if (typeof values !== "object" || values === null) {
          values = {};
        }

        return { date, ...values };
      });

      // Filter out any invalid entries
      newFortnightData = newFortnightData.filter(
        (item) => Object.keys(item).length > 1
      );

      // Sorting the data by date
      newFortnightData.sort((a, b) => new Date(a.date) - new Date(b.date));

      // Clipping the G value
      newFortnightData = newFortnightData.map((item) => ({
        ...item,
        G: clipGValue(parseFloat(item.G) || 0, -1600, 400),
      }));

      setParsedData(newFortnightData);

      // welldepth data
      const wellDepthYears = Object.keys(featureData.welldepth)
        .filter((key) => /^\d{4}_\d{4}$/.test(key))
        .map((key) => key.split("_")[0])
        .sort((a, b) => a.localeCompare(b));

      const newWellDepthData = wellDepthYears.map((year) => ({
        year,
        ...JSON.parse(featureData.welldepth[`${year}_${parseInt(year) + 1}`]),
      }));

      setWellDepthData(newWellDepthData);

      // Calculate initial averages
      const avgValues = calculateAverages(newWellDepthData);
      setWellDepthStats(avgValues);
    }
  }, [featureData]);

  const calculateAverages = (data) => {
    const sum = data.reduce(
      (acc, yearData) => {
        acc.ET += yearData.ET;
        acc.RunOff += yearData.RunOff;
        acc.Precipitation += yearData.Precipitation;
        acc.G += yearData.G;
        return acc;
      },
      { ET: 0, RunOff: 0, Precipitation: 0, G: 0 }
    );

    const count = data.length;
    return {
      ET: sum.ET / count,
      RunOff: sum.RunOff / count,
      Precipitation: sum.Precipitation / count,
      G: sum.G / count,
    };
  };

  useEffect(() => {
    if (selectedYear === "All") {
      setWellDepthStats(calculateAverages(wellDepthData));
    } else {
      const yearData = wellDepthData.find((data) => data.year === selectedYear);
      if (yearData) {
        setWellDepthStats({
          ET: yearData.ET,
          RunOff: yearData.RunOff,
          Precipitation: yearData.Precipitation,
          G: yearData.G,
        });
      }
    }
  }, [selectedYear, wellDepthData]);

  const years = ["All", ...wellDepthData.map((data) => data.year)];
  const filteredData =
    selectedYear === "All"
      ? parsedData
      : parsedData.filter((item) => item.date.startsWith(selectedYear));

  const marks = years.map((year, index) => ({
    value: index,
    label: year,
  }));

  const handleYearChange = (event, newValue) => {
    setSelectedYear(years[newValue]);
  };

  const formatXAxis = (tickItem) => {
    const date = new Date(tickItem);
    return `${date.getFullYear()}-${(date.getMonth() + 1)
      .toString()
      .padStart(2, "0")}`;
  };

  const twoDecimalFormatter = (number) => {
    return number.toFixed(2);
  };

  const handleGWFeedbackClick = () => {
    let redirectState = {
      screen_code: "feedback_gw",
      next_screen: "",
    };
    onSetState(redirectState);
    onOpenOdk();
  };

  const bodyContent = (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        height: "auto",
        width: "auto",
      }}
    >
      <div style={{ marginTop: "2em", fontWeight: "600", fontSize: "small" }}>
        {" "}
        <p>Change in Groundwater table over the years</p>{" "}
      </div>
      <ThemeProvider theme={theme}>
        <CustomSlider
          handleYearChange={handleYearChange}
          marks={marks}
          selectedYear={selectedYear}
        />
        <div style={{ marginTop: "2em", fontWeight: "600", fontSize: "small" }}>
        {" "}
          <p>Yearly</p>{" "}
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            justifyContent: "center",
            gap: "10px",
            margin: "10px 0",
          }}
        >
          <div style={roundedRectStyle}>
            <div style={valueStyle}>
              <strong>Evapotranspiration</strong>:{" "}
              {wellDepthStats.ET.toFixed(2)} mm
            </div>
          </div>
          <div style={roundedRectStyle}>
            <div style={valueStyle}>
              <strong>RunOff</strong>: {wellDepthStats.RunOff.toFixed(2)} mm
            </div>
          </div>
          <div style={roundedRectStyle}>
            <div style={valueStyle}>
              <strong>Precipitation</strong>:{" "}
              {wellDepthStats.Precipitation.toFixed(2)} mm
            </div>
          </div>
          <div style={roundedRectStyle}>
            <div style={valueStyle}>
              <strong>Groundwater</strong>: {wellDepthStats.G.toFixed(2)} mm
            </div>
          </div>
        </div>
      </ThemeProvider>

      <div style={{ marginTop: "2em", fontWeight: "600", fontSize: "small" }}>
        {" "}
        <p>Fortnightly</p>{" "}
      </div>

      <div style={{ width: "100%", overflowX: "hidden" }}>
        <div style={{ width: "90%" }}>
          <ResponsiveContainer width="100%" height={200}>
            <ComposedChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                label={{
                  value: "Fortnights",
                  position: "insideBottomRight",
                  offset: 0,
                }}
              />
              <YAxis
                label={{
                  value: "Precipitation and Runoff (mm)",
                  angle: -90,
                  position: "insideBottom",
                  offset: 40,
                }}
              />
              <Tooltip formatter={twoDecimalFormatter} />
              <Legend />
              <Bar dataKey="Precipitation" barSize={2} fill="#413ea0" />
              <Area
                type="monotone"
                dataKey="RunOff"
                stroke="#FF6EF4"
                fill="#FF6EF4"
              />
            </ComposedChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                label={{
                  value: "Fortnights",
                  position: "insideBottomRight",
                  offset: 0,
                }}
              />
              <YAxis
                label={{
                  value: "Evapotranspiration (mm)",
                  angle: -90,
                  position: "insideBottom",
                  offset: 40,
                }}
              />
              <Tooltip formatter={twoDecimalFormatter} />
              <Legend />
              <Area
                type="monotone"
                dataKey="ET"
                stroke="#1CFE72"
                fill="#1CFE72"
              />
            </AreaChart>
          </ResponsiveContainer>

          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={filteredData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="date"
                tickFormatter={formatXAxis}
                label={{
                  value: "Fortnights",
                  position: "insideBottomRight",
                  offset: 0,
                }}
              />
              <YAxis
                label={{
                  value: "Groundwater (mm)",
                  angle: -90,
                  position: "insideBottom",
                  offset: 40,
                }}
                domain={[-1600, 400]}
              />
              <Tooltip formatter={twoDecimalFormatter} />
              <Legend />
              <Area
                type="monotone"
                dataKey="G"
                stroke="#a0522d"
                fill="#a0522d"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={textContainerStyle}>
        <h3>Precipitation and RunOff</h3>
        <p>{t("info_gw_modal_1")}</p>
        <br></br>

        <h3>Evapotranspiration</h3>
        <p>{t("info_gw_modal_2")}</p>
        <br></br>

        <h3>Groundwater</h3>
        <p>{t("info_gw_modal_3")}</p>
        <br></br>
        <p>You can use the slider on the top to move across different years.</p>
      </div>

      <div style={centerStyle}>
        <Button label={"Provide Feedback"} onClick={handleGWFeedbackClick} />
      </div>
    </div>
  );

  return (
    <Modal
      title={"GroundWater Analysis Graph"}
      body={bodyContent}
      isOpen={isOpen}
      onClose={onClose}
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

const textContainerStyle = {
  textAlign: "left",
  padding: "15px",
  fontSize: "13px",
};

const centerStyle = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  marginBottom: "5em",
};

const roundedRectStyle = {
  backgroundColor: "#ededed",
  borderRadius: "10px",
  padding: "10px 20px",
  margin: "5px",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  minWidth: "150px",
};

const valueStyle = {
  textAlign: "center",
};

export default GroundWaterModal;

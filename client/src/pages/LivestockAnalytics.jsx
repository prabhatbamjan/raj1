import React, { useState, useEffect } from "react";
import axios from "axios";
import { Bar, Line } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import { Container, Typography, Grid, Paper, CircularProgress, Alert } from "@mui/material";

// Register Chart.js components
ChartJS.register(CategoryScale, LinearScale, BarElement, PointElement, LineElement, Title, Tooltip, Legend);

const LivestockAnalytics = () => {
  const [batchData, setBatchData] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [deathData, setDeathData] = useState([]);
  const [harvestData, setHarvestData] = useState([]);
  const [saleData, setSaleData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchLivestockAnalytics = async () => {
    try {
      const response = await axios.get("http://localhost:5000/api/livestock-analytics");
      console.log("API Response:", response.data);

      if (response.data) {
        const { batches, medicalRecords, deathRecords, harvestRecords, saleRecords } = response.data;
        setBatchData(batches || []);
        setMedicalData(medicalRecords || []);
        setDeathData(deathRecords || []);
        setHarvestData(harvestRecords || []);
        setSaleData(saleRecords || []);
        setError(null);
      } else {
        throw new Error("Invalid data structure received from API");
      }
    } catch (error) {
      console.error("Error fetching livestock analytics:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLivestockAnalytics();
  }, []);

  const batchChartData = {
    labels: batchData.map((batch) => batch.batchName),
    datasets: [
      {
        label: "Batch Size",
        data: batchData.map((batch) => batch.size),
        backgroundColor: "rgba(54, 162, 235, 0.6)",
        borderColor: "rgba(54, 162, 235, 1)",
        borderWidth: 1,
      },
    ],
  };

  const medicalChartData = {
    labels: medicalData.map((record) => record.symptom),
    datasets: [
      {
        label: "Symptom Frequency",
        data: medicalData.map((record) => record.count),
        backgroundColor: "rgba(255, 206, 86, 0.6)",
        borderColor: "rgba(255, 206, 86, 1)",
        borderWidth: 1,
      },
    ],
  };

  const deathChartData = {
    labels: deathData.map((record) => record.date),
    datasets: [
      {
        label: "Deaths",
        data: deathData.map((record) => record.count),
        borderColor: "rgba(255, 99, 132, 1)",
        backgroundColor: "rgba(255, 99, 132, 0.2)",
        fill: true,
      },
    ],
  };

  const harvestChartData = {
    labels: harvestData.map((record) => record.product),
    datasets: [
      {
        label: "Harvest Quantity",
        data: harvestData.map((record) => record.quantity),
        backgroundColor: "rgba(75, 192, 192, 0.6)",
        borderColor: "rgba(75, 192, 192, 1)",
        borderWidth: 1,
      },
    ],
  };

  const saleChartData = {
    labels: saleData.map((record) => record.product),
    datasets: [
      {
        label: "Sales Revenue",
        data: saleData.map((record) => record.revenue),
        backgroundColor: "rgba(153, 102, 255, 0.6)",
        borderColor: "rgba(153, 102, 255, 1)",
        borderWidth: 1,
      },
    ],
  };

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" gutterBottom align="center" sx={{ fontWeight: "bold", color: "#2E7D32" }}>
        Livestock Analytics
      </Typography>

      {loading ? (
        <Grid container justifyContent="center" sx={{ mt: 4 }}>
          <CircularProgress />
        </Grid>
      ) : error ? (
        <Alert severity="error" sx={{ mt: 4 }}>
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3} sx={{ mt: 2 }}>
          {/* Batch Distribution */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Batch Distribution
              </Typography>
              <Bar data={batchChartData} />
            </Paper>
          </Grid>

          {/* Symptom Frequency */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Symptom Frequency
              </Typography>
              <Bar data={medicalChartData} />
            </Paper>
          </Grid>

          {/* Death Records */}
          <Grid item xs={12}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Death Records Over Time
              </Typography>
              <Line data={deathChartData} />
            </Paper>
          </Grid>

          {/* Harvest Records */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Harvest Records
              </Typography>
              <Bar data={harvestChartData} />
            </Paper>
          </Grid>

          {/* Sales Records */}
          <Grid item xs={12} md={6}>
            <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
              <Typography variant="h6" gutterBottom align="center">
                Sales Records
              </Typography>
              <Bar data={saleChartData} />
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default LivestockAnalytics;

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
import { 
  Container, 
  Typography, 
  Grid, 
  Paper, 
  CircularProgress, 
  Alert, 
  Box, 
  Card, 
  CardContent, 
  Chip,
  Divider,
  IconButton,
  Skeleton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import LocalFloristIcon from '@mui/icons-material/LocalFlorist';
import HealingIcon from '@mui/icons-material/Healing';
import AgricultureIcon from '@mui/icons-material/Agriculture';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

const CropAnalytics = () => {
  const [cropData, setCropData] = useState([]);
  const [medicalData, setMedicalData] = useState([]);
  const [harvestData, setHarvestData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  // Custom chart colors
  const chartColors = {
    crops: {
      background: 'rgba(56, 142, 60, 0.6)',
      border: 'rgba(56, 142, 60, 1)',
    },
    medical: {
      background: 'rgba(211, 47, 47, 0.2)',
      border: 'rgba(211, 47, 47, 1)',
    },
    harvest: {
      background: 'rgba(81, 45, 168, 0.6)',
      border: 'rgba(81, 45, 168, 1)',
    }
  };

  // Fetch crop analytics data from the backend
  const fetchCropAnalytics = async () => {
    try {
      setRefreshing(true);
      const token = localStorage.getItem('token');
      const response = await axios.get("http://localhost:5000/api/crop-analytics", {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      
      if (response.data) {
        const { crops, medicalRecords, harvestRecords } = response.data;
        setCropData(crops || []);
        setMedicalData(medicalRecords || []);
        setHarvestData(harvestRecords || []);
        setError(null);
      } else {
        throw new Error("Invalid data structure received from the API");
      }
    } catch (error) {
      console.error("Error fetching crop analytics data:", error);
      setError("Failed to fetch data. Please try again later.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchCropAnalytics();
  }, []);

  // Calculate totals and averages
  const totalYield = cropData.reduce((sum, crop) => sum + crop.yield, 0);
  const averageYield = cropData.length > 0 ? (totalYield / cropData.length).toFixed(2) : 0;
  const totalMedicalIssues = medicalData.reduce((sum, record) => sum + record.issueCount, 0);
  const totalHarvest = harvestData.reduce((sum, record) => sum + record.quantity, 0);

  // Prepare data for the charts
  const barChartData = {
    labels: cropData.map((crop) => crop.cropType),
    datasets: [
      {
        label: "Yield (kg)",
        data: cropData.map((crop) => crop.yield),
        backgroundColor: chartColors.crops.background,
        borderColor: chartColors.crops.border,
        borderWidth: 1,
      },
    ],
  };

  const lineChartData = {
    labels: medicalData.map((record) => record.date),
    datasets: [
      {
        label: "Medical Issues",
        data: medicalData.map((record) => record.issueCount),
        borderColor: chartColors.medical.border,
        backgroundColor: chartColors.medical.background,
        tension: 0.3,
        fill: true,
      },
    ],
  };

  const harvestChartData = {
    labels: harvestData.map((record) => record.cropType),
    datasets: [
      {
        label: "Harvest Quantity (kg)",
        data: harvestData.map((record) => record.quantity),
        backgroundColor: chartColors.harvest.background,
        borderColor: chartColors.harvest.border,
        borderWidth: 1,
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          font: {
            family: "'Roboto', 'Helvetica', 'Arial', sans-serif",
            size: 12
          }
        }
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        backgroundColor: 'rgba(50, 50, 50, 0.8)',
        padding: 10,
        titleFont: {
          size: 14,
          weight: 'bold'
        },
        bodyFont: {
          size: 13
        },
        cornerRadius: 4,
        displayColors: true
      },
    },
    scales: {
      x: {
        grid: {
          display: false
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      },
      y: {
        beginAtZero: true,
        grid: {
          color: 'rgba(200, 200, 200, 0.2)'
        },
        ticks: {
          font: {
            size: isMobile ? 10 : 12
          }
        }
      }
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuart",
    },
  };

  const handleRefresh = () => {
    setLoading(true);
    fetchCropAnalytics();
  };

  const renderSkeleton = () => (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {[1, 2, 3].map((item) => (
        <Grid item xs={12} md={item === 3 ? 12 : 6} key={item}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton variant="text" width="50%" height={40} sx={{ mx: 'auto' }} />
            <Skeleton variant="rectangular" height={250} sx={{ mt: 2 }} />
          </Paper>
        </Grid>
      ))}
    </Grid>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      {/* Header with refresh button */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography 
          variant="h4" 
          sx={{ 
            fontWeight: "bold", 
            color: "#2E7D32",
            display: 'flex',
            alignItems: 'center',
            gap: 1
          }}
        >
          <LocalFloristIcon fontSize="large" />
          Crop Analytics Dashboard
        </Typography>
        
        <IconButton 
          onClick={handleRefresh} 
          color="primary" 
          disabled={refreshing}
          sx={{ 
            backgroundColor: 'rgba(46, 125, 50, 0.1)',
            '&:hover': {
              backgroundColor: 'rgba(46, 125, 50, 0.2)',
            }
          }}
        >
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* KPI Summary Cards */}
      {!loading && !error && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              borderLeft: '4px solid #388E3C',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Crop Yield
                  </Typography>
                  <LocalFloristIcon sx={{ color: '#388E3C' }} />
                </Box>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium' }}>
                  {totalYield.toLocaleString()} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Avg. {averageYield} kg per crop
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              borderLeft: '4px solid #D32F2F',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Medical Issues
                  </Typography>
                  <HealingIcon sx={{ color: '#D32F2F' }} />
                </Box>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium' }}>
                  {totalMedicalIssues}
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Across {medicalData.length} reporting periods
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4}>
            <Card elevation={2} sx={{ 
              borderRadius: 2, 
              borderLeft: '4px solid #512DA8',
              height: '100%'
            }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="subtitle2" color="text.secondary">
                    Total Harvest
                  </Typography>
                  <AgricultureIcon sx={{ color: '#512DA8' }} />
                </Box>
                <Typography variant="h4" sx={{ mt: 1, fontWeight: 'medium' }}>
                  {totalHarvest.toLocaleString()} kg
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  From {harvestData.length} crop types
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {loading ? (
        renderSkeleton()
      ) : error ? (
        <Alert 
          severity="error" 
          sx={{ 
            mt: 4, 
            borderRadius: 2,
            fontSize: '1rem',
            '& .MuiAlert-icon': {
              fontSize: '1.5rem'
            }
          }}
          action={
            <IconButton 
              color="inherit" 
              size="small" 
              onClick={handleRefresh}
            >
              <RefreshIcon />
            </IconButton>
          }
        >
          {error}
        </Alert>
      ) : (
        <Grid container spacing={3}>
          {/* Bar Chart - Crop Yield */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                },
                height: 450
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocalFloristIcon fontSize="small" sx={{ color: chartColors.crops.border }} />
                  <Typography variant="h6">
                    Crop Yield
                  </Typography>
                </Box>
                <Chip 
                  label={`${cropData.length} crop types`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(56, 142, 60, 0.1)',
                    color: chartColors.crops.border
                  }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {cropData.length > 0 ? (
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Bar data={barChartData} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
                  <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" align="center" color="text.secondary">
                    No crop data available.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Line Chart - Medical Issues */}
          <Grid item xs={12} md={6}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                },
                height: 450
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <HealingIcon fontSize="small" sx={{ color: chartColors.medical.border }} />
                  <Typography variant="h6">
                    Medical Issues Over Time
                  </Typography>
                </Box>
                <Chip 
                  label={`${totalMedicalIssues} total issues`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(211, 47, 47, 0.1)',
                    color: chartColors.medical.border
                  }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {medicalData.length > 0 ? (
                <Box sx={{ height: 300, position: 'relative' }}>
                  <Line data={lineChartData} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 300, flexDirection: 'column' }}>
                  <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" align="center" color="text.secondary">
                    No medical data available.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>

          {/* Bar Chart - Harvest Quantity */}
          <Grid item xs={12}>
            <Paper 
              elevation={3} 
              sx={{ 
                p: 3, 
                borderRadius: 2,
                transition: 'transform 0.3s',
                '&:hover': {
                  transform: 'translateY(-5px)',
                  boxShadow: 5
                }
              }}
            >
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <AgricultureIcon fontSize="small" sx={{ color: chartColors.harvest.border }} />
                  <Typography variant="h6">
                    Harvest Quantity by Crop Type
                  </Typography>
                </Box>
                <Chip 
                  label={`${totalHarvest.toLocaleString()} kg total`} 
                  size="small" 
                  sx={{ 
                    backgroundColor: 'rgba(81, 45, 168, 0.1)',
                    color: chartColors.harvest.border
                  }}
                />
              </Box>
              <Divider sx={{ mb: 3 }} />
              
              {harvestData.length > 0 ? (
                <Box sx={{ height: 350, position: 'relative' }}>
                  <Bar data={harvestChartData} options={chartOptions} />
                </Box>
              ) : (
                <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: 350, flexDirection: 'column' }}>
                  <InfoOutlinedIcon sx={{ fontSize: 48, color: 'text.disabled', mb: 2 }} />
                  <Typography variant="body1" align="center" color="text.secondary">
                    No harvest data available.
                  </Typography>
                </Box>
              )}
            </Paper>
          </Grid>
        </Grid>
      )}
    </Container>
  );
};

export default CropAnalytics;
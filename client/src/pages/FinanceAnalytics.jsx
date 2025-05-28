import React, { useState, useEffect, useCallback } from "react";
import api from "../utils/api";
import { Bar, Doughnut } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title,
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
  Divider,
  Chip,
  Button,
  ToggleButtonGroup,
  ToggleButton,
  FormControl,
  Select,
  MenuItem,
  InputLabel,
  Skeleton,
  Snackbar
} from "@mui/material";
import RefreshIcon from '@mui/icons-material/Refresh';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import TrendingDownIcon from '@mui/icons-material/TrendingDown';
import FilterListIcon from '@mui/icons-material/FilterList';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  ArcElement,
  Tooltip,
  Legend,
  Title
);

// Corrected API URL
const API_BASE_URL = "http://localhost:5001/api/finance-analytics";
const API_TIMEOUT = 8000;

const FinanceAnalytics = () => {
  const [financeData, setFinanceData] = useState({});

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [timeFilter, setTimeFilter] = useState("monthly");
  const [year, setYear] = useState(new Date().getFullYear());
  const [month, setMonth] = useState(new Date().getMonth());
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [retryCount, setRetryCount] = useState(0);
console.log("from state",financeData)
  const fetchFinanceAnalytics = useCallback(async () => {
    // Use AbortController for cancellation (modern approach)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, API_TIMEOUT);
    
    try {
      setRefreshing(true);
      setError(null);
      
      const response = await api.get(`/finance-analytics/summary`, {
        params: {
          timeFilter,
          year,
          month: timeFilter === "monthly" ? month : undefined,
          timestamp: new Date().getTime()
        },
        headers: {
          'Cache-Control': 'no-cache',
          'Pragma': 'no-cache',
          'Expires': '0'
        },
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.data.success && response.data.data) {
        setFinanceData(response.data.data);
        setError(null);
        setSnackbarMessage("Data updated successfully");
        setSnackbarOpen(true);
        setRetryCount(0);
      } else {
        throw new Error("Invalid response format from server");
      }
    } catch (error) {
      console.error("Error fetching finance analytics data:", error);
      
      if (error.name === 'AbortError') {
        setError("Request timed out. Server may be down or unreachable.");
      } else if (error.response) {
        if (error.response.status === 404) {
          setError(`Endpoint not found. Please verify the backend API route exists.`);
        } else {
          setError(`Server error: ${error.response.status}. ${error.response.data?.message || ''}`);
        }
      } else if (error.request) {
        setError("No response from server. Please check your network connection.");
      } else {
        setError(`Failed to fetch data: ${error.message}`);
      }
      
      // Log detailed error info for debugging
      console.error("API Error Details:", {
        url: error.config?.url,
        method: error.config?.method,
        status: error.response?.status,
        data: error.response?.data
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [timeFilter, year, month]);

  useEffect(() => {
    fetchFinanceAnalytics();
    
    const retryIntervalId = setInterval(() => {
      if (error && retryCount < 3) {
        console.log(`Retrying fetch attempt ${retryCount + 1}...`);
        setRetryCount(prev => prev + 1);
        fetchFinanceAnalytics();
      }
    }, 5000);
    
    return () => {
      clearInterval(retryIntervalId);
    };
  }, [fetchFinanceAnalytics, error, retryCount]);

  // Helper functions remain the same...
  const formatCurrency = (value) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2
    }).format(value || 0);
  };

  const calculateProfitMargin = () => {
    if (!financeData.income || financeData.income === 0) return 0;
    return ((financeData.profit / financeData.income) * 100).toFixed(1);
  };

  const getMonthName = (monthIndex) => {
    const monthNames = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    return monthNames[monthIndex];
  };

  const getYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return Array.from({ length: 6 }, (_, i) => currentYear - i);
  };

  // Chart data preparation remains the same...
  const barChartData = {
    labels: financeData.monthlyData ? 
      financeData.monthlyData.map(item => timeFilter === "monthly" ? item.date : item.month) : 
      ["No Data"],
    datasets: [
      {
        label: "Income",
        data: financeData.monthlyData?.map(item => item.income) || [0],
        backgroundColor: "rgba(76, 175, 80, 0.8)",
        borderColor: "#4CAF50",
        borderWidth: 1,
      },
      {
        label: "Expenses",
        data: financeData.monthlyData?.map(item => item.expenses) || [0],
        backgroundColor: "rgba(220, 53, 69, 0.8)",
        borderColor: "#dc3545",
        borderWidth: 1,
      },
      {
        label: "Profit/Loss",
        data: financeData.monthlyData?.map(item => item.profit) || [0],
        backgroundColor: "rgba(0, 123, 255, 0.8)",
        borderColor: "#007bff",
        borderWidth: 1,
      }
    ],
  };

  const incomeVsExpensesData = {
    labels: ["Income", "Expenses"],
    datasets: [
      {
        data: [financeData.income || 0, financeData.expenses || 0],
        backgroundColor: ["rgba(76, 175, 80, 0.8)", "rgba(220, 53, 69, 0.8)"],
        borderColor: ["#4CAF50", "#dc3545"],
        borderWidth: 1,
        hoverBackgroundColor: ["rgba(76, 175, 80, 1)", "rgba(220, 53, 69, 1)"],
      },
    ],
  };

  // Chart options remain the same...
  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "top",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: { size: 12 }
        }
      },
      tooltip: {
        enabled: true,
        mode: "index",
        intersect: false,
        callbacks: {
          label: function(context) {
            return `${context.dataset.label || ''}: ${formatCurrency(context.raw)}`;
          }
        },
        padding: 12,
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleFont: { size: 14 },
        bodyFont: { size: 13 }
      },
      title: { display: false }
    },
    animation: {
      duration: 1000,
      easing: "easeInOutQuad",
    },
    layout: { padding: 10 }
  };

  const barChartOptions = {
    ...chartOptions,
    scales: {
      y: {
        beginAtZero: true,
        ticks: { callback: value => formatCurrency(value) },
        grid: { color: 'rgba(0, 0, 0, 0.05)' }
      },
      x: { grid: { display: false } }
    }
  };

  const doughnutOptions = {
    ...chartOptions,
    cutout: '70%'
  };

  // Event handlers remain the same...
  const handleTimeFilterChange = (event, newValue) => {
    if (newValue !== null) setTimeFilter(newValue);
  };

  const handleYearChange = (event) => setYear(event.target.value);
  const handleMonthChange = (event) => setMonth(event.target.value);

  const handleRefresh = () => {
    setLoading(true);
    setRetryCount(0);
    fetchFinanceAnalytics();
  };

  const handleSnackbarClose = () => setSnackbarOpen(false);

  // Render methods remain the same...
  const renderSkeleton = () => (
    <Grid container spacing={3} sx={{ mt: 2 }}>
      {[...Array(4)].map((_, i) => (
        <Grid item xs={12} md={6} lg={3} key={i}>
          <Paper elevation={3} sx={{ p: 2, borderRadius: 2 }}>
            <Skeleton variant="text" width="50%" height={30} />
            <Skeleton variant="text" width="70%" height={40} />
            <Skeleton variant="text" width="40%" height={25} />
          </Paper>
        </Grid>
      ))}
      <Grid item xs={12} md={8}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 350 }}>
          <Skeleton variant="text" width="40%" height={30} />
          <Skeleton variant="rectangular" width="100%" height={290} />
        </Paper>
      </Grid>
      <Grid item xs={12} md={4}>
        <Paper elevation={3} sx={{ p: 2, borderRadius: 2, height: 350 }}>
          <Skeleton variant="text" width="40%" height={30} />
          <Skeleton variant="circular" width={290} height={290} sx={{ margin: '0 auto' }} />
        </Paper>
      </Grid>
    </Grid>
  );

  const getFilterTitle = () => timeFilter === "yearly" 
    ? `Financial Overview for Year ${year}` 
    : `Financial Overview for ${getMonthName(month)} ${year}`;

  const renderErrorState = () => (
    <Box sx={{ mt: 4, textAlign: 'center' }}>
      <Alert 
        severity="error" 
        sx={{ mt: 4, borderRadius: 2, mb: 3 }}
        action={
          <Button color="inherit" size="small" onClick={handleRefresh}>
            {refreshing ? "Trying..." : "Retry Now"}
          </Button>
        }
      >
        {error}
      </Alert>
      
      <Paper elevation={3} sx={{ p: 4, borderRadius: 2, maxWidth: 600, mx: 'auto', mt: 4 }}>
        <Typography variant="h6" gutterBottom color="error">
          Connection Issues
        </Typography>
        <Divider sx={{ mb: 3 }} />
        
        <Typography variant="body1" paragraph>
          We're having trouble connecting to the finance data server.
        </Typography>
        
        <Box sx={{ textAlign: 'left', mb: 3 }}>
          {[
            "The server may be down or unreachable",
            "Your network connection may be unstable",
            "The API endpoint URL might be incorrect",
            "CORS policies might be blocking the request"
          ].map((text, i) => (
            <Typography key={i} component="div" variant="body2">
              • {text}
            </Typography>
          ))}
        </Box>
        
        <Button 
          variant="contained" 
          color="primary" 
          startIcon={<RefreshIcon />}
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ mt: 2 }}
        >
          {refreshing ? "Reconnecting..." : "Try Again"}
        </Button>
      </Paper>
    </Box>
  );

  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" sx={{ fontWeight: "bold", color: "#1976d2" }}>
          Finance Analytics Dashboard
        </Typography>
        <Button 
          variant="outlined" 
          startIcon={<RefreshIcon />} 
          onClick={handleRefresh}
          disabled={refreshing}
          sx={{ borderRadius: 2 }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </Button>
      </Box>
      
      {/* Time Filter Controls */}
      <Paper elevation={2} sx={{ p: 2, mb: 3, borderRadius: 2 }}>
        <Box sx={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <FilterListIcon sx={{ mr: 1, color: 'text.secondary' }} />
            <Typography variant="subtitle1" sx={{ mr: 2 }}>
              Time Period:
            </Typography>
          </Box>
          
          <ToggleButtonGroup
            value={timeFilter}
            exclusive
            onChange={handleTimeFilterChange}
            aria-label="time filter"
            size="small"
            sx={{ mr: 2 }}
          >
            <ToggleButton value="monthly">Monthly</ToggleButton>
            <ToggleButton value="yearly">Yearly</ToggleButton>
          </ToggleButtonGroup>
          
          <FormControl sx={{ minWidth: 120, mr: 2 }} size="small">
            <InputLabel id="year-select-label">Year</InputLabel>
            <Select
              labelId="year-select-label"
              value={year}
              label="Year"
              onChange={handleYearChange}
            >
              {getYearOptions().map(yearOption => (
                <MenuItem key={yearOption} value={yearOption}>{yearOption}</MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {timeFilter === "monthly" && (
            <FormControl sx={{ minWidth: 120 }} size="small">
              <InputLabel id="month-select-label">Month</InputLabel>
              <Select
                labelId="month-select-label"
                value={month}
                label="Month"
                onChange={handleMonthChange}
              >
                {Array.from({ length: 12 }, (_, i) => (
                  <MenuItem key={i} value={i}>{getMonthName(i)}</MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ flexGrow: 1 }} />
          
          <Typography variant="subtitle1" color="primary.main" fontWeight="medium">
            {getFilterTitle()}
          </Typography>
        </Box>
      </Paper>
      
      {loading ? (
        renderSkeleton()
      ) : error ? (
        renderErrorState()
      ) : Object.keys(financeData).length === 0 ? (
        <Alert severity="info" sx={{ mt: 4, borderRadius: 2 }}>
          No financial data available for the selected period.
        </Alert>
      ) : (
        <>
          {/* Summary Cards */}
          <Grid container spacing={3} sx={{ mb: 3 }}>
            {[
              {
                title: "TOTAL INCOME",
                value: financeData.income,
                growth: financeData.incomeGrowth,
                color: "#4CAF50",
                borderColor: "#4CAF50",
                icon: <TrendingUpIcon />,
                growthColor: "success"
              },
              {
                title: "TOTAL EXPENSES",
                value: financeData.expenses,
                growth: financeData.expenseGrowth,
                color: "#dc3545",
                borderColor: "#dc3545",
                icon: financeData.expenseGrowth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
                growthColor: financeData.expenseGrowth < 0 ? "success" : "error"
              },
              {
                title: "PROFIT/LOSS",
                value: financeData.profit,
                growth: financeData.profitGrowth,
                color: financeData.profit >= 0 ? '#007bff' : '#dc3545',
                borderColor: financeData.profit >= 0 ? '#007bff' : '#ffc107',
                icon: financeData.profitGrowth > 0 ? <TrendingUpIcon /> : <TrendingDownIcon />,
                growthColor: financeData.profitGrowth > 0 ? "success" : "error"
              },
              {
                title: "PROFIT MARGIN",
                value: `${calculateProfitMargin()}%`,
                color: "#9c27b0",
                borderColor: "#9c27b0",
                description: `${financeData.profit >= 0 ? 'Positive' : 'Negative'} return`
              }
            ].map((card, index) => (
              <Grid item xs={12} md={6} lg={3} key={index}>
                <Card elevation={3} sx={{ 
                  borderRadius: 2, 
                  position: 'relative', 
                  overflow: 'visible', 
                  borderLeft: `4px solid ${card.borderColor}`
                }}>
                  <CardContent>
                    <Typography color="textSecondary" variant="subtitle2" gutterBottom>
                      {card.title}
                    </Typography>
                    <Typography variant="h4" component="div" sx={{ 
                      fontWeight: 'bold', 
                      my: 1,
                      color: card.color
                    }}>
                      {card.title.includes("MARGIN") ? card.value : formatCurrency(card.value)}
                    </Typography>
                    {card.growth !== undefined ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Chip 
                          icon={card.icon} 
                          label={`${card.growth || 0}%`} 
                          size="small" 
                          color={card.growthColor}
                          sx={{ borderRadius: 1 }}
                        />
                        <Typography variant="body2" color="textSecondary" sx={{ ml: 1 }}>
                          vs previous {timeFilter === "monthly" ? "month" : "year"}
                        </Typography>
                      </Box>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        {card.description}
                      </Typography>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12} md={8}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  {timeFilter === "yearly" ? "Monthly Breakdown" : "Daily Breakdown"}
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 370 }}>
                  <Bar data={barChartData} options={barChartOptions} />
                </Box>
              </Paper>
            </Grid>
            
            <Grid item xs={12} md={4}>
              <Paper elevation={3} sx={{ p: 3, borderRadius: 2, height: 450 }}>
                <Typography variant="h6" gutterBottom>
                  Income vs Expenses
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <Box sx={{ height: 320, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                  <Doughnut data={incomeVsExpensesData} options={doughnutOptions} />
                </Box>
                <Box sx={{ mt: 2, display: 'flex', justifyContent: 'center' }}>
                  <Typography variant="body2" sx={{ fontWeight: 'medium' }}>
                    Total: {formatCurrency((financeData.income || 0) + (financeData.expenses || 0))}
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
      
      <Snackbar
        open={snackbarOpen}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        message={snackbarMessage}
      />
    </Container>
  );
};

export default FinanceAnalytics;
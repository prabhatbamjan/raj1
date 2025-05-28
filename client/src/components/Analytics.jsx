import React, { useState, useEffect } from 'react';
import { Line, Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

import api from '../utils/api';
import { Box, Typography, Grid, Paper, CircularProgress } from '@mui/material';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const styles = {
  container: {
    padding: '20px',
    backgroundColor: '#f8f9fa',
    minHeight: '100vh',
  },
  header: {
    marginBottom: '30px',
  },
  title: {
    fontSize: '36px',
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '10px',
  },
  subtitle: {
    fontSize: '18px',
    color: '#666',
    marginBottom: '30px',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '20px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    height: '100%',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    },
  },
  chartContainer: {
    height: '300px',
    marginTop: '20px',
  },
  statsGrid: {
    marginBottom: '30px',
  },
  statCard: {
    backgroundColor: '#fff',
    borderRadius: '15px',
    padding: '20px',
    textAlign: 'center',
    boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
    transition: 'transform 0.3s, box-shadow 0.3s',
    '&:hover': {
      transform: 'translateY(-5px)',
      boxShadow: '0 8px 30px rgba(0,0,0,0.2)',
    },
  },
  statValue: {
    fontSize: '28px',
    fontWeight: 'bold',
    color: '#28a745',
    marginBottom: '5px',
  },
  statLabel: {
    fontSize: '16px',
    color: '#666',
  },
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
  },
  error: {
    color: '#dc3545',
    textAlign: 'center',
    padding: '20px',
    fontSize: '18px',
  },
};

const Analytics = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [analyticsData, setAnalyticsData] = useState({
    cropYield: [],
    financialData: [],
    stats: {
      totalRevenue: 0,
      totalExpenses: 0,
      netProfit: 0,
      cropYieldEfficiency: 0,
    },
  });

  useEffect(() => {
    const fetchAnalyticsData = async () => {
      try {
        const token = localStorage.getItem('token');
        const response = await api.get('/analytics');
        setAnalyticsData(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch analytics data. Please try again later.');
        setLoading(false);
      }
    };

    fetchAnalyticsData();
    const interval = setInterval(fetchAnalyticsData, 300000);
    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return (
      <Box sx={styles.loading}>
        <CircularProgress size={60} />
      </Box>
    );
  }

  if (error) {
    return <Box sx={styles.error}>{error}</Box>;
  }

  const cropData = {
    labels: analyticsData.cropYield.map(item => item.month),
    datasets: [
      {
        label: 'Crop Yield',
        data: analyticsData.cropYield.map(item => item.yield),
        fill: false,
        borderColor: '#28a745',
        tension: 0.1,
        borderWidth: 2,
      },
    ],
  };

  const financialData = {
    labels: analyticsData.financialData.map(item => item.month),
    datasets: [
      {
        label: 'Revenue',
        data: analyticsData.financialData.map(item => item.revenue),
        backgroundColor: '#28a745',
        borderRadius: 5,
      },
      {
        label: 'Expenses',
        data: analyticsData.financialData.map(item => item.expenses),
        backgroundColor: '#dc3545',
        borderRadius: 5,
      },
    ],
  };

  return (
    <Box sx={styles.container}>
      <Box sx={styles.header}>
        <Typography variant="h4" sx={styles.title}>
          Farm Analytics Dashboard
        </Typography>
        <Typography variant="h6" sx={styles.subtitle}>
          Track your farm's performance and make data-driven decisions
        </Typography>
      </Box>

      <Grid container spacing={3} sx={styles.statsGrid}>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={styles.statCard}>
            <Typography variant="h4" sx={styles.statValue}>
              ${analyticsData.stats.totalRevenue.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={styles.statLabel}>
              Total Revenue
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={styles.statCard}>
            <Typography variant="h4" sx={styles.statValue}>
              ${analyticsData.stats.totalExpenses.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={styles.statLabel}>
              Total Expenses
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={styles.statCard}>
            <Typography variant="h4" sx={styles.statValue}>
              ${analyticsData.stats.netProfit.toLocaleString()}
            </Typography>
            <Typography variant="body1" sx={styles.statLabel}>
              Net Profit
            </Typography>
          </Paper>
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <Paper sx={styles.statCard}>
            <Typography variant="h4" sx={styles.statValue}>
              {analyticsData.stats.cropYieldEfficiency}%
            </Typography>
            <Typography variant="body1" sx={styles.statLabel}>
              Crop Yield Efficiency
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.card}>
            <Typography variant="h6" gutterBottom>
              Crop Yield Trends
            </Typography>
            <Box sx={styles.chartContainer}>
              <Line 
                data={cropData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }} 
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={styles.card}>
            <Typography variant="h6" gutterBottom>
              Financial Overview
            </Typography>
            <Box sx={styles.chartContainer}>
              <Bar 
                data={financialData} 
                options={{ 
                  maintainAspectRatio: false,
                  plugins: {
                    legend: {
                      position: 'top',
                    },
                  },
                  scales: {
                    y: {
                      beginAtZero: true,
                      grid: {
                        color: 'rgba(0, 0, 0, 0.1)',
                      },
                    },
                    x: {
                      grid: {
                        display: false,
                      },
                    },
                  },
                }} 
              />
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Analytics; 
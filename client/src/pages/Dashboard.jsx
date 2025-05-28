import React, { useEffect, useState } from 'react';
import { Box, Grid, Typography, Card, CardContent, CircularProgress } from '@mui/material';
import { styled } from '@mui/material/styles';
import CropIcon from '@mui/icons-material/Grass';
import LivestockIcon from '@mui/icons-material/Pets';
import FinanceIcon from '@mui/icons-material/AttachMoney';
import WeatherIcon from '@mui/icons-material/Cloud';
import InventoryIcon from '@mui/icons-material/Inventory';


const StyledCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: '12px',
  boxShadow: '0px 4px 12px rgba(0, 0, 0, 0.1)',
  transition: 'transform 0.3s ease, box-shadow 0.3s ease',
  '&:hover': {
    transform: 'translateY(-8px)',
    boxShadow: '0px 8px 16px rgba(0, 0, 0, 0.15)',
  },
}));

const IconWrapper = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  padding: theme.spacing(2.5),
  backgroundColor: theme.palette.primary.main,
  borderRadius: '50%',
  marginBottom: theme.spacing(3),
  width: '70px',
  height: '70px',
}));

const Dashboard = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    crops: 0,
    livestock: 0,
    inventory: 0,
    weather: null,
    finance: null,
  });
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const token = localStorage.getItem('token');
      console.log("Token:", token);
        if (!token) {
          throw new Error('No authentication token found');
        }

        const headers = {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        };

        const [cropsRes, livestockRes, inventoryRes, weatherRes, financeRes] = await Promise.all([
          fetch('/api/crops/', { headers, method: 'GET' }),
          fetch('/api/batches/', { headers, method: 'GET' }),
          fetch('/api/inventory/', { headers, method: 'GET' }),
          fetch('/api/weather/current', { headers, method: 'GET' }),
          fetch('/api/finance-analytics/summary', { headers, method: 'GET' }),
        ]);

        if (!cropsRes.ok || !livestockRes.ok || !inventoryRes.ok || !weatherRes.ok || !financeRes.ok) {
          throw new Error('Failed to fetch data');
        }

        const crops = await cropsRes.json();
        const livestock = await livestockRes.json();
        const inventory = await inventoryRes.json();
        const weather = await weatherRes.json();
        const finance = await financeRes.json();

        console.log("Data:", crops, livestock, inventory, weather, finance);
        setData({
          crops: crops.length,
          livestock: livestock.length,
          inventory: inventory.length,
          weather,
          finance: finance.data || null,
        });
      } catch (err) {
        console.error('Error fetching dashboard data:', err);
        setError(err.message);
      }
      setLoading(false);
    };
    fetchData();
  }, []);

  if (loading) {
    return <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: 300 }}><CircularProgress /></Box>;
  }

  const dashboardItems = [
    {
      title: 'Crops',
      icon: <CropIcon sx={{ fontSize: 40, color: 'white' }} />,
      value: `${data.crops} types`,
      description: 'Total crop types managed',
      path: '/crops',
    },
    {
      title: 'Livestock',
      icon: <LivestockIcon sx={{ fontSize: 40, color: 'white' }} />,
      value: `${data.livestock} batches`,
      description: 'Total livestock batches',
      path: '/livestocks',
    },
    {
      title: 'Inventory',
      icon: <InventoryIcon sx={{ fontSize: 40, color: 'white' }} />,
      value: `${data.inventory} items`,
      description: 'Inventory items tracked',
      path: '/inventory',
    },
    {
      title: 'Weather',
      icon: <WeatherIcon sx={{ fontSize: 40, color: 'white' }} />,
      value: data.weather && data.weather.main ? `${data.weather.main.temp}°C, ${data.weather.weather[0].main}` : 'N/A',
      description: data.weather && data.weather.name ? `Current weather in ${data.weather.name}` : 'Weather info',
      path: '/weather',
    },
    {
      title: 'Finance',
      icon: <FinanceIcon sx={{ fontSize: 40, color: 'white' }} />,
      value: data.finance ? `Income: $${data.finance.income}, Expenses: $${data.finance.expenses}` : 'N/A',
      description: data.finance ? `Profit: $${data.finance.profit}` : 'Finance summary',
      path: '/finance',
    },
  ];

  return (
    <Box sx={{ flexGrow: 1, p: 4, backgroundColor: '#f9f9f9' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: 600, color: '#2E3B55' }}>
        Farm Dashboard
      </Typography>
      <Typography variant="subtitle1" color="text.secondary" gutterBottom sx={{ mb: 4 }}>
        Welcome to your farm management dashboard. Here is a summary of your farm.
      </Typography>
      <Grid container spacing={4} sx={{ mt: 1 }}>
        {dashboardItems.map((item, index) => (
          <Grid item xs={12} sm={6} md={4} key={index}>
            <StyledCard>
              <CardContent sx={{ textAlign: 'center', p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                  <IconWrapper>
                    {item.icon}
                  </IconWrapper>
                </Box>
                <Typography variant="h6" component="h2" gutterBottom sx={{ fontWeight: 500 }}>
                  {item.title}
                </Typography>
                {item.value && (
                  <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
                    {item.value}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  {item.description}
                </Typography>
              </CardContent>
            </StyledCard>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default Dashboard;
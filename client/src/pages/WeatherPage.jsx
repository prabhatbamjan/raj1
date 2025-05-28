import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Container,
  Grid,
  Paper,
  Typography,
  CircularProgress,
  Box,
  TextField,
  Button,
  Card,
  CardContent,
  Divider,
  Chip,
  IconButton,
  Fade,
  useMediaQuery,
  useTheme
} from '@mui/material';
import {
  WiDaySunny,
  WiRain,
  WiCloudy,
  WiSnow,
  WiThunderstorm,
  WiHumidity,
  WiStrongWind,
  WiBarometer,
  WiSunrise,
  WiSunset,
  WiDayFog
} from 'react-icons/wi';
import { MdMyLocation, MdFavorite, MdFavoriteBorder } from 'react-icons/md';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import SystemLayout from '../components/SystemLayout';

const WeatherPage = () => {
  const theme = useTheme();
  const isSmallScreen = useMediaQuery(theme.breakpoints.down('md'));
  
  const [city, setCity] = useState('Kathmandu');
  const [weatherData, setWeatherData] = useState(null);
  const [forecast, setForecast] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [favorites, setFavorites] = useState(() => {
    const saved = localStorage.getItem('favoriteLocations');
    return saved ? JSON.parse(saved) : [];
  });
  const [hourlyView, setHourlyView] = useState(true);
  const [activeTab, setActiveTab] = useState('current');
  
  const API_KEY = "4808e2da04fa23aedfd069655162958a";

  // Save favorites to localStorage
  useEffect(() => {
    localStorage.setItem('favoriteLocations', JSON.stringify(favorites));
  }, [favorites]);

  const fetchWeatherData = async (cityName = city) => {
    if (!API_KEY) {
      setError("❌ Missing API key! Check your .env file.");
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await axios.get(
        `https://api.openweathermap.org/data/2.5/weather?q=${cityName}&appid=${API_KEY}&units=metric`
      );
      const forecastResponse = await axios.get(
        `https://api.openweathermap.org/data/2.5/forecast?q=${cityName}&appid=${API_KEY}&units=metric`
      );

      setWeatherData(response.data);
      
      // Process forecast data to group by days
      const forecastList = forecastResponse.data.list;
      setForecast(forecastList);
      
      // Update city state if search was successful
      setCity(cityName);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to fetch weather data");
    } finally {
      setLoading(false);
    }
  };

  const getUserLocation = () => {
    if (navigator.geolocation) {
      setLoading(true);
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await axios.get(
              `https://api.openweathermap.org/data/2.5/weather?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
            );
            setCity(response.data.name);
            fetchWeatherData(response.data.name);
          } catch (error) {
            setError("Failed to get location data");
            setLoading(false);
          }
        },
        () => {
          setError("Location permission denied");
          setLoading(false);
        }
      );
    } else {
      setError("Geolocation is not supported by this browser");
    }
  };

  useEffect(() => {
    fetchWeatherData();
  }, []);

  const getWeatherIcon = (condition, size = 64) => {
    switch (condition) {
      case 'Clear':
        return <WiDaySunny size={size} />;
      case 'Rain':
      case 'Drizzle':
        return <WiRain size={size} />;
      case 'Clouds':
        return <WiCloudy size={size} />;
      case 'Snow':
        return <WiSnow size={size} />;
      case 'Thunderstorm':
        return <WiThunderstorm size={size} />;
      case 'Mist':
      case 'Fog':
      case 'Haze':
        return <WiDayFog size={size} />;
      default:
        return <WiDaySunny size={size} />;
    }
  };

  const predictRain = () => {
    if (!weatherData) return null;
    const condition = weatherData.weather[0].main;
    const humidity = weatherData.main.humidity;
    const pressure = weatherData.main.pressure;
    const clouds = weatherData.clouds.all;

    if (condition === "Rain" || condition === "Thunderstorm") {
      return { prediction: "Currently Raining ☔", color: "#f44336", confidence: 100 };
    } else if (humidity > 80 && clouds > 70) {
      return { prediction: "High Chance of Rain ☔", color: "#ff9800", confidence: 80 };
    } else if (humidity > 70 && clouds > 50 && pressure < 1010) {
      return { prediction: "Moderate Chance of Rain ☁️", color: "#2196f3", confidence: 60 };
    } else {
      return { prediction: "Low Chance of Rain 🌤️", color: "#4caf50", confidence: 20 };
    }
  };

  const toggleFavorite = () => {
    if (favorites.includes(city)) {
      setFavorites(favorites.filter(fav => fav !== city));
    } else {
      setFavorites([...favorites, city]);
    }
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const formatDate = (timestamp) => {
    return new Date(timestamp * 1000).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' });
  };

  // Process forecast data for charts
  const getDailyForecast = () => {
    const dailyData = {};
    
    forecast.forEach(item => {
      const date = new Date(item.dt * 1000).toLocaleDateString();
      
      if (!dailyData[date]) {
        dailyData[date] = {
          date: formatDate(item.dt),
          minTemp: item.main.temp_min,
          maxTemp: item.main.temp_max,
          humidity: item.main.humidity,
          conditions: [item.weather[0].main],
          icon: item.weather[0].main
        };
      } else {
        dailyData[date].minTemp = Math.min(dailyData[date].minTemp, item.main.temp_min);
        dailyData[date].maxTemp = Math.max(dailyData[date].maxTemp, item.main.temp_max);
        dailyData[date].humidity = (dailyData[date].humidity + item.main.humidity) / 2;
        if (!dailyData[date].conditions.includes(item.weather[0].main)) {
          dailyData[date].conditions.push(item.weather[0].main);
        }
      }
    });
    
    return Object.values(dailyData);
  };

  const getHourlyForecast = () => {
    return forecast.slice(0, 8).map(item => ({
      time: formatTime(item.dt),
      fullTime: new Date(item.dt * 1000).toLocaleTimeString(),
      temperature: Math.round(item.main.temp),
      humidity: item.main.humidity,
      condition: item.weather[0].main,
      icon: item.weather[0].main
    }));
  };

  const getAirQualityIndex = () => {
    // Simulating AQI since it's not available in the free OpenWeather API
    if (!weatherData) return null;
    
    // Using weather conditions to simulate AQI
    const condition = weatherData.weather[0].main;
    const windSpeed = weatherData.wind.speed;
    
    if (condition === 'Clear' && windSpeed > 3) {
      return { value: Math.floor(Math.random() * 30) + 20, level: 'Good', color: '#4caf50' };
    } else if (condition === 'Clouds') {
      return { value: Math.floor(Math.random() * 30) + 50, level: 'Moderate', color: '#ffeb3b' };
    } else if (condition === 'Rain' || condition === 'Thunderstorm') {
      return { value: Math.floor(Math.random() * 50) + 100, level: 'Unhealthy', color: '#f44336' };
    } else {
      return { value: Math.floor(Math.random() * 40) + 30, level: 'Fair', color: '#8bc34a' };
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="80vh">
        <CircularProgress color="primary" size={60} />
      </Box>
    );
  }

  const rainPrediction = predictRain();
  const aqi = getAirQualityIndex();
  const dailyForecast = getDailyForecast();
  const hourlyForecast = getHourlyForecast();

  const renderTemperatureChart = () => (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart
        data={hourlyView ? hourlyForecast : dailyForecast}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey={hourlyView ? "time" : "date"} stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 10, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`${value}°C`, 'Temperature']}
          labelFormatter={(label) => hourlyView ? `Time: ${label}` : `Date: ${label}`}
        />
        <Legend />
        <defs>
          <linearGradient id="colorTemp" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2196F3" stopOpacity={0.8}/>
            <stop offset="95%" stopColor="#2196F3" stopOpacity={0.1}/>
          </linearGradient>
        </defs>
        {hourlyView ? (
          <Area 
            type="monotone" 
            dataKey="temperature" 
            stroke="#2196F3" 
            fillOpacity={1} 
            fill="url(#colorTemp)" 
            name="Temperature (°C)" 
          />
        ) : (
          <>
            <Area
              type="monotone"
              dataKey="maxTemp"
              stroke="#ff7300"
              fill="url(#colorTemp)"
              name="Max Temp (°C)"
            />
            <Area
              type="monotone"
              dataKey="minTemp"
              stroke="#1769aa"
              fill="none"
              name="Min Temp (°C)"
            />
          </>
        )}
      </AreaChart>
    </ResponsiveContainer>
  );

  const renderHumidityChart = () => (
    <ResponsiveContainer width="100%" height={250}>
      <BarChart
        data={hourlyView ? hourlyForecast : dailyForecast}
        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
      >
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.1)" />
        <XAxis dataKey={hourlyView ? "time" : "date"} stroke="#666" />
        <YAxis stroke="#666" />
        <Tooltip
          contentStyle={{ backgroundColor: 'rgba(255, 255, 255, 0.9)', borderRadius: 10, border: 'none', boxShadow: '0 2px 10px rgba(0,0,0,0.1)' }}
          formatter={(value) => [`${value}%`, 'Humidity']}
        />
        <Legend />
        <Bar dataKey="humidity" fill="#4CAF50" name="Humidity (%)" />
      </BarChart>
    </ResponsiveContainer>
  );

  const renderConditionIcons = () => (
    <Box display="flex" justifyContent="space-evenly" mt={2} flexWrap="wrap">
      {(hourlyView ? hourlyForecast : dailyForecast).map((item, index) => (
        <Box key={index} textAlign="center" mx={1} my={1}>
          <Typography variant="body2">{hourlyView ? item.time : item.date}</Typography>
          {getWeatherIcon(item.icon, 36)}
          <Typography variant="caption" display="block">
            {hourlyView ? `${item.temperature}°C` : `${Math.round(item.minTemp)}°-${Math.round(item.maxTemp)}°C`}
          </Typography>
        </Box>
      ))}
    </Box>
  );

  const renderWeatherMetrics = () => (
    <Grid container spacing={2} mt={2}>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <WiHumidity size={36} color={theme.palette.primary.main} />
          <Typography variant="body2" color="text.secondary">Humidity</Typography>
          <Typography variant="h6">{weatherData?.main.humidity}%</Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <WiStrongWind size={36} color={theme.palette.warning.main} />
          <Typography variant="body2" color="text.secondary">Wind</Typography>
          <Typography variant="h6">{weatherData?.wind.speed} m/s</Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <WiBarometer size={36} color={theme.palette.success.main} />
          <Typography variant="body2" color="text.secondary">Pressure</Typography>
          <Typography variant="h6">{weatherData?.main.pressure} hPa</Typography>
        </Paper>
      </Grid>
      <Grid item xs={6} sm={3}>
        <Paper elevation={0} sx={{ 
          p: 2, 
          textAlign: 'center', 
          borderRadius: 2,
          border: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper
        }}>
          <Box sx={{ height: 36, display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
            <WiCloudy size={28} color={theme.palette.text.secondary} />
          </Box>
          <Typography variant="body2" color="text.secondary">Clouds</Typography>
          <Typography variant="h6">{weatherData?.clouds.all}%</Typography>
        </Paper>
      </Grid>
    </Grid>
  );

  const renderAirQualityGraph = () => (
    <ResponsiveContainer width="100%" height={180}>
      <PieChart>
        <Pie
          data={[
            { name: 'AQI', value: aqi.value },
            { name: 'Remaining', value: 300 - aqi.value },
          ]}
          cx="50%"
          cy="50%"
          innerRadius={60}
          outerRadius={80}
          startAngle={180}
          endAngle={0}
          paddingAngle={0}
          dataKey="value"
        >
          <Cell key="cell-0" fill={aqi.color} />
          <Cell key="cell-1" fill="#f5f5f5" />
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );

  const renderSunriseSunset = () => {
    if (!weatherData || !weatherData.sys) return null;
    
    const sunriseTime = new Date(weatherData.sys.sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    const sunsetTime = new Date(weatherData.sys.sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    
    return (
      <Box sx={{ display: 'flex', justifyContent: 'space-around', mt: 2, mb: 1 }}>
        <Box textAlign="center">
          <WiSunrise size={36} color="#FF9800" />
          <Typography variant="body2">Sunrise</Typography>
          <Typography variant="h6">{sunriseTime}</Typography>
        </Box>
        <Box textAlign="center">
          <WiSunset size={36} color="#FF9800" />
          <Typography variant="body2">Sunset</Typography>
          <Typography variant="h6">{sunsetTime}</Typography>
        </Box>
      </Box>
    );
  };

  const renderCurrentWeather = () => (
    <Grid container spacing={3}>
      <Grid item xs={12} md={4}>
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              borderRadius: 2,
              background: `linear-gradient(135deg, ${theme.palette.primary.main} 0%, ${theme.palette.primary.dark} 100%)`,
              color: 'white',
              position: 'relative',
              overflow: 'hidden',
              border: `1px solid ${theme.palette.primary.main}`,
            }}
          >
            <Box 
              sx={{ 
                position: 'absolute', 
                top: 16, 
                right: 16, 
                zIndex: 2 
              }}
            >
              <IconButton 
                color="inherit" 
                onClick={toggleFavorite}
                sx={{ 
                  backgroundColor: 'rgba(255,255,255,0.2)', 
                  '&:hover': { 
                    backgroundColor: 'rgba(255,255,255,0.3)' 
                  } 
                }}
              >
                {favorites.includes(city) ? <MdFavorite /> : <MdFavoriteBorder />}
              </IconButton>
            </Box>
            
            <Typography variant="h5" gutterBottom sx={{ fontWeight: 500 }}>
              {weatherData?.name}, {weatherData?.sys.country}
            </Typography>
            
            <Box sx={{ position: 'relative', my: 2 }}>
              {weatherData && getWeatherIcon(weatherData.weather[0].main, 96)}
              <Typography variant="h2" sx={{ fontWeight: 600 }}>
                {Math.round(weatherData?.main.temp)}°C
              </Typography>
            </Box>
            
            <Typography variant="h6" gutterBottom sx={{ textTransform: 'capitalize' }}>
              {weatherData?.weather[0].description}
            </Typography>
            
            <Typography variant="body2" sx={{ mt: 1, opacity: 0.8 }}>
              Feels Like: {Math.round(weatherData?.main.feels_like)}°C
            </Typography>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%', mt: 3 }}>
              <Typography variant="body1">
                H: {Math.round(weatherData?.main.temp_max)}°C
              </Typography>
              <Typography variant="body1">
                L: {Math.round(weatherData?.main.temp_min)}°C
              </Typography>
            </Box>
            
            {renderSunriseSunset()}
          </Paper>
        </Fade>
      </Grid>
      
      <Grid item xs={12} md={4}>
        <Fade in={true} timeout={1000}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            height: '100%', 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Weather Analysis & Prediction
            </Typography>
            
            <Box 
              sx={{ 
                py: 2, 
                px: 3, 
                borderRadius: 2, 
                backgroundColor: `${rainPrediction?.color}20`, 
                mb: 3,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
              }}
            >
              <Typography sx={{ fontSize: '1.1rem', color: rainPrediction?.color, fontWeight: 'bold' }}>
                {rainPrediction?.prediction}
              </Typography>
              <Chip 
                label={`${rainPrediction?.confidence}%`} 
                size="small" 
                sx={{ backgroundColor: rainPrediction?.color, color: 'white' }}
              />
            </Box>
            
            {renderWeatherMetrics()}
          </Paper>
        </Fade>
      </Grid>

      <Grid item xs={12} md={4}>
        <Fade in={true} timeout={1200}>
          <Paper elevation={0} sx={{ 
            p: 3, 
            height: '100%', 
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundColor: theme.palette.background.paper
          }}>
            <Typography variant="h6" gutterBottom sx={{ fontWeight: 500 }}>
              Air Quality
            </Typography>
            
            <Box sx={{ textAlign: 'center', mt: 1 }}>
              {renderAirQualityGraph()}
              <Typography 
                variant="h4" 
                sx={{ 
                  fontWeight: 'bold', 
                  color: aqi.color,
                  mt: 2
                }}
              >
                {aqi.value}
              </Typography>
              <Typography 
                variant="body1" 
                gutterBottom 
                sx={{ 
                  color: aqi.color, 
                  fontWeight: 500,
                  mb: 2
                }}
              >
                {aqi.level}
              </Typography>
              <Divider sx={{ my: 2 }} />
              <Typography variant="body2" color="text.secondary">
                {aqi.level === 'Good' ? 
                  'Air quality is considered satisfactory, and air pollution poses little or no risk.' : 
                aqi.level === 'Moderate' ? 
                  'Air quality is acceptable; however, pollution may cause moderate health concerns for a small number of people.' :
                  'Air quality is unhealthy. Everyone may begin to experience some adverse health effects.'
                }
              </Typography>
            </Box>
          </Paper>
        </Fade>
      </Grid>
    </Grid>
  );

  return (
    <SystemLayout
      title="Weather Dashboard"
      breadcrumbs={[
        { text: 'Home', path: '/' },
        { text: 'Weather' }
      ]}
      actions={
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<MdMyLocation />}
          onClick={getUserLocation}
          sx={{ 
            borderRadius: 2,
            borderColor: theme.palette.primary.main,
            color: theme.palette.primary.main,
            '&:hover': {
              borderColor: theme.palette.primary.dark,
              backgroundColor: 'rgba(25, 118, 210, 0.04)'
            }
          }}
        >
          Current Location
        </Button>
      }
    >
      {error ? (
        <Typography color="error" variant="h6" align="center" sx={{ 
          mt: 4, 
          p: 2, 
          borderRadius: 2, 
          backgroundColor: theme.palette.error.light,
          color: theme.palette.error.contrastText
        }}>
          {error}
        </Typography>
      ) : (
        <Grid container spacing={3}>
          {(!isSmallScreen || activeTab === 'current') && renderCurrentWeather()}
          
          {(!isSmallScreen || activeTab === 'forecast') && (
            <Grid item xs={12}>
              <Fade in={true} timeout={1400}>
                <Paper elevation={0} sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${theme.palette.divider}`,
                  backgroundColor: theme.palette.background.paper
                }}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                    <Typography variant="h6" sx={{ fontWeight: 500 }}>
                      Weather Forecast
                    </Typography>
                    <Box>
                      <Button 
                        variant={hourlyView ? "contained" : "outlined"} 
                        color="primary" 
                        size="small" 
                        onClick={() => setHourlyView(true)}
                        sx={{ mr: 1, borderRadius: 2 }}
                      >
                        Hourly
                      </Button>
                      <Button 
                        variant={!hourlyView ? "contained" : "outlined"} 
                        color="primary" 
                        size="small" 
                        onClick={() => setHourlyView(false)}
                        sx={{ borderRadius: 2 }}
                      >
                        Daily
                      </Button>
                    </Box>
                  </Box>
                  
                  {renderConditionIcons()}
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500 }}>
                    Temperature Forecast
                  </Typography>
                  {renderTemperatureChart()}
                  
                  <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 500, mt: 4 }}>
                    Humidity Forecast
                  </Typography>
                  {renderHumidityChart()}
                </Paper>
              </Fade>
            </Grid>
          )}
        </Grid>
      )}
    </SystemLayout>
  );
};

export default WeatherPage;
const axios = require('axios');

// Get current weather
exports.getCurrentWeather = async (req, res) => {
  try {
    // const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
    const API_KEY = "4808e2da04fa23aedfd069655162958a";
    const city = req.query.city || 'Nepal'; 
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${API_KEY}&units=metric`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching current weather:', error);
    res.status(500).json({ message: 'Failed to fetch current weather data' });
  }
};

// Get weather forecast
exports.getWeatherForecast = async (req, res) => {
  try {
    // const API_KEY = import.meta.env.VITE_WEATHER_API_KEY; 
    const city = req.query.city || 'Nepal'; 
    const response = await axios.get(
      `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${API_KEY}&units=metric`
    );
    res.status(200).json(response.data);
  } catch (error) {
    console.error('Error fetching weather forecast:', error);
    res.status(500).json({ message: 'Failed to fetch weather forecast data' });
  }
}; 
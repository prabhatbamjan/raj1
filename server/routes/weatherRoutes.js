const express = require('express');
const router = express.Router();
const weatherController = require('../controllers/weatherController');

// Get current weather
router.get('/current', weatherController.getCurrentWeather);

// Get weather forecast
router.get('/forecast', weatherController.getWeatherForecast);

module.exports = router; 
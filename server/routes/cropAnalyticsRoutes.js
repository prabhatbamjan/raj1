const express = require("express");
const router = express.Router();
const cropAnalyticsController = require("../controllers/cropAnalyticsController");

// Fetch all crop analytics data
router.get("/", cropAnalyticsController.getCropAnalytics);

module.exports = router;
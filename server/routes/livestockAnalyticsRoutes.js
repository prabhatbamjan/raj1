const express = require('express');
const router = express.Router();
const livestockAnalyticsController = require('../controllers/livestockAnalyticsController');

// Get all batches
router.get('/batches', livestockAnalyticsController.getAllBatches);

// Get all medical records
router.get('/medical-records', livestockAnalyticsController.getAllMedicalRecords);

// Get all death records
router.get('/death-records', livestockAnalyticsController.getAllDeathRecords);

// Get all harvest records
router.get('/harvest-records', livestockAnalyticsController.getAllHarvestRecords);

// Get all sale records
router.get('/sale-records', livestockAnalyticsController.getAllSaleRecords);

module.exports = router;

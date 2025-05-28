const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const livestockController = require('../controllers/livestockController');

// Existing routes
router.get('/', auth, livestockController.getLivestocks);
router.post('/', auth, livestockController.createLivestock);
router.get('/:id', auth, livestockController.getLivestock);
router.put('/:id', auth, livestockController.updateLivestock);
router.delete('/:id', auth, livestockController.deleteLivestock);

// Medical record routes
router.get('/:id/medical-records', auth, livestockController.getMedicalRecords);
router.post('/:id/medical-records', auth, livestockController.addMedicalRecord);
router.put('/:id/medical-records/:recordId', auth, livestockController.updateMedicalRecord);
router.delete('/:id/medical-records/:recordId', auth, livestockController.deleteMedicalRecord);

module.exports = router; 
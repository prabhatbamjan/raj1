const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const cropController = require('../controllers/cropController');

// Existing routes
router.get('/', auth, cropController.getCrops);
router.post('/', auth, cropController.createCrop);
router.get('/:id', auth, cropController.getCrop);
router.put('/:id', auth, cropController.updateCrop);
router.delete('/:id', auth, cropController.deleteCrop);

// Medical record routes
router.get('/:id/medical-records', auth, cropController.getMedicalRecords);
router.post('/:id/medical-records', auth, cropController.addMedicalRecord);
router.put('/:id/medical-records/:recordId', auth, cropController.updateMedicalRecord);
router.delete('/:id/medical-records/:recordId', auth, cropController.deleteMedicalRecord);

module.exports = router; 
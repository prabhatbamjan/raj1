const express = require('express');
const { addCrop, getAllCrops, getCropById, updateCrop, deleteCrop } = require('../controllers/cropController');

const router = express.Router();


router.post('/add', addCrop);         // Add a crop
router.get('/', getAllCrops);      // Get all crops
router.get('/:id', getCropById);   // Get crop by ID
router.put('/:id', updateCrop);    // Update crop
router.delete('/:id', deleteCrop); // Delete crop

module.exports = router;

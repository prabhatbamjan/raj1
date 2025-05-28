const express = require('express');
const router = express.Router();
const pestPesticideController = require('../controllers/pestPesticideController');

router.get('/get', pestPesticideController.getAllEntries);

// Search entries
router.get('/search', pestPesticideController.searchEntries);

// Get a single entry
router.get('/:id', pestPesticideController.getEntry);

// Create a new entry
router.post('/add-pesticide', pestPesticideController.create);

// Update an entry
router.put('/update-pesticide/:id', pestPesticideController.updateEntry);

// Delete an entry
router.delete('/remove-pesticide/:id', pestPesticideController.deleteEntry);

module.exports = router;

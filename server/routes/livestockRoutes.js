const express = require("express");
const livestockController = require("../controllers/livestockController");

const router = express.Router();

// CRUD Routes
router.get("/:type", livestockController.getRecords); // Get all records by type
router.post("/:type", livestockController.addRecord); // Add a new record
router.put("/:type/:id", livestockController.updateRecord); // Update a record by ID
router.delete("/:type/:id", livestockController.deleteRecord); // Delete a record by ID

module.exports = router;
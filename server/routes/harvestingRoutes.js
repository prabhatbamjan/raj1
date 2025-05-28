const express = require("express");
const {
  addHarvestingRecord,
  getAllHarvestingRecords,
  updateHarvestingRecord,
  deleteHarvestingRecord,
} = require("../controllers/harvestingController");

const router = express.Router();

// Add a new harvesting record
router.post("/", addHarvestingRecord);

// Get all harvesting records
router.get("/", getAllHarvestingRecords);

// Update a harvesting record
router.put("/:id", updateHarvestingRecord);

// Delete a harvesting record
router.delete("/:id", deleteHarvestingRecord);

module.exports = router;

const express = require("express");
const router = express.Router();
const { getRecords, addRecord, updateRecord, deleteRecord } = require("../controllers/livestockMedicalController");

// API Endpoints
router.get("/", getRecords);
router.post("/add", addRecord);
router.put("/:id", updateRecord);
router.delete("/:id", deleteRecord);

module.exports = router;  // ✅ Correct Export

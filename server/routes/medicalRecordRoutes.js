const express = require("express");
const {
  addMedicalRecord,
  getAllMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
} = require("../controllers/medicalRecordController");

const router = express.Router();

// Routes for CRUD operations
router.post("/", addMedicalRecord);
router.get("/", getAllMedicalRecords);
router.put("/:id", updateMedicalRecord);
router.delete("/:id", deleteMedicalRecord);

module.exports = router;

const mongoose = require("mongoose");

const medicalRecordSchema = new mongoose.Schema({
  cropType: { type: String, required: true },
  date: { type: String, required: true },
  symptoms: { type: String, required: true },
  diagnosis: { type: String, required: true },
  treatment: { type: String, required: true },
  notes: { type: String },
});

const MedicalRecord = mongoose.model("MedicalRecord", medicalRecordSchema);

module.exports = MedicalRecord;

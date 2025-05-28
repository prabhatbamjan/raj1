const mongoose = require("mongoose");

const livestockMedicalRecordSchema = new mongoose.Schema({
  recordType: { type: String, required: true },
  parentBatch: { type: String, required: true },
  diseaseType: { type: String },
  dosage: { type: String },
  medication: { type: String },
  recordDate: { type: Date, required: true },
  notes: { type: String }
});

// ✅ Check if the model already exists before compiling
const LivestockMedicalRecord = mongoose.models.LivestockMedicalRecord || mongoose.model("LivestockMedicalRecord", livestockMedicalRecordSchema);

module.exports = LivestockMedicalRecord;  // ✅ Correct Export

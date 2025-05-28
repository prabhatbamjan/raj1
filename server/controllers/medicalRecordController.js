const MedicalRecord = require("../models/MedicalRecord");

// Add a new medical record
const addMedicalRecord = async (req, res) => {
  try {
    const medicalRecord = new MedicalRecord(req.body);
    await medicalRecord.save();
    res.status(201).json(medicalRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all medical records
const getAllMedicalRecords = async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find();
    res.status(200).json(medicalRecords);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a medical record
const updateMedicalRecord = async (req, res) => {
  try {
    const updatedRecord = await MedicalRecord.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Delete a medical record
const deleteMedicalRecord = async (req, res) => {
  try {
    const deletedRecord = await MedicalRecord.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addMedicalRecord,
  getAllMedicalRecords,
  updateMedicalRecord,
  deleteMedicalRecord,
};

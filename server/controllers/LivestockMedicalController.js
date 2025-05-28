const LivestockMedicalRecord = require("../models/LivestockMedicalRecord");

// ✅ Get all records
const getRecords = async (req, res) => {
  try {
    const records = await LivestockMedicalRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Add a record
const addRecord = async (req, res) => {
  try {
    const newRecord = new LivestockMedicalRecord(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update a record
const updateRecord = async (req, res) => {
  try {
    const updatedRecord = await LivestockMedicalRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecord) return res.status(404).json({ error: "Record not found" });
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a record
const deleteRecord = async (req, res) => {
  try {
    await LivestockMedicalRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getRecords, addRecord, updateRecord, deleteRecord };  // ✅ Ensure this is present

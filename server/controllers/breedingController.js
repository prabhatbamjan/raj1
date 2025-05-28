const BreedingRecord = require("../models/BreedingRecord");

// ✅ Fetch all breeding records
const getBreedingRecords = async (req, res) => {
  try {
    const records = await BreedingRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Add a new breeding record
const addBreedingRecord = async (req, res) => {
  try {
    const newRecord = new BreedingRecord(req.body);
    await newRecord.save();
    res.status(201).json(newRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Update an existing record
const updateBreedingRecord = async (req, res) => {
  try {
    const updatedRecord = await BreedingRecord.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedRecord) return res.status(404).json({ error: "Record not found" });
    res.status(200).json(updatedRecord);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// ✅ Delete a record
const deleteBreedingRecord = async (req, res) => {
  try {
    await BreedingRecord.findByIdAndDelete(req.params.id);
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = { getBreedingRecords, addBreedingRecord, updateBreedingRecord, deleteBreedingRecord };

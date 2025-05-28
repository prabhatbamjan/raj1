const HarvestingRecord = require("../models/HarvestingRecord");

// Add a new harvesting record
const addHarvestingRecord = async (req, res) => {
  try {
    const record = new HarvestingRecord(req.body);
    const savedRecord = await record.save();
    res.status(201).json(savedRecord);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

// Get all harvesting records
const getAllHarvestingRecords = async (req, res) => {
  try {
    const records = await HarvestingRecord.find();
    res.status(200).json(records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a harvesting record
const updateHarvestingRecord = async (req, res) => {
  try {
    const updatedRecord = await HarvestingRecord.findByIdAndUpdate(
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

// Delete a harvesting record
const deleteHarvestingRecord = async (req, res) => {
  try {
    const deletedRecord = await HarvestingRecord.findByIdAndDelete(req.params.id);
    if (!deletedRecord) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  addHarvestingRecord,
  getAllHarvestingRecords,
  updateHarvestingRecord,
  deleteHarvestingRecord,
};

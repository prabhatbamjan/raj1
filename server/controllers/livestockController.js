const LivestockRecord = require("../models/livestockModel");

// Get all records by type
exports.getRecords = async (req, res) => {
  const { type } = req.params;
  try {
    const records = await LivestockRecord.find({ recordType: type });
    res.status(200).json(records);
  } catch (error) {
    console.error("Error fetching records:", error);
    res.status(500).json({ error: "Failed to fetch records" });
  }
};

// Add a new record
exports.addRecord = async (req, res) => {
  const { type } = req.params;
  const data = { ...req.body, recordType: type };
  try {
    const record = new LivestockRecord(data);
    await record.save();
    res.status(201).json(record);
  } catch (error) {
    console.error("Error saving record:", error);
    res.status(500).json({ error: "Failed to save record" });
  }
};

// Update a record by ID
exports.updateRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await LivestockRecord.findByIdAndUpdate(id, req.body, { new: true });
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json(record);
  } catch (error) {
    console.error("Error updating record:", error);
    res.status(500).json({ error: "Failed to update record" });
  }
};

// Delete a record by ID
exports.deleteRecord = async (req, res) => {
  const { id } = req.params;
  try {
    const record = await LivestockRecord.findByIdAndDelete(id);
    if (!record) {
      return res.status(404).json({ error: "Record not found" });
    }
    res.status(200).json({ message: "Record deleted successfully" });
  } catch (error) {
    console.error("Error deleting record:", error);
    res.status(500).json({ error: "Failed to delete record" });
  }
};
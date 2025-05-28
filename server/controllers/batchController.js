const Batch = require('../models/Batch');

// ✅ Fetch all batches
const getBatches = async (req, res) => {
    try {
        const batches = await Batch.find();
        res.status(200).json(batches);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Add new batch
const addBatch = async (req, res) => {
    try {
        const { batchName, selectAnimal, raisedFor, startDate } = req.body;

        if (!batchName || !selectAnimal || !raisedFor || !startDate) {
            return res.status(400).json({ error: "All fields are required" });
        }

        const newBatch = new Batch({ batchName, selectAnimal, raisedFor, startDate });
        await newBatch.save();
        res.status(201).json(newBatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Update batch
const updateBatch = async (req, res) => {
    try {
        const updatedBatch = await Batch.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!updatedBatch) {
            return res.status(404).json({ error: "Batch not found" });
        }
        res.status(200).json(updatedBatch);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Delete batch
const deleteBatch = async (req, res) => {
    try {
        await Batch.findByIdAndDelete(req.params.id);
        res.status(200).json({ message: "Batch deleted successfully" });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// ✅ Export all functions
module.exports = { getBatches, addBatch, updateBatch, deleteBatch };

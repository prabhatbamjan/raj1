const PestPesticide = require("../models/pestPesticideModel");

exports.getAllEntries = async (req, res) => {
  try {
    console.log("[GET] Fetching all pest and pesticide entries");
    const entries = await PestPesticide.find();
    console.log(`[GET] Found ${entries.length} entries`);
    res.status(200).json(entries);
  } catch (error) {
    console.error('[ERROR] Fetching all entries:', error);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
};

// Fetch a specific pest or pesticide by ID
exports.getById = async (req, res) => {
  try {
    const item = await PestPesticide.findById(req.params.id);
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(item);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to fetch item" });
  }
};

// Create a new pest or pesticide
exports.create = async (req, res) => {
  try {
    console.log("Request body:", req.body); // Debug log

    const { name, details, control, type } = req.body;

    if (!name || !details || !control || !type) {
      return res.status(400).json({ error: "All fields are required" });
    }

    const newItem = new PestPesticide({ name, details, control, type });
    await newItem.save();
    res.status(201).json(newItem);
  } catch (err) {
    console.error("Error creating pest/pesticide:", err);
    res.status(500).json({ error: "Failed to create item" });
  }
};



// Update a pest or pesticide
exports.update = async (req, res) => {
  try {
    const { name, details, control, type } = req.body;
    const updateData = { name, details, control, type };

    if (req.file) {
      updateData.image = req.file.path; // Update image if a new file is uploaded
    }

    const updatedItem = await PestPesticide.findByIdAndUpdate(req.params.id, updateData, { new: true });
    if (!updatedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json(updatedItem);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update item" });
  }
};

// Delete a pest or pesticide
exports.delete = async (req, res) => {
  try {
    const deletedItem = await PestPesticide.findByIdAndDelete(req.params.id);
    if (!deletedItem) {
      return res.status(404).json({ error: "Item not found" });
    }
    res.status(200).json({ message: "Item deleted successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to delete item" });
  }
};

// Get all pest and pesticide entries
exports.getAllEntries = async (req, res) => {
  try {
    const entries = await PestPesticide.find();
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error fetching pest and pesticide entries:', error);
    res.status(500).json({ message: 'Failed to fetch entries' });
  }
};

// Get a single entry
exports.getEntry = async (req, res) => {
  try {
    const entry = await PestPesticide.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json(entry);
  } catch (error) {
    console.error('Error fetching entry:', error);
    res.status(500).json({ message: 'Failed to fetch entry' });
  }
};

// Create a new entry
exports.createEntry = async (req, res) => {
  try {
    const newEntry = new PestPesticide(req.body);
    const savedEntry = await newEntry.save();
    res.status(201).json(savedEntry);
  } catch (error) {
    console.error('Error creating entry:', error);
    res.status(500).json({ message: 'Failed to create entry' });
  }
};

// Update an entry
exports.updateEntry = async (req, res) => {
  try {
    const updatedEntry = await PestPesticide.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json(updatedEntry);
  } catch (error) {
    console.error('Error updating entry:', error);
    res.status(500).json({ message: 'Failed to update entry' });
  }
};

// Delete an entry
exports.deleteEntry = async (req, res) => {
  try {
    const deletedEntry = await PestPesticide.findByIdAndDelete(req.params.id);
    if (!deletedEntry) {
      return res.status(404).json({ message: 'Entry not found' });
    }
    res.status(200).json({ message: 'Entry deleted successfully' });
  } catch (error) {
    console.error('Error deleting entry:', error);
    res.status(500).json({ message: 'Failed to delete entry' });
  }
};

// Search entries
exports.searchEntries = async (req, res) => {
  try {
    const { query } = req.query;
    const entries = await PestPesticide.find({
      $or: [
        { pestName: { $regex: query, $options: 'i' } },
        { pesticideName: { $regex: query, $options: 'i' } },
        { pestType: { $regex: query, $options: 'i' } },
        { affectedCrops: { $regex: query, $options: 'i' } }
      ]
    });
    res.status(200).json(entries);
  } catch (error) {
    console.error('Error searching entries:', error);
    res.status(500).json({ message: 'Failed to search entries' });
  }
};
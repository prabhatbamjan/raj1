const Crop = require('../models/Crop');

// Add Crop
const addCrop = async (req, res) => {
    try {
        const newCrop = new Crop(req.body);  // ✅ Creates new crop
        await newCrop.save();
        res.status(201).json(newCrop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};


// Get All Crops
const getAllCrops = async (req, res) => {
    try {
        const crops = await Crop.find();
        res.status(200).json(crops);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Get Specific Crop
const getCropById = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        res.status(200).json(crop);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Update Crop
const updateCrop = async (req, res) => {
    try {
        const crop = await Crop.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        res.status(200).json(crop);
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
};

// Delete Crop
const deleteCrop = async (req, res) => {
    try {
        const crop = await Crop.findByIdAndDelete(req.params.id);
        if (!crop) {
            return res.status(404).json({ error: 'Crop not found' });
        }
        res.status(200).json({ message: 'Crop deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

// Medical record functions
const getMedicalRecords = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }
        res.json(crop.medicalRecords || []);
    } catch (err) {
        res.status(500).json({ message: 'Failed to fetch medical records', error: err.message });
    }
};

const addMedicalRecord = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        if (!crop.medicalRecords) {
            crop.medicalRecords = [];
        }

        crop.medicalRecords.push(req.body);
        await crop.save();
        res.json(crop.medicalRecords);
    } catch (err) {
        res.status(500).json({ message: 'Failed to add medical record', error: err.message });
    }
};

const updateMedicalRecord = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        const recordIndex = crop.medicalRecords.findIndex(
            record => record._id.toString() === req.params.recordId
        );

        if (recordIndex === -1) {
            return res.status(404).json({ message: 'Medical record not found' });
        }

        crop.medicalRecords[recordIndex] = {
            ...crop.medicalRecords[recordIndex].toObject(),
            ...req.body,
        };

        await crop.save();
        res.json(crop.medicalRecords);
    } catch (err) {
        res.status(500).json({ message: 'Failed to update medical record', error: err.message });
    }
};

const deleteMedicalRecord = async (req, res) => {
    try {
        const crop = await Crop.findById(req.params.id);
        if (!crop) {
            return res.status(404).json({ message: 'Crop not found' });
        }

        crop.medicalRecords = crop.medicalRecords.filter(
            record => record._id.toString() !== req.params.recordId
        );

        await crop.save();
        res.json(crop.medicalRecords);
    } catch (err) {
        res.status(500).json({ message: 'Failed to delete medical record', error: err.message });
    }
};

module.exports = { addCrop, getAllCrops, getCropById, updateCrop, deleteCrop, getMedicalRecords, addMedicalRecord, updateMedicalRecord, deleteMedicalRecord };

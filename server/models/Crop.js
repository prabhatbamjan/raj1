const mongoose = require('mongoose');

const CropSchema = new mongoose.Schema({
    cropType: { type: String, required: true },
    scientificName: { type: String, required: true },
    planted: { type: Date },
    expectedHarvest: { type: Date },
    location: { type: String },
});

module.exports = mongoose.model('Crop', CropSchema);

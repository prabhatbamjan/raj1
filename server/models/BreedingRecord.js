const mongoose = require("mongoose");

const breedingSchema = new mongoose.Schema({
  parentBatch: { type: String, required: true },
  breedType: { type: String, required: true },
  breedingDate: { type: Date, required: true },
  expectedOffspring: { type: Number, required: true },
  notes: { type: String },
});

// Prevent model overwriting issue
module.exports = mongoose.models.BreedingRecord || mongoose.model("BreedingRecord", breedingSchema);

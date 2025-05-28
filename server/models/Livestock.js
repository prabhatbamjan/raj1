const mongoose = require("mongoose");

const livestockSchema = new mongoose.Schema({
  recordType: { type: String, required: true }, // e.g., "feeding", "egg", "milk", "death", "harvest-sale"
  date: { type: String, required: true },
  livestockType: { type: String },
  feedType: { type: String },
  quantity: { type: Number },
  quality: { type: String },
  cause: { type: String },
  price: { type: Number },
});

module.exports = mongoose.model("LivestockRecord", livestockSchema);
const mongoose = require("mongoose");

const HarvestingRecordSchema = new mongoose.Schema({
  cropType: {
    type: String,
    required: true,
  },
  harvestedDate: {
    type: Date,
    required: true,
  },
  quantity: {
    type: Number,
    required: true,
  },
  notes: {
    type: String,
    default: "",
  },
});

module.exports = mongoose.model("HarvestingRecord", HarvestingRecordSchema);

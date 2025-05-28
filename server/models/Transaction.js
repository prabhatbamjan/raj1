const mongoose = require('mongoose');

// Define the Transaction schema
const transactionSchema = new mongoose.Schema({
  type: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  batch: {
    type: String,
    required: true
  },
  units: {
    type: Number,
    required: true
  },
  costPerUnit: {
    type: Number,
    required: true
  },
  recordDate: {
    type: Date,
    required: true
  },
  notes: {
    type: String
  }
});

// Create and export the model
module.exports = mongoose.model('Transaction', transactionSchema);

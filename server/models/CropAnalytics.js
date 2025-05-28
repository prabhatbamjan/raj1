const mongoose = require('mongoose');

const cropAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  totalYield: {
    type: Number,
    required: true,
    default: 0,
  },
  cropType: {
    type: String,
    required: true,
  },
  area: {
    type: Number,
    required: true,
  },
  efficiency: {
    type: Number,
    required: true,
    default: 0,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

// Update the updatedAt timestamp before saving
cropAnalyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CropAnalytics', cropAnalyticsSchema); 
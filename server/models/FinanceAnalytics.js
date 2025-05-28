const mongoose = require('mongoose');

const financeAnalyticsSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: true,
  },
  totalRevenue: {
    type: Number,
    required: true,
    default: 0,
  },
  totalExpenses: {
    type: Number,
    required: true,
    default: 0,
  },
  netProfit: {
    type: Number,
    required: true,
    default: 0,
  },
  category: {
    type: String,
    required: true,
    enum: ['crops', 'livestock', 'equipment', 'labor', 'other'],
  },
  description: {
    type: String,
    required: true,
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
financeAnalyticsSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('FinanceAnalytics', financeAnalyticsSchema); 
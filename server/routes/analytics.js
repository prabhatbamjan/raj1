const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CropAnalytics = require('../models/CropAnalytics');
const FinanceAnalytics = require('../models/FinanceAnalytics');

// Get analytics data
router.get('/', auth, async (req, res) => {
  try {
    // Get crop analytics data
    const cropAnalytics = await CropAnalytics.find()
      .sort({ date: 1 })
      .limit(12); // Get last 12 months

    // Get finance analytics data
    const financeAnalytics = await FinanceAnalytics.find()
      .sort({ date: 1 })
      .limit(12); // Get last 12 months

    // Format crop yield data
    const cropYield = cropAnalytics.map(item => ({
      month: new Date(item.date).toLocaleString('default', { month: 'short' }),
      yield: item.totalYield
    }));

    // Format financial data
    const financialData = financeAnalytics.map(item => ({
      month: new Date(item.date).toLocaleString('default', { month: 'short' }),
      revenue: item.totalRevenue,
      expenses: item.totalExpenses
    }));

    // Calculate total stats
    const totalRevenue = financeAnalytics.reduce((sum, item) => sum + item.totalRevenue, 0);
    const totalExpenses = financeAnalytics.reduce((sum, item) => sum + item.totalExpenses, 0);
    const netProfit = totalRevenue - totalExpenses;
    const cropYieldEfficiency = cropAnalytics.length > 0 
      ? Math.round((cropAnalytics.reduce((sum, item) => sum + item.totalYield, 0) / cropAnalytics.length) * 100) 
      : 0;

    res.json({
      cropYield,
      financialData,
      stats: {
        totalRevenue,
        totalExpenses,
        netProfit,
        cropYieldEfficiency
      }
    });
  } catch (error) {
    console.error('Error fetching analytics data:', error);
    res.status(500).json({ message: 'Error fetching analytics data' });
  }
});

module.exports = router; 
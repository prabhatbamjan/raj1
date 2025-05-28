const express = require("express");
const router = express.Router();
const auth = require('../middleware/auth');

// Import the controller
const financeAnalyticsController = require("../controllers/financeAnalyticsController");

// Define routes for finance analytics
router.get("/summary", financeAnalyticsController.getSummary);
router.get("/categories", financeAnalyticsController.getCategoryAnalytics);
router.get("/monthly-trends", financeAnalyticsController.getMonthlyTrends);
router.get("/batch-analytics", financeAnalyticsController.getBatchAnalytics);

// For backward compatibility (if you still want to keep the original endpoint)
router.get("/", financeAnalyticsController.getSummary);

// Get financial summary
router.get('/summary', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    
    const summary = {
      totalIncome: transactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0),
      totalExpenses: transactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0),
      balance: transactions.reduce((sum, t) => 
        sum + (t.type === 'income' ? t.amount : -t.amount), 0)
    };

    res.json(summary);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// Get monthly trends
router.get('/trends', auth, async (req, res) => {
  try {
    const transactions = await Transaction.find({ user: req.user.id });
    
    const monthlyData = transactions.reduce((acc, t) => {
      const month = new Date(t.date).toISOString().slice(0, 7);
      if (!acc[month]) {
        acc[month] = { income: 0, expenses: 0 };
      }
      if (t.type === 'income') {
        acc[month].income += t.amount;
      } else {
        acc[month].expenses += t.amount;
      }
      return acc;
    }, {});

    res.json(monthlyData);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;
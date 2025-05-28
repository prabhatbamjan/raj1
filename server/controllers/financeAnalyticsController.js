const Transaction = require("../models/Transaction");

// Finance Analytics Controller
const financeAnalyticsController = {
  // Get summary of income, expenses and profit/loss
  getSummary: async (req, res) => {
    try {
      const { timeFilter, year, month } = req.query;
      const currentDate = new Date();
      let startDate, endDate;

      if (timeFilter === 'yearly') {
        startDate = new Date(year || currentDate.getFullYear(), 0, 1); // January 1st
        endDate = new Date(year || currentDate.getFullYear(), 11, 31); // December 31st
      } else {
        // Monthly view
        const selectedYear = parseInt(year) || currentDate.getFullYear();
        const selectedMonth = parseInt(month) || currentDate.getMonth();
        startDate = new Date(selectedYear, selectedMonth, 1);
        endDate = new Date(selectedYear, selectedMonth + 1, 0);
      }

      // Get financial summary in one aggregation query
      const financialSummary = await Transaction.aggregate([
        {
          $match: {
            recordDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: null,
            totalIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, { $multiply: ["$units", "$costPerUnit"] }, 0]
              }
            },
            totalExpenses: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, { $multiply: ["$units", "$costPerUnit"] }, 0]
              }
            },
            totalTransactions: { $sum: 1 }
          }
        },
        {
          $project: {
            _id: 0,
            income: "$totalIncome",
            expenses: "$totalExpenses",
            profit: { $subtract: ["$totalIncome", "$totalExpenses"] },
            transactionCount: "$totalTransactions"
          }
        }
      ]);

      // Get monthly data for charts
      const monthlyData = await Transaction.aggregate([
        {
          $match: {
            recordDate: { $gte: startDate, $lte: endDate }
          }
        },
        {
          $group: {
            _id: {
              year: { $year: "$recordDate" },
              month: { $month: "$recordDate" },
              type: "$type"
            },
            amount: { $sum: { $multiply: ["$units", "$costPerUnit"] } }
          }
        },
        {
          $group: {
            _id: {
              year: "$_id.year",
              month: "$_id.month"
            },
            income: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "income"] }, "$amount", 0]
              }
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "expense"] }, "$amount", 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            date: {
              $concat: [
                { $toString: "$_id.year" },
                "-",
                { $toString: "$_id.month" }
              ]
            },
            income: 1,
            expenses: 1,
            profit: { $subtract: ["$income", "$expenses"] }
          }
        },
        { $sort: { date: 1 } }
      ]);

      // Calculate growth rates
      const previousPeriod = await Transaction.aggregate([
        {
          $match: {
            recordDate: {
              $gte: new Date(startDate.getTime() - (endDate - startDate)),
              $lt: startDate
            }
          }
        },
        {
          $group: {
            _id: null,
            prevIncome: {
              $sum: {
                $cond: [{ $eq: ["$type", "income"] }, { $multiply: ["$units", "$costPerUnit"] }, 0]
              }
            },
            prevExpenses: {
              $sum: {
                $cond: [{ $eq: ["$type", "expense"] }, { $multiply: ["$units", "$costPerUnit"] }, 0]
              }
            }
          }
        }
      ]);

      const currentData = financialSummary[0] || { income: 0, expenses: 0, profit: 0 };
      const previousData = previousPeriod[0] || { prevIncome: 0, prevExpenses: 0 };

      const incomeGrowth = previousData.prevIncome ? 
        ((currentData.income - previousData.prevIncome) / previousData.prevIncome) * 100 : 0;
      const expenseGrowth = previousData.prevExpenses ? 
        ((currentData.expenses - previousData.prevExpenses) / previousData.prevExpenses) * 100 : 0;
      const profitGrowth = previousData.prevIncome ? 
        ((currentData.profit - (previousData.prevIncome - previousData.prevExpenses)) / 
        (previousData.prevIncome - previousData.prevExpenses)) * 100 : 0;

      res.status(200).json({
        success: true,
        data: {
          ...currentData,
          incomeGrowth: parseFloat(incomeGrowth.toFixed(1)),
          expenseGrowth: parseFloat(expenseGrowth.toFixed(1)),
          profitGrowth: parseFloat(profitGrowth.toFixed(1)),
          monthlyData
        }
      });
    } catch (error) {
      console.error("Error fetching finance summary:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch financial summary",
        details: error.message
      });
    }
  },

  // Get transactions aggregated by category
  getCategoryAnalytics: async (req, res) => {
    try {
      // Parse date range from query parameters
      const startDate = req.query.startDate ? new Date(req.query.startDate) : new Date(0);
      const endDate = req.query.endDate ? new Date(req.query.endDate) : new Date();
      const type = req.query.type || { $in: ["income", "expense"] };

      const categoryData = await Transaction.aggregate([
        {
          $match: {
            recordDate: { $gte: startDate, $lte: endDate },
            type: type
          }
        },
        {
          $group: {
            _id: "$category",
            total: { $sum: { $multiply: ["$units", "$costPerUnit"] } },
            count: { $sum: 1 },
            averagePerTransaction: { $avg: { $multiply: ["$units", "$costPerUnit"] } }
          }
        },
        {
          $project: {
            _id: 0,
            category: "$_id",
            total: 1,
            count: 1,
            averagePerTransaction: 1
          }
        },
        { $sort: { total: -1 } }
      ]);

      res.status(200).json({
        success: true,
        data: categoryData
      });
    } catch (error) {
      console.error("Error fetching category analytics:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch category analytics",
        details: error.message
      });
    }
  },

  // Get monthly finance trends
  getMonthlyTrends: async (req, res) => {
    try {
      // Parse year from query parameters or use current year
      const year = req.query.year ? parseInt(req.query.year) : new Date().getFullYear();
      
      const monthlyTrends = await Transaction.aggregate([
        {
          $match: {
            recordDate: {
              $gte: new Date(`${year}-01-01`),
              $lte: new Date(`${year}-12-31`)
            }
          }
        },
        {
          $group: {
            _id: { month: { $month: "$recordDate" }, type: "$type" },
            total: { $sum: { $multiply: ["$units", "$costPerUnit"] } }
          }
        },
        {
          $group: {
            _id: "$_id.month",
            income: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "income"] }, "$total", 0]
              }
            },
            expenses: {
              $sum: {
                $cond: [{ $eq: ["$_id.type", "expense"] }, "$total", 0]
              }
            }
          }
        },
        {
          $project: {
            _id: 0,
            month: "$_id",
            income: 1,
            expenses: 1,
            profit: { $subtract: ["$income", "$expenses"] }
          }
        },
        { $sort: { month: 1 } }
      ]);

      // Ensure all months are represented (even with no data)
      const completeMonthlyData = [];
      for (let i = 1; i <= 12; i++) {
        const monthData = monthlyTrends.find(item => item.month === i);
        completeMonthlyData.push(
          monthData || { month: i, income: 0, expenses: 0, profit: 0 }
        );
      }

      res.status(200).json({
        success: true,
        year: year,
        data: completeMonthlyData
      });
    } catch (error) {
      console.error("Error fetching monthly trends:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch monthly trends",
        details: error.message
      });
    }
  },

  // Get batch analytics
  getBatchAnalytics: async (req, res) => {
    try {
      const batchAnalytics = await Transaction.aggregate([
        {
          $group: {
            _id: "$batch",
            income: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "income"] },
                  { $multiply: ["$units", "$costPerUnit"] },
                  0
                ]
              }
            },
            expenses: {
              $sum: {
                $cond: [
                  { $eq: ["$type", "expense"] },
                  { $multiply: ["$units", "$costPerUnit"] },
                  0
                ]
              }
            },
            totalUnits: { $sum: "$units" }
          }
        },
        {
          $project: {
            _id: 0,
            batch: "$_id",
            income: 1,
            expenses: 1,
            profit: { $subtract: ["$income", "$expenses"] },
            totalUnits: 1,
            profitPerUnit: {
              $cond: [
                { $gt: ["$totalUnits", 0] },
                { $divide: [{ $subtract: ["$income", "$expenses"] }, "$totalUnits"] },
                0
              ]
            }
          }
        },
        { $sort: { profit: -1 } }
      ]);

      res.status(200).json({
        success: true,
        data: batchAnalytics
      });
    } catch (error) {
      console.error("Error fetching batch analytics:", error);
      res.status(500).json({
        success: false,
        error: "Failed to fetch batch analytics",
        details: error.message
      });
    }
  }
};

module.exports = financeAnalyticsController;
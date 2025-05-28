const express = require('express');
const router = express.Router();
const { 
  createTransaction, 
  getTransactions, 
  deleteTransaction,
  updateTransaction,
  getTransactionById,
  getTransactionsByType,
  getTransactionsByDateRange
} = require('../controllers/transactionController');

// Routes for handling transactions - no auth required
router.post('/', createTransaction);  // Add new transaction
router.get('/', getTransactions);  // Get all transactions
router.get('/:id', getTransactionById);  // Get transaction by ID
router.put('/:id', updateTransaction);  // Update transaction
router.delete('/:id', deleteTransaction);  // Delete a specific transaction
router.get('/type/:type', getTransactionsByType);  // Get transactions by type
router.get('/date-range', getTransactionsByDateRange);  // Get transactions by date range

module.exports = router;

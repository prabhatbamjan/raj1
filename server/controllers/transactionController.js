const Transaction = require('../models/Transaction');

// Get all transactions
exports.getTransactions = async (req, res) => {
  try {
    // Query all transactions (both old and new format)
    const transactions = await Transaction.find().lean();
    
    // Process transactions to handle both old and new formats
    const processedTransactions = transactions.map(transaction => {
      // Handle date field compatibility
      if (transaction.date && !transaction.recordDate) {
        transaction.recordDate = transaction.date;
      } else if (!transaction.recordDate) {
        transaction.recordDate = new Date();
      }
      
      return transaction;
    });
    
    // Sort by recordDate
    processedTransactions.sort((a, b) => new Date(b.recordDate) - new Date(a.recordDate));
    
    res.json(processedTransactions);
  } catch (err) {
    console.error('Error fetching transactions:', err);
    res.status(500).json({ 
      message: 'Error fetching transactions',
      error: err.message 
    });
  }
};

// Create new transaction
exports.createTransaction = async (req, res) => {
  try {
    const transaction = new Transaction(req.body);
    await transaction.save();
    
    res.status(201).json(transaction);
  } catch (err) {
    console.error('Error creating transaction:', err);
    res.status(400).json({ 
      message: 'Error creating transaction',
      error: err.message 
    });
  }
};

// Update transaction
exports.updateTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error('Error updating transaction:', err);
    res.status(400).json({ 
      message: 'Error updating transaction',
      error: err.message 
    });
  }
};

// Delete transaction
exports.deleteTransaction = async (req, res) => {
  try {
    const transaction = await Transaction.findByIdAndDelete(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json({ message: 'Transaction deleted successfully' });
  } catch (err) {
    console.error('Error deleting transaction:', err);
    res.status(500).json({ 
      message: 'Error deleting transaction',
      error: err.message 
    });
  }
};

// Get transaction by ID
exports.getTransactionById = async (req, res) => {
  try {
    const transaction = await Transaction.findById(req.params.id);
    
    if (!transaction) {
      return res.status(404).json({ message: 'Transaction not found' });
    }
    
    res.json(transaction);
  } catch (err) {
    console.error('Error fetching transaction:', err);
    res.status(500).json({ 
      message: 'Error fetching transaction',
      error: err.message 
    });
  }
};

// Get transactions by type
exports.getTransactionsByType = async (req, res) => {
  try {
    const transactions = await Transaction.find({ type: req.params.type })
      .sort({ recordDate: -1 }); // Changed from date to recordDate to match the new schema
    
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions by type:', err);
    res.status(500).json({ 
      message: 'Error fetching transactions by type',
      error: err.message 
    });
  }
};

// Get transactions by date range
exports.getTransactionsByDateRange = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    const transactions = await Transaction.find({
      recordDate: {
        $gte: new Date(startDate),
        $lte: new Date(endDate)
      }
    })
    .sort({ recordDate: -1 });
    
    res.json(transactions);
  } catch (err) {
    console.error('Error fetching transactions by date range:', err);
    res.status(500).json({ 
      message: 'Error fetching transactions by date range',
      error: err.message 
    });
  }
};
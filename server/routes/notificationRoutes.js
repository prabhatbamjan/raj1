const express = require('express');
const router = express.Router();
const notificationController = require('../controllers/notificationController');
const { checkFarmConditions } = require('../services/notificationService');
const auth = require('../middleware/auth');

// Protect all routes with authentication
router.use(auth);

// Get all notifications for the current user
router.get('/', notificationController.getNotifications);

// Mark a specific notification as read
router.post('/:notificationId/read', notificationController.markAsRead);

// Mark all notifications as read
router.post('/read-all', notificationController.markAllAsRead);

// Trigger a check for farm conditions (admin only)
router.post('/check-conditions', async (req, res) => {
  try {
    // In a production app, you would check if the user is an admin
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    const notificationCount = await checkFarmConditions();
    
    res.json({ 
      success: true, 
      message: `Generated ${notificationCount} notifications`, 
      count: notificationCount 
    });
  } catch (error) {
    console.error('Error checking farm conditions:', error);
    res.status(500).json({ 
      success: false, 
      message: 'Failed to check farm conditions', 
      error: error.message 
    });
  }
});

module.exports = router;

const Crop = require('../models/Crop');
const Inventory = require('../models/Inventory');
const User = require('../models/User');
const Notification = require('../models/Notification');
const axios = require('axios');
const { sendNotification } = require('../services/notificationService');

// Helper: Get weather forecast (returns true if rain is expected in next 24h)
async function willRain() {
  try {
    const response = await axios.get('http://localhost:5000/api/weather/forecast');
    const forecast = response.data;
    if (forecast && forecast.list) {
      // Check next 8 intervals (24h if 3h intervals)
      return forecast.list.slice(0, 8).some(item =>
        item.weather && item.weather.some(w => w.main.toLowerCase().includes('rain'))
      );
    }
  } catch (e) {
    console.error('Error fetching weather forecast:', e);
  }
  return false;
}


// Helper function to check for crops ready to harvest
const checkUserCropsForHarvest = async (userId) => {
  try {
    const today = new Date();
    
    // Find crops that are due for harvest (expected harvest date is within the next 3 days)
    const readyToHarvestCrops = await Crop.find({
      userId: userId,
      harvestDate: {
        $gte: today,
        $lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      // Only select crops that haven't had a notification sent already
      harvestNotificationSent: { $ne: true }
    });

    // Create notifications for each crop
    for (const crop of readyToHarvestCrops) {
      const message = `Your ${crop.name} in field ${crop.location || 'unknown'} is ready for harvest.`;
      
      // Create notification in the database
      const notification = new Notification({
        userId: userId,
        type: 'crop',
        message: message,
        link: `/crops/${crop._id}`,
        read: false,
        date: new Date()
      });
      await notification.save();

      // Mark that we've sent a notification for this crop
      crop.harvestNotificationSent = true;
      await crop.save();
    }

    return readyToHarvestCrops.length;
  } catch (error) {
    console.error('Error checking crops for harvest:', error);
    return 0;
  }
};

// Helper function to check for low inventory items
const checkUserInventoryLevels = async (userId) => {
  try {
    // Find inventory items with quantity below threshold
    const lowInventoryItems = await Inventory.find({
      userId: userId,
      quantity: { $lte: 5 }, // Threshold of 5 units
      lowStockNotificationSent: { $ne: true }
    });

    // Create notifications for each low inventory item
    for (const item of lowInventoryItems) {
      const message = `Low stock alert: ${item.name} (${item.quantity} ${item.unit || 'units'} remaining)`;
      
      // Create notification in the database
      const notification = new Notification({
        userId: userId,
        type: 'inventory',
        message: message,
        link: `/inventory`,
        read: false,
        date: new Date()
      });
      await notification.save();

      // Mark that we've sent a notification for this item
      item.lowStockNotificationSent = true;
      await item.save();
    }

    return lowInventoryItems.length;
  } catch (error) {
    console.error('Error checking inventory levels:', error);
    return 0;
  }
};

// Helper function to check weather conditions
const checkWeatherForUser = async (userId) => {
  try {
    // This would typically call a weather API, but for simplicity,
    // we'll simulate weather conditions
    const random = Math.random();
    if (random < 0.2) { // 20% chance of bad weather
      const conditions = [
        'Heavy Rain', 
        'Storm', 
        'Flood Warning', 
        'Heat Warning'
      ];
      const weatherCondition = conditions[Math.floor(Math.random() * conditions.length)];
      
      // Create a notification for the weather alert
      const notification = new Notification({
        userId: userId,
        type: 'weather',
        message: `Weather alert: ${weatherCondition} forecasted for your area. Take necessary precautions.`,
        link: `/weather`,
        read: false,
        date: new Date()
      });
      await notification.save();
      return 1;
    }
    return 0;
  } catch (error) {
    console.error('Error checking weather conditions:', error);
    return 0;
  }
};

exports.getNotifications = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }
    
    // Run all farm condition checks in parallel
    Promise.all([
      checkUserCropsForHarvest(req.user.id),
      checkUserInventoryLevels(req.user.id),
      checkWeatherForUser(req.user.id)
    ]).catch(error => {
      console.error('Error running farm condition checks:', error);
    });
    
    // Get all notifications for the user
    const notifications = await Notification.find({ userId: req.user.id })
      .sort({ date: -1 })
      .limit(10);

    res.json(notifications);
  } catch (err) {
    console.error('Error in getNotifications:', err);
    res.status(500).json({ message: 'Failed to fetch notifications', error: err.message });
  }
};

// Store read notifications in memory for testing purposes
let readNotificationIds = [];

exports.markAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    const { notificationId } = req.params;
    
    // Find the notification and ensure it belongs to the current user
    const notification = await Notification.findOne({
      _id: notificationId,
      userId: req.user.id
    });
    
    if (!notification) {
      return res.status(404).json({ message: 'Notification not found' });
    }
    
    // Update the notification to mark it as read
    notification.read = true;
    await notification.save();

    res.json({ message: 'Notification marked as read' });
  } catch (err) {
    console.error('Error in markAsRead:', err);
    res.status(500).json({ message: 'Failed to mark notification as read', error: err.message });
  }
};

exports.markAllAsRead = async (req, res) => {
  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ message: 'Authentication required' });
    }

    // Update all unread notifications for this user
    const result = await Notification.updateMany(
      { userId: req.user.id, read: false },
      { $set: { read: true } }
    );
    
    res.json({ 
      message: 'All notifications marked as read', 
      updated: result.modifiedCount 
    });
  } catch (err) {
    console.error('Error in markAllAsRead:', err);
    res.status(500).json({ message: 'Failed to mark all notifications as read', error: err.message });
  }
}; 
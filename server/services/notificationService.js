const twilio = require('twilio');
const User = require('../models/User');
const Notification = require('../models/Notification');
const Crop = require('../models/Crop');
const Inventory = require('../models/Inventory');

// Initialize Twilio client
const twilioClient = twilio(
  process.env.TWILIO_ACCOUNT_SID,
  process.env.TWILIO_AUTH_TOKEN
);

const sendSMS = async (to, message) => {
  try {
    const response = await twilioClient.messages.create({
      body: message,
      to: to,
      from: process.env.TWILIO_PHONE_NUMBER
    });
    console.log('SMS sent successfully:', response.sid);
    return true;
  } catch (error) {
    console.error('Error sending SMS:', error);
    return false;
  }
};

// Create an in-app notification
const createInAppNotification = async (userId, message, notificationType, link = null) => {
  try {
    const notification = new Notification({
      userId,
      type: notificationType,
      message,
      link,
      read: false,
      date: new Date()
    });

    await notification.save();
    console.log(`Created in-app notification for user ${userId}: ${message}`);
    return true;
  } catch (error) {
    console.error('Error creating in-app notification:', error);
    return false;
  }
};

// Enhanced notification function that also creates in-app notifications
const sendNotification = async (userId, message, notificationType = 'system', options = {}) => {
  try {
    const user = await User.findById(userId);
    if (!user) {
      console.error('User not found for notification');
      return false;
    }

    const notifications = [];
    const { smsType = 'all', link = null } = options;

    // Always create in-app notification
    const inAppCreated = await createInAppNotification(userId, message, notificationType, link);
    if (inAppCreated) {
      notifications.push('in-app');
    }

    // Send SMS if enabled and phone number exists
    if ((smsType === 'all' || smsType === 'sms') && 
        user.settings?.notifications?.sms && 
        user.phoneNumber) {
      const smsSent = await sendSMS(user.phoneNumber, message);
      if (smsSent) {
        notifications.push('sms');
      }
    }

    // Add email notification here if needed
    // if ((smsType === 'all' || smsType === 'email') && user.settings?.notifications?.email) {
    //   // Send email notification
    // }

    return notifications.length > 0;
  } catch (error) {
    console.error('Error sending notification:', error);
    return false;
  }
};

// Check for crops ready to harvest
const checkCropsForHarvest = async () => {
  try {
    const today = new Date();
    
    // Find crops that are due for harvest (expected harvest date is within the next 3 days)
    const readyToHarvestCrops = await Crop.find({
      harvestDate: {
        $gte: today,
        $lte: new Date(today.getTime() + 3 * 24 * 60 * 60 * 1000) // 3 days from now
      },
      // Only select crops that haven't had a notification sent already
      harvestNotificationSent: { $ne: true }
    }).populate('userId');

    console.log(`Found ${readyToHarvestCrops.length} crops ready for harvest`);

    // Send notifications for each crop
    for (const crop of readyToHarvestCrops) {
      if (!crop.userId) continue;

      const message = `Your ${crop.name} in field ${crop.location || 'unknown'} is ready for harvest.`;
      await sendNotification(
        crop.userId._id, 
        message, 
        'crop',
        { link: `/crops/${crop._id}` }
      );

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

// Check for low inventory items
const checkLowInventory = async () => {
  try {
    // Find inventory items with quantity below threshold
    const lowInventoryItems = await Inventory.find({
      quantity: { $lte: 5 }, // Threshold of 5 units
      lowStockNotificationSent: { $ne: true }
    }).populate('userId');

    console.log(`Found ${lowInventoryItems.length} low inventory items`);

    // Send notifications for each low inventory item
    for (const item of lowInventoryItems) {
      if (!item.userId) continue;

      const message = `Low stock alert: ${item.name} (${item.quantity} ${item.unit || 'units'} remaining)`;
      await sendNotification(
        item.userId._id, 
        message, 
        'inventory',
        { link: `/inventory` }
      );

      // Mark that we've sent a notification for this item
      item.lowStockNotificationSent = true;
      await item.save();
    }

    return lowInventoryItems.length;
  } catch (error) {
    console.error('Error checking low inventory:', error);
    return 0;
  }
};

// Check for bad weather conditions
const checkWeatherConditions = async () => {
  try {
    // This would typically call a weather API, but for now we'll simulate
    // detecting bad weather conditions
    const weather = await fetchWeatherData();
    if (!weather) return 0;

    let notifications = 0;
    const users = await User.find({});

    // Check for bad conditions
    if (weather.conditions === 'Heavy Rain' || 
        weather.conditions === 'Storm' || 
        weather.conditions.includes('Warning')) {
      
      // Send to all users
      for (const user of users) {
        const message = `Weather alert: ${weather.conditions} forecasted for your area. Take necessary precautions.`;
        await sendNotification(
          user._id, 
          message, 
          'weather',
          { link: `/weather` }
        );
        notifications++;
      }
    }

    return notifications;
  } catch (error) {
    console.error('Error checking weather conditions:', error);
    return 0;
  }
};

// Mock function to fetch weather - in production, this would use a real API
async function fetchWeatherData() {
  // Simulate occasionally finding bad weather
  const random = Math.random();
  if (random < 0.3) {
    const conditions = [
      'Heavy Rain', 
      'Storm', 
      'Flood Warning', 
      'Heat Warning'
    ];
    return {
      conditions: conditions[Math.floor(Math.random() * conditions.length)],
      temperature: Math.floor(Math.random() * 40)
    };
  }
  return null;
}

// Function to run all checks (can be triggered by a scheduled job)
const checkFarmConditions = async () => {
  console.log('Checking farm conditions for notifications...');
  
  const harvestNotifications = await checkCropsForHarvest();
  const inventoryNotifications = await checkLowInventory();
  const weatherNotifications = await checkWeatherConditions();
  
  const total = harvestNotifications + inventoryNotifications + weatherNotifications;
  console.log(`Generated ${total} notifications: ${harvestNotifications} harvest, ${inventoryNotifications} inventory, ${weatherNotifications} weather`);
  
  return total;
};

module.exports = {
  sendSMS,
  sendNotification,
  createInAppNotification,
  checkFarmConditions,
  checkCropsForHarvest,
  checkLowInventory,
  checkWeatherConditions
}; 
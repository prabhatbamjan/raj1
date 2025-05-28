const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const User = require('../models/User');

// Get user settings
router.get('/', auth, async (req, res) => {
  try {
    console.log('Fetching settings for user:', req.user.id);
    
    const user = await User.findById(req.user.id).select('settings');
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    console.log('Settings found:', user.settings);
    res.json(user.settings || {
      notifications: {
        email: true,
        push: true,
        sms: false
      },
      security: {
        twoFactor: false,
        sessionTimeout: 30,
        passwordExpiry: 90
      },
      appearance: {
        theme: 'light',
        fontSize: 'medium',
        density: 'comfortable'
      },
      language: 'en'
    });
  } catch (err) {
    console.error('Error fetching settings:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

// Update user settings
router.put('/', auth, async (req, res) => {
  try {
    console.log('Updating settings for user:', req.user.id);
    console.log('New settings:', req.body);

    const { notifications, security, appearance, language } = req.body;

    // Build settings object
    const settingsFields = {};
    if (notifications) settingsFields.notifications = notifications;
    if (security) settingsFields.security = security;
    if (appearance) settingsFields.appearance = appearance;
    if (language) settingsFields.language = language;

    // Update user settings
    let user = await User.findById(req.user.id);
    if (!user) {
      console.log('User not found:', req.user.id);
      return res.status(404).json({ message: 'User not found' });
    }

    user = await User.findByIdAndUpdate(
      req.user.id,
      { $set: { settings: settingsFields } },
      { new: true }
    ).select('settings');

    console.log('Settings updated successfully');
    res.json(user.settings);
  } catch (err) {
    console.error('Error updating settings:', err.message);
    res.status(500).json({ message: 'Server error' });
  }
});

module.exports = router; 
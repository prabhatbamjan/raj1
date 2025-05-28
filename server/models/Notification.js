const mongoose = require('mongoose');

const NotificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  type: {
    type: String,
    required: true,
    enum: ['crop', 'livestock', 'weather', 'inventory', 'finance', 'system']
  },
  message: {
    type: String,
    required: true
  },
  read: {
    type: Boolean,
    default: false
  },
  link: {
    type: String,
    default: null
  },
  date: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });

// Create an index for more efficient queries
NotificationSchema.index({ userId: 1, read: 1, date: -1 });

module.exports = mongoose.model('Notification', NotificationSchema);

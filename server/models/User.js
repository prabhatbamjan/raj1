const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  phone: { type: String },
  location: { type: String },
  avatar: { type: String },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  readNotifications: { type: [String], default: [] },
  settings: {
    notifications: {
      email: { type: Boolean, default: true },
      push: { type: Boolean, default: true },
      sms: { type: Boolean, default: false }
    },
    security: {
      twoFactor: { type: Boolean, default: false },
      sessionTimeout: { type: Number, default: 30 },
      passwordExpiry: { type: Number, default: 90 }
    },
    appearance: {
      theme: { type: String, enum: ['light', 'dark'], default: 'light' },
      fontSize: { type: String, enum: ['small', 'medium', 'large'], default: 'medium' },
      density: { type: String, enum: ['comfortable', 'compact'], default: 'comfortable' }
    },
    language: { type: String, default: 'en' }
  },
  joinDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model("User", UserSchema);

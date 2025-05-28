const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const auth = require('./middleware/auth');
const connectDB = require('./config/db');

// Import routes
const authRoutes = require('./routes/authRoutes');
const profileRoutes = require('./routes/profileRoutes');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notifications');
const financeRoutes = require('./routes/financeRoutes');
const financeAnalyticsRoutes = require('./routes/financeAnalyticsRoutes');
const cropRoutes = require('./routes/cropRoutes');
const livestocksRoutes = require('./routes/livestocks');
const inventoryRoutes = require('./routes/inventoryRoutes');
const weatherRoutes = require('./routes/weatherRoutes');
const medicalRecordsRoutes = require('./routes/medicalRecordRoutes');
const harvestingRoutes = require('./routes/harvestingRoutes');
const breedingRoutes = require('./routes/breedingRoutes');
const livestockMedicalRoutes = require('./routes/livestockMedicalRoutes');

const app = express();

// Connect Database
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Public routes (no auth required)
app.use('/api/auth', authRoutes);

// Protected routes (auth required)
app.use('/api/profile', auth, profileRoutes);
app.use('/api/settings', auth, settingsRoutes);
app.use('/api/notifications', auth, notificationRoutes);
app.use('/api/finance', auth, financeRoutes);
app.use('/api/finance/analytics', auth, financeAnalyticsRoutes);
app.use('/api/crops', auth, cropRoutes);
app.use('/api/livestocks', auth, livestocksRoutes);
app.use('/api/inventory', auth, inventoryRoutes);
app.use('/api/weather', auth, weatherRoutes);
app.use('/api/medical-records', auth, medicalRecordsRoutes);
app.use('/api/harvesting', auth, harvestingRoutes);
app.use('/api/breeding', auth, breedingRoutes);
app.use('/api/livestock-medical', auth, livestockMedicalRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 
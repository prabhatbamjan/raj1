const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const dotenv = require("dotenv");
const auth = require('./middleware/auth');

// Import routes
const cropRoutes = require("./routes/cropRoutes");
const authRoutes = require("./routes/authRoutes");
const medicalRecordRoutes = require("./routes/medicalRecordRoutes");
const harvestingRoutes = require("./routes/harvestingRoutes");
const batchRoutes = require("./routes/batchRoutes");
const livestockMedicalRoutes = require("./routes/livestockMedicalRoutes");
const breedingRoutes = require("./routes/breedingRoutes");
const livestockRoutes = require("./routes/livestockRoutes");
const transactionRoutes = require("./routes/transactionRoutes");
const cropAnalyticsRoutes = require("./routes/cropAnalyticsRoutes");
const inventoryRoutes = require("./routes/inventoryRoutes");
const weatherRoutes = require("./routes/weatherRoutes");
const financeAnalyticsRoutes = require("./routes/financeAnalyticsRoutes");
const analyticsRoutes = require('./routes/analytics');
const settingsRoutes = require('./routes/settingsRoutes');
const notificationRoutes = require('./routes/notificationRoutes');
const profileRoutes = require('./routes/profileRoutes');
// const pestPesticideRoutes = require("./routes/pestPesticideRoutes");
// const livestockAnalyticsRoutes = require("./routes/livestockAnalyticsRoutes");

const app = express();
dotenv.config();

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve uploaded files
app.use("/uploads", express.static("uploads"));

// Routes
app.use("/api/auth", authRoutes);
app.use("/api/crops", auth, cropRoutes);
app.use("/api/medical-records", auth, medicalRecordRoutes);
app.use("/api/harvesting", auth, harvestingRoutes);
app.use("/api/batches", auth, batchRoutes);
app.use("/api/livestock-medical", auth, livestockMedicalRoutes);
app.use("/api/breeding", auth, breedingRoutes);
app.use("/api/livestock", auth, livestockRoutes);
app.use("/api/transactions", auth, transactionRoutes);
app.use("/api/crop-analytics", auth, cropAnalyticsRoutes);
app.use("/api/inventory", auth, inventoryRoutes);
app.use("/api/weather", auth, weatherRoutes);
app.use("/api/finance-analytics", auth, financeAnalyticsRoutes);
app.use("/api/analytics", auth, analyticsRoutes);
app.use("/api/settings", auth, settingsRoutes);
app.use("/api/notifications", auth, notificationRoutes);
app.use("/api/profile", auth, profileRoutes);
// app.use("/api/pest-pesticide", pestPesticideRoutes);

// Root route
app.get("/", (req, res) => {
  res.send("API is running");
});

// Handle 404
app.use((_req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

module.exports = app;

const mongoose = require('mongoose');

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/farmdb');

        console.log(`MongoDB Connected: ${conn.connection.host}`);

        // Register all models
        require('../models/User');
        require('../models/CropAnalytics');
        require('../models/FinanceAnalytics');
        require('../models/Crop');
        require('../models/MedicalRecord');
        require('../models/HarvestingRecord');
        require('../models/Transaction');
        require('../models/Inventory');
        require('../models/BreedingRecord');
        require('../models/LivestockMedicalRecord');
        require('../models/Batch');
        require('../models/pestPesticideModel');

        console.log('All models registered successfully');
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

module.exports = connectDB;

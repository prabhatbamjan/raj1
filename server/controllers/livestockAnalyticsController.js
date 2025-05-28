// controllers/livestockAnalyticsController.js

const Batch = require("../models/Batch");
const MedicalRecord = require("../models/MedicalRecord");
const DeathRecord = require("../models/DeathRecord");
const HarvestRecord = require("../models/HarvestRecord");
const SaleRecord = require("../models/SaleRecord");

// Controller for fetching all livestock batches
exports.getAllBatches = async (req, res) => {
  try {
    const batches = await Batch.find();
    res.status(200).json(batches);
  } catch (error) {
    console.error("Error fetching batches: ", error);
    res.status(500).json({ message: "Failed to fetch batches" });
  }
};

// Controller for fetching all medical records
exports.getAllMedicalRecords = async (req, res) => {
  try {
    const medicalRecords = await MedicalRecord.find();
    res.status(200).json(medicalRecords);
  } catch (error) {
    console.error("Error fetching medical records: ", error);
    res.status(500).json({ message: "Failed to fetch medical records" });
  }
};

// Controller for fetching all death records
exports.getAllDeathRecords = async (req, res) => {
  try {
    const deathRecords = await DeathRecord.find();
    res.status(200).json(deathRecords);
  } catch (error) {
    console.error("Error fetching death records: ", error);
    res.status(500).json({ message: "Failed to fetch death records" });
  }
};

// Controller for fetching all harvest records
exports.getAllHarvestRecords = async (req, res) => {
  try {
    const harvestRecords = await HarvestRecord.find();
    res.status(200).json(harvestRecords);
  } catch (error) {
    console.error("Error fetching harvest records: ", error);
    res.status(500).json({ message: "Failed to fetch harvest records" });
  }
};

// Controller for fetching all sale records
exports.getAllSaleRecords = async (req, res) => {
  try {
    const saleRecords = await SaleRecord.find();
    res.status(200).json(saleRecords);
  } catch (error) {
    console.error("Error fetching sale records: ", error);
    res.status(500).json({ message: "Failed to fetch sale records" });
  }
};

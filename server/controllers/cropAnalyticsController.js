const Crop = require("../models/Crop");
const MedicalRecord = require("../models/MedicalRecord");
const HarvestingRecord = require("../models/HarvestingRecord");

// Fetch all crop analytics data
exports.getCropAnalytics = async (req, res) => {
  try {
    // Fetch and aggregate crop data
    const crops = await Crop.aggregate([
      {
        $group: {
          _id: "$cropType",
          yield: { $sum: "$expectedYield" },
          count: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          cropType: "$_id",
          yield: 1,
          count: 1
        }
      }
    ]);

    // Fetch and aggregate medical records by date
    const medicalRecords = await MedicalRecord.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: { $toDate: "$date" } }
          },
          issueCount: { $sum: 1 }
        }
      },
      {
        $project: {
          _id: 0,
          date: "$_id",
          issueCount: 1
        }
      },
      { $sort: { date: 1 } }
    ]);

    // Fetch and aggregate harvest records
    const harvestRecords = await HarvestingRecord.aggregate([
      {
        $group: {
          _id: "$cropType",
          quantity: { $sum: "$quantity" }
        }
      },
      {
        $project: {
          _id: 0,
          cropType: "$_id",
          quantity: 1
        }
      }
    ]);

    // Send the aggregated data
    res.status(200).json({
      crops,
      medicalRecords,
      harvestRecords
    });
  } catch (error) {
    console.error("Error fetching crop analytics data:", error);
    res.status(500).json({
      error: "Failed to fetch crop analytics data",
      details: error.message
    });
  }
};
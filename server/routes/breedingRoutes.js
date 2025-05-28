const express = require("express");
const { getBreedingRecords, addBreedingRecord, updateBreedingRecord, deleteBreedingRecord } = require("../controllers/breedingController");

const router = express.Router();

router.get("/", getBreedingRecords);
router.post("/add", addBreedingRecord);
router.put("/:id", updateBreedingRecord);
router.delete("/:id", deleteBreedingRecord);

module.exports = router;

// routes/seed.route.js
const express = require("express");
const router = express.Router();

const SeedStatus = require("../model/seedStatus");
const seedAmbulancesFromCSV = require("../controllers/services/SeedCSV.service");

router.post("/seed/ambulances", async (req, res) => {
  try {
    const seedKey = "AMBULANCE_SEED_V1";

    let status = await SeedStatus.findOne({ key: seedKey });

    if (status?.hasRun) {
      return res.status(403).json({
        message: "Seeding already executed. Manual reset required.",
      });
    }

    const insertedCount = await seedAmbulancesFromCSV();

    await SeedStatus.findOneAndUpdate(
      { key: seedKey },
      {
        hasRun: true,
        executedAt: new Date(),
      },
      { upsert: true }
    );

    res.status(201).json({
      message: "Ambulance seeding completed successfully",
      insertedCount,
    });
  } catch (error) {
    res.status(500).json({
      message: "Seeding failed",
      error: error.message,
    });
  }
});

module.exports = router;

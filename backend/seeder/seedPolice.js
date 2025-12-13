const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const PoliceStation = require("../model/PoliceStation.model");
require("dotenv").config({ path: "../.env" });

async function seedPoliceStations() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected!");

    console.log("📄 Reading CSV file...");
    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream("../../Data/police_stations_data.csv")
        .pipe(csv({
          // Configure csv-parser to handle quoted fields properly
          mapHeaders: ({ header }) => header.trim(),
          mapValues: ({ value }) => value.trim(),
        }))
        .on("data", (row) => {
          // DEBUG: Log first few rows
          if (results.length < 3) {
            console.log(`Row ${results.length}:`);
            console.log("  Name:", row.Name);
            console.log("  Longitude:", row.Longitude);
            console.log("  Latitude:", row.Latitude);
          }
          
          const name = row.Name ? row.Name.trim() : "";
          const longitude = parseFloat(row.Longitude);
          const latitude = parseFloat(row.Latitude);
          
          // Check if coordinates are valid numbers
          const hasValidCoords = !isNaN(longitude) && !isNaN(latitude);
          
          if (hasValidCoords) {
            results.push({
              name: name,
              phone: row.Phone || null,
              address: row.Address?.trim() || "",
              location: {
                type: "Point",
                coordinates: [longitude, latitude],
              },
              website: row.Website || null,
              placeId: row["Place ID"]?.trim() || null,
              category: row.Category || "Police Station",
            });
          } else {
            console.log(`⚠️  Skipping row with invalid coordinates: ${name}`);
          }
        })
        .on("end", () => {
          console.log(`📊 Parsed ${results.length} rows`);
          resolve();
        })
        .on("error", reject);
    });

    if (results.length === 0) {
      console.log("❌ No valid data found!");
      return;
    }

    // Clear existing data
    console.log("🗑️  Clearing existing data...");
    await PoliceStation.deleteMany({});
    console.log("Data cleared");

    // Insert new data
    console.log("🚀 Inserting new data...");
    const inserted = await PoliceStation.insertMany(results, { ordered: false });
    console.log(`✅ Successfully inserted ${inserted.length} records!`);

    console.log("\n📋 Sample inserted stations:");
    inserted.slice(0, 5).forEach((station, i) => {
      console.log(`${i + 1}. ${station.name}`);
      console.log(`   📍 ${station.address}`);
      console.log(`   📞 ${station.phone || "No phone"}`);
      console.log(`   📍 Coordinates: [${station.location.coordinates[0]}, ${station.location.coordinates[1]}]`);
      console.log();
    });

    // Create geospatial index
    console.log("🗺️  Creating geospatial index...");
    await PoliceStation.collection.createIndex({ location: "2dsphere" });
    console.log("✅ Geospatial index created!");

    await mongoose.disconnect();
    console.log("🎉 Seeding completed!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    if (error.code === 11000) {
      console.log("Duplicate key error. Try removing unique constraint from placeId.");
    }
  }
}

seedPoliceStations();
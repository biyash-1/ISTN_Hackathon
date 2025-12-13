const fs = require("fs");
const csv = require("csv-parser");
const mongoose = require("mongoose");
const Hospital = require("../model/Hospital.model");
require("dotenv").config({ path: "../.env" });

async function seedHospitals() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoURI);
    console.log("✅ MongoDB connected successfully!");

    const results = [];

    await new Promise((resolve, reject) => {
      fs.createReadStream("../../Data/hospital_data.csv")
        .pipe(csv({
          // Add configuration to handle the CSV properly
          mapHeaders: ({ header }) => {
            // Clean up headers - remove quotes, trim spaces
            return header.replace(/['"]/g, '').trim();
          },
          mapValues: ({ header, value }) => {
            // Clean up values
            return value.trim();
          },
        }))
        .on("headers", (headers) => {
          console.log("📋 CSV Headers:", headers);
        })
        .on("data", (row) => {
          // Debug: Show what we're actually getting
          if (results.length === 0) {
            console.log("\n🔍 First row raw:");
            console.log("  All keys in row:", Object.keys(row));
            console.log("  Raw row object:", JSON.stringify(row, null, 2));
            
            // Try different ways to access Name
            console.log("\n  Trying to access Name field:");
            console.log("  row.Name:", row.Name);
            console.log("  row['Name']:", row['Name']);
            console.log("  row.name:", row.name);
            console.log("  row['name']:", row['name']);
            
            // List all properties
            for (const key in row) {
              console.log(`  Key: "${key}" (type: ${typeof key}), Value: "${row[key]}"`);
            }
          }
          
          // Try multiple ways to get the name
          let name = "";
          if (row.Name) name = row.Name;
          else if (row.name) name = row.name;
          else if (row['Name']) name = row['Name'];
          else if (row['name']) name = row['name'];
          else {
            // Try to find any key that contains "name"
            for (const key in row) {
              if (key.toLowerCase().includes('name')) {
                name = row[key];
                break;
              }
            }
          }
          
          // If still no name, try the first column value
          if (!name && Object.keys(row).length > 0) {
            const firstKey = Object.keys(row)[0];
            name = row[firstKey];
          }
          
          const latitude = parseFloat(row.Latitude || row.latitude);
          const longitude = parseFloat(row.Longitude || row.longitude);
          
          results.push({
            name: (name || "").trim(),
            phone: row.Phone || row.phone || null,
            address: (row.Address || row.address || "").trim(),
            location: {
              type: "Point",
              coordinates: [longitude, latitude],
            },
            website: row.Website || row.website || null,
            placeId: row["Place ID"] || row["Place ID"] || row.placeId || null,
            category: row.Category || row.category || "Hospital",
          });
        })
        .on("end", resolve)
        .on("error", reject);
    });

    console.log(`\n📊 Total rows parsed: ${results.length}`);
    
    // Show what names we actually got
    console.log("\n🔍 First 3 names found:");
    for (let i = 0; i < Math.min(3, results.length); i++) {
      const r = results[i];
      console.log(`${i + 1}. Name: "${r.name}" (length: ${r.name.length})`);
    }

    // Filter valid results
    const validResults = results.filter((r) => {
      const hasName = r.name && r.name.trim() !== "";
      const hasValidCoords = !isNaN(r.location.coordinates[0]) && !isNaN(r.location.coordinates[1]);
      return hasName && hasValidCoords;
    });

    console.log(`\n✅ Valid results: ${validResults.length} out of ${results.length}`);
    
    if (validResults.length === 0) {
      console.log("❌ No valid data to insert!");
      console.log("\n⚠️  Debug - First row data:");
      if (results.length > 0) {
        console.log(JSON.stringify(results[0], null, 2));
      }
      return;
    }

    // Clear existing data
    console.log("\n🗑️  Clearing existing hospital data...");
    await Hospital.deleteMany({});
    console.log("   Existing data cleared");

    // Insert new data
    console.log("🚀 Inserting new hospital data...");
    const inserted = await Hospital.insertMany(validResults, { ordered: false });
    console.log(`✅ Successfully inserted ${inserted.length} hospitals!`);

    // Show sample
    console.log("\n📋 Sample of inserted hospitals:");
    inserted.slice(0, 3).forEach((hospital, i) => {
      console.log(`${i + 1}. ${hospital.name}`);
    });

  } catch (error) {
    console.error("❌ Error:", error.message);
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("\n🔌 Disconnected from MongoDB");
    }
    console.log("🎉 Hospital seeding process completed!");
  }
}

seedHospitals();
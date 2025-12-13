const fs = require("fs");
const mongoose = require("mongoose");
const AmbulanceService = require("../model/ambulance.model"); // Adjust path as needed
require("dotenv").config({ path: "../.env" });

// Manual CSV parser to handle quoted fields
function parseCSVManual(content) {
  const lines = content.split('\n');
  const headers = lines[0].split(',').map(h => h.trim());
  const results = [];
  
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;
    
    // Handle quoted fields with commas
    let inQuotes = false;
    let current = '';
    const fields = [];
    
    for (let j = 0; j < line.length; j++) {
      const char = line[j];
      
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === ',' && !inQuotes) {
        fields.push(current);
        current = '';
      } else {
        current += char;
      }
    }
    fields.push(current); // Last field
    
    // Create object from headers and fields
    const row = {};
    for (let j = 0; j < Math.min(headers.length, fields.length); j++) {
      row[headers[j]] = fields[j].trim();
    }
    
    results.push(row);
  }
  
  return results;
}

async function seedAmbulanceServices() {
  try {
    // Connect to MongoDB
    const mongoURI = process.env.MONGO_URI;
    console.log("🔗 Connecting to MongoDB...");
    await mongoose.connect(mongoURI, {
      
    });
    console.log("✅ MongoDB connected successfully!");

    // Read and parse CSV manually
    console.log("📄 Reading ambulance service CSV file...");
    const csvContent = fs.readFileSync("../../Data/ambulance_service_data.csv", "utf8");
    const rows = parseCSVManual(csvContent);
    
    console.log(`📊 Parsed ${rows.length} rows`);
    
    // Debug: Show first row
    if (rows.length > 0) {
      console.log("\n🔍 First row data:");
      console.log("Headers:", Object.keys(rows[0]));
      console.log("Name:", rows[0].Name);
      console.log("Latitude:", rows[0].Latitude);
      console.log("Longitude:", rows[0].Longitude);
    }
    
    // Process rows into ambulance service objects
    const ambulanceServices = rows
      .filter(row => row.Name && row.Latitude && row.Longitude)
      .map(row => {
        const name = row.Name.trim();
        const latitude = parseFloat(row.Latitude);
        const longitude = parseFloat(row.Longitude);
        
        return {
          name: name,
          phone: row.Phone || null,
          address: row.Address?.trim() || "",
          location: {
            type: "Point",
            coordinates: [longitude, latitude], // GeoJSON: [longitude, latitude]
          },
          website: row.Website || null,
          placeId: row["Place ID"]?.trim() || null,
          category: row.Category || "Ambulance Service",
        };
      })
      .filter(service => service.name && !isNaN(service.location.coordinates[0]));
    
    console.log(`✅ Found ${ambulanceServices.length} valid ambulance services`);
    
    if (ambulanceServices.length === 0) {
      console.log("❌ No valid ambulance services found!");
      return;
    }
    
    // Clear existing data
    console.log("\n🗑️  Clearing existing ambulance service data...");
    await AmbulanceService.deleteMany({});
    console.log("   Existing data cleared");
    
    // Insert new data
    console.log("🚀 Inserting new ambulance service data...");
    const inserted = await AmbulanceService.insertMany(ambulanceServices, { ordered: false });
    console.log(`✅ Successfully inserted ${inserted.length} ambulance services!`);
    
    // Show sample
    console.log("\n📋 Sample of inserted ambulance services:");
    inserted.slice(0, 5).forEach((service, i) => {
      console.log(`${i + 1}. ${service.name}`);
      console.log(`   📍 ${service.address}`);
      console.log(`   📞 ${service.phone || "No phone"}`);
      console.log(`   🌐 ${service.website || "No website"}`);
      console.log(`   📍 Coordinates: [${service.location.coordinates[0]}, ${service.location.coordinates[1]}]`);
      console.log();
    });
    
    // Create geospatial index
    console.log("🗺️  Creating geospatial index...");
    await AmbulanceService.collection.createIndex({ location: "2dsphere" });
    console.log("✅ Geospatial index created!");
    
  } catch (error) {
    console.error("❌ Error:", error.message);
    
    if (error.code === 11000) {
      console.log("⚠️  Duplicate key error. Check your AmbulanceService model:");
      console.log("   - Make sure placeId has sparse: true if it's unique");
      console.log("   - Or remove unique constraint temporarily");
    }
    
  } finally {
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("\n🔌 Disconnected from MongoDB");
    }
    console.log("🎉 Ambulance service seeding process completed!");
  }
}

// Run the seeding function
seedAmbulanceServices();
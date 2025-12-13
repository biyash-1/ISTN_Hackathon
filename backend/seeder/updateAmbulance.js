const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const Ambulance = require("./../model/ambulance.model");
require("dotenv").config({ path: "../.env" });

// Function to generate a random alphabetic string
function randomAlphaString(length) {
  const chars = "abcdefghijklmnopqrstuvwxyz";
  let result = "";
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

async function updateAmbulances() {
  await mongoose.connect(process.env.MONGO_URI, {
   
  });
  console.log("Connected to MongoDB");

  // Fetch all ambulances
  const ambulances = await Ambulance.find({});
  console.log("Ambulances to update:", ambulances.length);

  for (let amb of ambulances) {
    // Keep only alphabetic characters from name
    const cleanName = amb.name.replace(/[^a-zA-Z]/g, "").toLowerCase();

    // Generate new email and password
    const email = `${cleanName}_${randomAlphaString(6)}@ambulance.com`;
    const plainPassword = crypto.randomBytes(6).toString("hex"); // password can still be hex
    const hashedPassword = await bcrypt.hash(plainPassword, 10);

    amb.email = email;
    amb.password = hashedPassword;

    await amb.save();

    console.log("Updated:", amb.name);
    console.log("Email:", email);
    console.log("Password (plain):", plainPassword);
    console.log("-----------------------------");
  }

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB");
}

updateAmbulances().catch((err) => console.error(err));

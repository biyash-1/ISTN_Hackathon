// seedAdmin.js
const mongoose = require("mongoose");
const User = require("../model/users.model"); // adjust path

require("dotenv").config({ path: "../.env" }); // if you use .env for MONGO_URI

const seedAdmin = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);

    const existingAdmin = await User.findOne({ email: "admin@gmail.com" });
    if (existingAdmin) {
      console.log("Admin user already exists");
      process.exit(0);
    }

    const adminUser = new User({
      email: "admin@gmail.com",
      password: "admin123", // you can change this
      role: "admin",
    });

    await adminUser.save();
    console.log("Admin user created successfully");
    process.exit(0);
  } catch (err) {
    console.error("Error creating admin:", err);
    process.exit(1);
  }
};

seedAdmin();

// controllers/ambulanceAuthController.js
const Ambulance = require("../model/ambulance.model"); // adjust path
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const ambulanceLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Ambulance login attempt:", req.body);

    if (!email || !password) {
      return res.status(400).json({ error: "Email and password are required" });
    }

    // Find ambulance by email
    const ambulance = await Ambulance.findOne({ email });
    if (!ambulance) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

   
    const isMatch = await bcrypt.compare(password, ambulance.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    
    const token = jwt.sign(
      { id: ambulance._id, email: ambulance.email, role: "ambulance" },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    // Send token as cookie
    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
.json({
  message: "Ambulance login successful",
  ambulance: {
    id: ambulance._id,
    name: ambulance.name,
    email: ambulance.email,
    role: "ambulance", // manually added role
  },
});
  } catch (error) {
    console.error("Ambulance login error:", error);
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

module.exports = ambulanceLogin;

// controllers/adminAuthController.js
const User = require("../model/users.model"); // adjust path
const jwt = require("jsonwebtoken");
const bcrypt = require("bcryptjs");

const adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    console.log("Login attempt:", req.body); // log request body

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    if (user.role !== "admin") {
      return res.status(403).json({ error: "Restricted: Admins only" });
    }

    // Compare hashed password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: "Invalid username or password" });
    }

    const token = jwt.sign(
      { id: user._id, email: user.email, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: process.env.JWT_EXPIRES_IN }
    );

    return res
      .cookie("token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: process.env.NODE_ENV === "production" ? "None" : "Lax",
        maxAge: 24 * 60 * 60 * 1000, // 1 day
      })
      .status(200)
      .json({ message: "Admin login successful" });
  } catch (error) {
    console.error("Login error:", error); // log full error
    res.status(500).json({ error: error.message, stack: error.stack });
  }
};

module.exports = adminLogin;

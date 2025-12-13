// backend/index.js - CORRECTED
const accidentRouter = require("./routes/accidentRoutes");
const authRouter = require("./routes/authRoutes");
const databaseConnection = require("./config/dbConfig");
const cookieParser = require("cookie-parser");
const cors = require("cors");

const express = require("express");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

databaseConnection();

app.use(
  cors({
    origin: ["http://localhost:3000"],
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

app.use("/api/v1/accidents", accidentRouter);
app.use("/api/v1/auth", authRouter);

// ✅ REMOVE THIS: app.listen(port, () => { ... })
// ✅ INSTEAD: Export the app

module.exports = app;  // Add this line at the end
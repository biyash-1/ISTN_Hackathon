const mongoose = require("mongoose");

const ambulanceSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String, trim: true },
    address: { type: String, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number], // [longitude, latitude]
        required: true,
      },
    },

    website: { type: String },
    placeId: { type: String, unique: true },
    category: {
      type: String,
      default: "Ambulance Service",
    },

    // New fields for authentication
    email: { type: String, unique: true, sparse: true }, // sparse allows multiple nulls
    password: { type: String },
    socketId: { type: String },
    status: {
      type: String,
      enum: ["AVAILABLE", "BUSY", "OFFLINE"],
      default: "OFFLINE",
    },
  },

  { timestamps: true }
);

// Index for geospatial queries
ambulanceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Ambulance", ambulanceSchema);
``;

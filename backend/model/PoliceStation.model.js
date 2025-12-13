const mongoose = require("mongoose");

const policeStationSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    phone: { type: String },
    address: { type: String, required: true },

    location: {
      type: {
        type: String,
        enum: ["Point"],
        default: "Point",
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },

    website: { type: String },
    // In your PoliceStation.model.js
    placeId: {
      type: String,
      unique: true,
      sparse: true, // This allows null/empty values
    },
    category: {
      type: String,
      default: "Police Stations",
    },
  },
  { timestamps: true }
);

policeStationSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("PoliceStation", policeStationSchema);

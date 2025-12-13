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
  },
  { timestamps: true }
);

ambulanceSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Ambulance", ambulanceSchema);

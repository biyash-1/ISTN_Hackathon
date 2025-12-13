const mongoose = require("mongoose");

const hospitalSchema = new mongoose.Schema(
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
    placeId: { type: String, unique: true },
    category: {
      type: String,
      default: "Hospitals",
    },
  },
  { timestamps: true }
);

hospitalSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("Hospital", hospitalSchema);

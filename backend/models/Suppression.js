const mongoose = require("mongoose");

const SuppressionSchema = new mongoose.Schema(
  {
    email: { type: String, trim: true, lowercase: true },
    companyName: { type: String, trim: true },
    contactName: { type: String, trim: true },
    reason: { type: String, trim: true, default: "Opted out" },
    dateAdded: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Suppression", SuppressionSchema);

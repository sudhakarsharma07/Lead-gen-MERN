const mongoose = require("mongoose");

const STATUS_VALUES = ["Not contacted", "Contacted", "Replied", "Booked", "Declined"];
const CHANNEL_VALUES = ["LinkedIn", "Email", "Phone"];
const ENTITY_TYPE_VALUES = ["Limited company", "LLP", "Public body", "Sole trader", "Unincorporated partnership", "Unknown"];

// The brief's outreach sequence (section 6): Day 1 LinkedIn request, Day 3 message,
// Day 6 email, Day 12 final follow-up, then stop. "Stopped" covers both the max-follow-up
// cutoff and a manual stop (e.g. after a decline).
const SEQUENCE_STEPS = ["Not started", "Day 1 sent", "Day 3 sent", "Day 6 sent", "Day 12 sent", "Stopped"];
const SEQUENCE_OFFSETS_DAYS = { "Day 1 sent": 1, "Day 3 sent": 3, "Day 6 sent": 6, "Day 12 sent": 12 };
const MAX_FOLLOW_UPS = 2; // Day 6 + Day 12 count as the two follow-ups per the brief

const ProspectSchema = new mongoose.Schema(
  {
    companyName: { type: String, required: true, trim: true },
    website: { type: String, trim: true },
    country: { type: String, trim: true },
    city: { type: String, trim: true },
    entityType: { type: String, enum: ENTITY_TYPE_VALUES, default: "Unknown" },

    estimatedUnits: { type: Number, min: 0 },
    employeeCount: { type: Number, min: 0 },

    contactName: { type: String, trim: true },
    jobTitle: { type: String, trim: true },
    linkedinUrl: { type: String, trim: true },
    email: { type: String, trim: true, lowercase: true },
    emailVerified: { type: Boolean, default: false },
    phone: { type: String, trim: true },

    currentSoftware: { type: String, trim: true },
    signal: { type: String, trim: true },
    source: { type: String, trim: true },

    status: { type: String, enum: STATUS_VALUES, default: "Not contacted" },
    channelUsed: { type: String, enum: CHANNEL_VALUES },
    messageVersion: { type: String, enum: ["A", "B", "C"], default: "A" },
    weekAdded: { type: Number, min: 1, max: 4 },

    dateLastContacted: { type: Date },
    interviewBooked: { type: Boolean, default: false },
    interviewDate: { type: Date },
    interviewHeld: { type: Boolean, default: false },

    // Outreach sequence tracking (brief section 6)
    sequenceStartDate: { type: Date },
    sequenceStep: { type: String, enum: SEQUENCE_STEPS, default: "Not started" },
    followUpsSent: { type: Number, default: 0, min: 0, max: MAX_FOLLOW_UPS },

    // Compliance (brief section 5)
    legitimateInterestNote: { type: String, trim: true },

    notes: { type: String, trim: true },
  },
  { timestamps: true }
);

ProspectSchema.index({ companyName: 1, contactName: 1 }, { unique: false });

module.exports = mongoose.model("Prospect", ProspectSchema);
module.exports.STATUS_VALUES = STATUS_VALUES;
module.exports.CHANNEL_VALUES = CHANNEL_VALUES;
module.exports.ENTITY_TYPE_VALUES = ENTITY_TYPE_VALUES;
module.exports.SEQUENCE_STEPS = SEQUENCE_STEPS;
module.exports.SEQUENCE_OFFSETS_DAYS = SEQUENCE_OFFSETS_DAYS;
module.exports.MAX_FOLLOW_UPS = MAX_FOLLOW_UPS;

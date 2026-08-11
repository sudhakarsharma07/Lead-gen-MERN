const mongoose = require("mongoose");

// Brief section 6: "Keep it under 90 words. Never mention a product, a demo, or pricing.
// Write 3 different message versions and test them."
const WORD_LIMIT = 90;
const BANNED_WORDS = ["demo", "pricing", "price", "buy now", "product launch"];

const MessageTemplateSchema = new mongoose.Schema(
  {
    version: { type: String, enum: ["A", "B", "C"], required: true },
    channel: { type: String, enum: ["LinkedIn", "Email", "Phone"], required: true },
    sequenceStep: {
      type: String,
      enum: ["Day 1 sent", "Day 3 sent", "Day 6 sent", "Day 12 sent"],
      required: true,
    },
    body: { type: String, required: true, trim: true },
    wordCount: { type: Number },
    flaggedWords: [{ type: String }],
  },
  { timestamps: true }
);

MessageTemplateSchema.pre("validate", function (next) {
  if (this.body) {
    const words = this.body.trim().split(/\s+/).filter(Boolean);
    this.wordCount = words.length;
    const lower = this.body.toLowerCase();
    this.flaggedWords = BANNED_WORDS.filter((w) => lower.includes(w));
    if (this.wordCount > WORD_LIMIT) {
      return next(new Error(`Message is ${this.wordCount} words — the brief caps this at ${WORD_LIMIT}.`));
    }
  }
  next();
});

module.exports = mongoose.model("MessageTemplate", MessageTemplateSchema);
module.exports.WORD_LIMIT = WORD_LIMIT;
module.exports.BANNED_WORDS = BANNED_WORDS;

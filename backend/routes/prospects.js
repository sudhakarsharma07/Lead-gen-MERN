const express = require("express");
const router = express.Router();
const Prospect = require("../models/Prospect");
const Suppression = require("../models/Suppression");
const { SEQUENCE_STEPS, SEQUENCE_OFFSETS_DAYS, MAX_FOLLOW_UPS } = Prospect;

// Brief section 5: "Do not cold-email German prospects. Use LinkedIn or phone instead."
function violatesGermanyEmailRule(country, channelUsed) {
  return (country || "").trim().toLowerCase() === "germany" && channelUsed === "Email";
}

// GET /api/prospects?status=&week=&search=&messageVersion=&jobTitle=
router.get("/", async (req, res) => {
  try {
    const { status, week, search, messageVersion, jobTitle } = req.query;
    const filter = {};
    if (status) filter.status = status;
    if (week) filter.weekAdded = Number(week);
    if (messageVersion) filter.messageVersion = messageVersion;
    if (jobTitle) filter.jobTitle = new RegExp(jobTitle, "i");
    if (search) {
      filter.$or = [
        { companyName: new RegExp(search, "i") },
        { contactName: new RegExp(search, "i") },
        { currentSoftware: new RegExp(search, "i") },
      ];
    }
    const prospects = await Prospect.find(filter).sort({ createdAt: -1 });
    res.json(prospects);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get("/:id", async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    if (violatesGermanyEmailRule(req.body.country, req.body.channelUsed)) {
      return res.status(422).json({
        error:
          "Cold email to German prospects isn't permitted under §7 UWG. Use LinkedIn or phone for this one.",
      });
    }
    // Block creation/contact of anyone on the suppression list, matched by email
    if (req.body.email) {
      const suppressed = await Suppression.findOne({ email: req.body.email.toLowerCase() });
      if (suppressed) {
        return res.status(409).json({
          error: "This email is on the suppression list and must not be contacted.",
        });
      }
    }
    const prospect = await Prospect.create(req.body);
    res.status(201).json(prospect);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    if (violatesGermanyEmailRule(req.body.country, req.body.channelUsed)) {
      return res.status(422).json({
        error:
          "Cold email to German prospects isn't permitted under §7 UWG. Use LinkedIn or phone for this one.",
      });
    }
    const prospect = await Prospect.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });
    res.json(prospect);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const prospect = await Prospect.findByIdAndDelete(req.params.id);
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prospects/:id/decline -> move to Declined + add to suppression list
router.post("/:id/decline", async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });

    prospect.status = "Declined";
    prospect.sequenceStep = "Stopped";
    await prospect.save();

    if (prospect.email) {
      await Suppression.findOneAndUpdate(
        { email: prospect.email.toLowerCase() },
        {
          email: prospect.email.toLowerCase(),
          companyName: prospect.companyName,
          contactName: prospect.contactName,
          reason: req.body.reason || "Declined / opted out",
          dateAdded: new Date(),
        },
        { upsert: true, new: true }
      );
    }
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/prospects/:id/advance-sequence
// Moves a prospect to the next step of the Day1/3/6/12 outreach sequence.
// Enforces the brief's "maximum 2 follow-ups, then stop" rule (Day 6 + Day 12
// count as the two follow-ups) and the Germany cold-email ban.
router.post("/:id/advance-sequence", async (req, res) => {
  try {
    const prospect = await Prospect.findById(req.params.id);
    if (!prospect) return res.status(404).json({ error: "Prospect not found" });

    const currentIndex = SEQUENCE_STEPS.indexOf(prospect.sequenceStep);
    const nextStep = SEQUENCE_STEPS[currentIndex + 1];

    if (!nextStep || nextStep === "Stopped") {
      return res.status(409).json({
        error: "Maximum follow-ups reached (Day 12). Mark as declined and stop, per the brief.",
      });
    }

    const channelForStep = req.body.channelUsed || prospect.channelUsed;
    if (violatesGermanyEmailRule(prospect.country, channelForStep)) {
      return res.status(422).json({
        error:
          "Cold email to German prospects isn't permitted under §7 UWG. Use LinkedIn or phone for this one.",
      });
    }

    const isFollowUp = nextStep === "Day 6 sent" || nextStep === "Day 12 sent";
    if (isFollowUp && prospect.followUpsSent >= MAX_FOLLOW_UPS) {
      return res.status(409).json({
        error: `Maximum ${MAX_FOLLOW_UPS} follow-ups already sent. Mark as declined and stop.`,
      });
    }

    if (!prospect.sequenceStartDate) prospect.sequenceStartDate = new Date();
    prospect.sequenceStep = nextStep;
    prospect.dateLastContacted = new Date();
    prospect.channelUsed = channelForStep;
    if (isFollowUp) prospect.followUpsSent += 1;
    if (prospect.status === "Not contacted") prospect.status = "Contacted";

    await prospect.save();
    res.json(prospect);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
module.exports.SEQUENCE_OFFSETS_DAYS = SEQUENCE_OFFSETS_DAYS;

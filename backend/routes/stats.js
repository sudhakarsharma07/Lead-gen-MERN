const express = require("express");
const router = express.Router();
const Prospect = require("../models/Prospect");
const Suppression = require("../models/Suppression");

// Weekly targets from the lead-gen brief (section 7)
const WEEKLY_TARGETS = [
  { week: 1, prospectsAdded: 100, contactsMade: 30, interviewsBooked: 2 },
  { week: 2, prospectsAdded: 100, contactsMade: 80, interviewsBooked: 6 },
  { week: 3, prospectsAdded: 60, contactsMade: 80, interviewsBooked: 7 },
  { week: 4, prospectsAdded: 40, contactsMade: 60, interviewsBooked: 5 },
];
const TOTAL_TARGET = { prospectsAdded: 300, contactsMade: 250, interviewsBooked: 20 };

router.get("/", async (req, res) => {
  try {
    const [total, byStatus, byWeek, byMessageVersion, byJobTitle, suppressionCount] =
      await Promise.all([
        Prospect.countDocuments(),
        Prospect.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]),
        Prospect.aggregate([
          { $match: { weekAdded: { $ne: null } } },
          {
            $group: {
              _id: "$weekAdded",
              prospectsAdded: { $sum: 1 },
              contactsMade: {
                $sum: { $cond: [{ $ne: ["$status", "Not contacted"] }, 1, 0] },
              },
              interviewsBooked: { $sum: { $cond: ["$interviewBooked", 1, 0] } },
            },
          },
          { $sort: { _id: 1 } },
        ]),
        Prospect.aggregate([
          {
            $group: {
              _id: "$messageVersion",
              sent: { $sum: { $cond: [{ $ne: ["$status", "Not contacted"] }, 1, 0] } },
              replied: {
                $sum: {
                  $cond: [{ $in: ["$status", ["Replied", "Booked"]] }, 1, 0],
                },
              },
              booked: { $sum: { $cond: ["$interviewBooked", 1, 0] } },
            },
          },
        ]),
        Prospect.aggregate([
          { $match: { jobTitle: { $nin: [null, ""] } } },
          {
            $group: {
              _id: "$jobTitle",
              total: { $sum: 1 },
              replied: {
                $sum: {
                  $cond: [{ $in: ["$status", ["Replied", "Booked"]] }, 1, 0],
                },
              },
              booked: { $sum: { $cond: ["$interviewBooked", 1, 0] } },
            },
          },
          { $sort: { total: -1 } },
        ]),
        Suppression.countDocuments(),
      ]);

    const statusMap = {};
    byStatus.forEach((s) => (statusMap[s._id] = s.count));

    const interviewsBooked = await Prospect.countDocuments({ interviewBooked: true });
    const interviewsHeld = await Prospect.countDocuments({ interviewHeld: true });
    const contactsMade = await Prospect.countDocuments({ status: { $ne: "Not contacted" } });

    res.json({
      totals: {
        prospectsAdded: total,
        contactsMade,
        interviewsBooked,
        interviewsHeld,
        suppressionListSize: suppressionCount,
      },
      targets: { weekly: WEEKLY_TARGETS, total: TOTAL_TARGET },
      byStatus: statusMap,
      byWeek,
      byMessageVersion,
      byJobTitle,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

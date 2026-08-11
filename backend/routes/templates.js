const express = require("express");
const router = express.Router();
const MessageTemplate = require("../models/MessageTemplate");

router.get("/", async (req, res) => {
  try {
    const templates = await MessageTemplate.find().sort({ version: 1, sequenceStep: 1 });
    res.json(templates);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/", async (req, res) => {
  try {
    const template = await MessageTemplate.create(req.body);
    res.status(201).json(template);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.put("/:id", async (req, res) => {
  try {
    const existing = await MessageTemplate.findById(req.params.id);
    if (!existing) return res.status(404).json({ error: "Template not found" });
    Object.assign(existing, req.body);
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

router.delete("/:id", async (req, res) => {
  try {
    const template = await MessageTemplate.findByIdAndDelete(req.params.id);
    if (!template) return res.status(404).json({ error: "Template not found" });
    res.json({ message: "Deleted", id: req.params.id });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;

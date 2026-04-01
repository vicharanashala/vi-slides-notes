const express = require("express");
const router = express.Router();
const Session = require("../models/session");

// CREATE NEW SESSION
router.post("/", async (req, res) => {
  const { code } = req.body;
  try {
    let existing = await Session.findOne({ code });
    if (existing) {
      return res.status(400).json({ message: "Session code already exists" });
    }
    const session = new Session({ code });
    await session.save();
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

// JOIN EXISTING SESSION
router.get("/:code", async (req, res) => {
  try {
    const session = await Session.findOne({ code: req.params.code });
    if (!session) return res.status(404).json({ message: "Session not found" });
    res.json(session);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
});

module.exports = router;
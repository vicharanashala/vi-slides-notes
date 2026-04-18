import express from 'express';
import { Session } from '../models/Session.js';

const router = express.Router();


const generateSessionCode = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};


router.post('/create', async (req, res) => {
  try {
    const { teacherId } = req.body;
    const sessionCode = generateSessionCode();
    const newSession = await Session.create({
      sessionCode,
      teacherId,
      status: 'active'
    });
    res.json(newSession);
  } catch (error) {
    res.status(500).json({ message: "Failed to create session" });
  }
});


router.get('/join/:code', async (req, res) => {
  try {
    const { code } = req.params;
    const session = await Session.findOne({ sessionCode: code, status: 'active' });

    if (!session) {
      return res.status(404).json({ message: "Invalid or inactive session code." });
    }
    res.json({ message: "Joined successfully", session });
  } catch (error) {
    res.status(500).json({ message: "Server error joining session" });
  }
});


router.post('/end/:code', async (req, res) => {
  try {
    const { code } = req.params;
    
    const session = await Session.findOneAndUpdate(
      { sessionCode: code },
      { status: 'ended' },
      { new: true }
    );

    if (!session) return res.status(404).json({ message: "Session not found" });

    console.log(`Session Ended: ${code}`);
    res.json({ message: "Session ended successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error ending session" });
  }
});

export default router;
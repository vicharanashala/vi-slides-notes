import express from "express";
import Poll from "../models/Poll";

const router = express.Router();

// ✅ GET POLLS FOR A SESSION
router.get("/session/:id", async (req, res) => {
  try {
    const polls = await Poll.find({ session: req.params.id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: polls,
    });
  } catch (error: any) {
    console.error("❌ POLL FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
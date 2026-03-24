import express from "express";
import { submitQuestion } from "../controllers/questionController";
import Question from "../models/Question";

const router = express.Router();

// ✅ SUBMIT QUESTION
router.post("/submit", submitQuestion);

// ✅ GET QUESTIONS BY SESSION
router.get("/session/:id", async (req, res) => {
  try {
    const questions = await Question.find({ session: req.params.id })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: questions,
    });
  } catch (error: any) {
    console.error("❌ FETCH ERROR:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
});

export default router;
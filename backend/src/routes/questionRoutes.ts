import express from "express";
import {
  submitQuestion,
  getQuestions,
  answerQuestion,
} from "../controllers/questionController";
import { protect } from "../middleware/authMiddleware";

const router = express.Router();

router.post("/submit", protect, submitQuestion);
router.get("/:sessionId", protect, getQuestions);
router.patch("/:questionId/answer", protect, answerQuestion);

export default router;

import express from "express";
import {
	submitQuestion,
	getQuestionsBySession,
	answerQuestion,
	answerQuestionWithAI,
	pinQuestion,
} from "../controllers/questionController.js";
import { requireAuth, requireRole, requireStudent, requireTeacher } from "../middleware/auth.js";

const router = express.Router();

router.post("/submit",          requireAuth, requireStudent, submitQuestion);
router.get("/session/:code",    requireAuth, requireRole("teacher", "student"), getQuestionsBySession);
router.patch("/:id/answer",     requireAuth, requireTeacher, answerQuestion);
router.patch("/:id/answer-ai",  requireAuth, requireTeacher, answerQuestionWithAI);
router.patch("/:id/pin",        requireAuth, requireTeacher, pinQuestion);

export default router;
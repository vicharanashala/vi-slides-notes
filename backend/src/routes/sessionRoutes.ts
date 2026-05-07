import express from "express";
import {
	createSession,
	updateSessionStatus,
	listMySessions,
	deleteSession,
} from "../controllers/sessionController.js";
import { requireAuth, requireTeacher } from "../middleware/auth.js";

const router = express.Router();

router.get("/mine",            requireAuth, requireTeacher, listMySessions);
router.post("/",               requireAuth, requireTeacher, createSession);
router.patch("/:code/status",  requireAuth, requireTeacher, updateSessionStatus);
router.delete("/:code",        requireAuth, requireTeacher, deleteSession);

export default router;
import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createAssignment,
  getAssignments,
  getSingleAssignment,
  updateAssignment,
  deleteAssignment,
  submitAssignment,
  getAllSubmissions,
} from "../controllers/assignment.controller";

const router = Router();

// CREATE
router.post("/", authMiddleware, createAssignment);

// GET ALL
router.get("/", getAssignments);

// GET ALL SUBMISSIONS
router.get("/submissions/all", authMiddleware, getAllSubmissions);

// GET ONE
router.get("/:id", getSingleAssignment);

// UPDATE
router.put("/:id", authMiddleware, updateAssignment);

// DELETE
router.delete("/:id", authMiddleware, deleteAssignment);

// SUBMIT
router.post("/:id/submit", authMiddleware, submitAssignment);

export default router;
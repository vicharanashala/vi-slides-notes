import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createAssignment,
  getAssignments,
  deleteAssignment,
  updateAssignment,
} from "../controllers/assignment.controller";

const router = Router();

// Create (Protected)
router.post("/", authMiddleware, createAssignment);

// Get all
router.get("/", getAssignments);

// Delete (Protected)
router.delete("/:id", authMiddleware, deleteAssignment);

// Update (Protected)
router.put("/:id", authMiddleware, updateAssignment);

export default router;
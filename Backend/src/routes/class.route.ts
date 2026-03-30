import express from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  createClass,
  startClass,
  endClass,
  joinClass,
  getClassById,
} from "../controllers/class.controller";

const router = express.Router();

// Instructor routes
router.post("/create", authMiddleware, createClass);
router.post("/:classId/start", authMiddleware, startClass);
router.post("/:classId/end", authMiddleware, endClass);
router.get("/:id", authMiddleware, getClassById);

// Student route
router.post("/join", authMiddleware, joinClass);

export default router;
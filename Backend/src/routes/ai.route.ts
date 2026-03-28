import express from "express";
import { generateAIAnswer } from "../controllers/ai.controller";
import authMiddleware from "../middleware/auth.middleware";
import { allowRoles } from "../middleware/role.middleware";

const router = express.Router();

router.post(
  "/answer",
  authMiddleware,
  allowRoles("Instructor"),
  generateAIAnswer
);

export default router;
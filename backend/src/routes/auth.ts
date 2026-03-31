import express from "express";
import { body } from "express-validator";
import {
  getMe,
  updateDetails,
  googleLogin,
  getLeaderboard,
} from "../controllers/authController";
import { protect } from "../middleware/auth";

const router = express.Router();

// @route   GET /api/auth/leaderboard
// @desc    Get top users by points
// @access  Public
router.get("/leaderboard", getLeaderboard);

// @route   POST /api/auth/google
// @desc    Login/Register with Google
// @access  Public
router.post(
  "/google",
  [
    body("token").isString().notEmpty().withMessage("Google token is required"),
    body("intent")
      .isIn(["student_login", "teacher_signup"])
      .withMessage("Invalid Google auth intent"),
    body("teacherId")
      .optional()
      .isString()
      .trim()
      .notEmpty()
      .withMessage("teacherId must be a non-empty string"),
  ],
  googleLogin,
);

// @route   GET /api/auth/me
// @desc    Get current logged in user
// @access  Private
router.get("/me", protect, getMe);

// @route   PUT /api/auth/updatedetails
// @desc    Update user details
// @access  Private
router.put(
  "/updatedetails",
  protect,
  [
    body("name").trim().notEmpty().withMessage("Name is required"),
    body("email").isEmail().withMessage("Please provide a valid email"),
  ],
  updateDetails,
);

export default router;

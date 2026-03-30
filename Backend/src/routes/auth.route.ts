import { Router } from "express";
import authMiddleware from "../middleware/auth.middleware";
import {
  registerController,
  loginController,
  logoutController,
  getUserController,
  updateUserController,
} from "../controllers/auth.controller";

const router = Router();

// REGISTER
router.post("/register", registerController);

// LOGIN
router.post("/login", loginController);

// LOGOUT
router.get("/logout", logoutController);

// GET USER
router.get("/user", getUserController);

// UPDATE USER
router.put("/user/update", authMiddleware, updateUserController);

export default router;
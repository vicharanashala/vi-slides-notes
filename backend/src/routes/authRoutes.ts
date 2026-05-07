import express from "express";
import passport from "passport";
import {
	register,
	login,
	finalizeRole,
	handleGoogleCallback,
	handleGoogleFailure,
} from "../controllers/authController.js";
import { requireAuth } from "../middleware/auth.js";

const router = express.Router();

router.post("/register", register);
router.post("/login",    login);
router.post("/role",     requireAuth, finalizeRole);

router.get("/google/status", (req, res) => {
	res.status(200).json({
		success: true,
		googleAuthEnabled: Boolean(req.app.get("googleAuthEnabled")),
	});
});

router.get("/google", (req, res, next) => {
	if (!req.app.get("googleAuthEnabled")) {
		res.status(503).json({ success: false, message: "Google authentication is not configured" });
		return;
	}

	passport.authenticate("google", {
		scope: ["profile", "email"],
		session: false,
	})(req, res, next);
});

router.get("/google/callback", (req, res, next) => {
	if (!req.app.get("googleAuthEnabled")) {
		res.status(503).json({ success: false, message: "Google authentication is not configured" });
		return;
	}

	passport.authenticate("google", {
		session: false,
		failureRedirect: "/api/auth/google/failure",
	})(req, res, next);
}, handleGoogleCallback);

router.get("/google/failure", handleGoogleFailure);

export default router;
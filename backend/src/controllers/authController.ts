import { Request, Response } from "express";
import User, { IUser, UserRole } from "../models/userModel.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { AuthenticatedRequest } from "../middleware/auth.js";

const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_AUTH_CALLBACK_URL = process.env.FRONTEND_AUTH_CALLBACK_URL || "http://localhost:5173/auth/callback";

const VALID_ROLES = new Set<UserRole>(["teacher", "student"]);

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }
  return secret;
};

const isValidRole = (role: unknown): role is UserRole => {
  return typeof role === "string" && VALID_ROLES.has(role as UserRole);
};

const signAuthToken = (user: IUser): string => {
  return jwt.sign(
    {
      id: user._id.toString(),
      email: user.email,
      role: user.role ?? null,
      rolePending: !user.role,
    },
    getJWTSecret(),
    { expiresIn: "1d" }
  );
};

const buildAuthResponse = (user: IUser, token: string) => ({
  success: true,
  token,
  email: user.email,
  role: user.role ?? null,
  rolePending: !user.role,
});

const buildFrontendCallbackUrl = (params: Record<string, string>): string => {
  const url = new URL(FRONTEND_AUTH_CALLBACK_URL);

  Object.entries(params).forEach(([key, value]) => {
    if (value) {
      url.searchParams.set(key, value);
    }
  });

  return url.toString();
};


export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password, role } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password || !isValidRole(role)) {
      res.status(400).json({ success: false, message: "Email, password and valid role are required" });
      return;
    }

    const existing = await User.findOne({ email: normalizedEmail });
    if (existing) {
      res.status(400).json({ success: false, message: "User already exists" });
      return;
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({
      email: normalizedEmail,
      password: hashedPassword,
      role,
      provider: "local",
    });

    const token = signAuthToken(user);

    res.status(201).json(buildAuthResponse(user, token));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = typeof email === "string" ? email.trim().toLowerCase() : "";

    if (!normalizedEmail || !password) {
      res.status(400).json({ success: false, message: "Email and password are required" });
      return;
    }

    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      res.status(400).json({ success: false, message: "User not found" });
      return;
    }

    if (!user.password) {
      res.status(400).json({ success: false, message: "Use Google sign-in for this account" });
      return;
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      res.status(400).json({ success: false, message: "Invalid credentials" });
      return;
    }

    const token = signAuthToken(user);

    res.json(buildAuthResponse(user, token));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const finalizeRole = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = (req as AuthenticatedRequest).user?.id;
    const { role } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!isValidRole(role)) {
      res.status(400).json({ success: false, message: "Valid role is required" });
      return;
    }

    const user = await User.findById(userId);

    if (!user) {
      res.status(404).json({ success: false, message: "User not found" });
      return;
    }

    if (user.role && user.role !== role) {
      res.status(400).json({ success: false, message: "Role is already fixed and cannot be changed" });
      return;
    }

    if (!user.role) {
      user.role = role;
      await user.save();
    }

    const token = signAuthToken(user);
    res.status(200).json(buildAuthResponse(user, token));
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const handleGoogleCallback = async (req: Request, res: Response): Promise<void> => {
  const user = (req as Request & { user?: IUser }).user;

  if (!user) {
    res.redirect(buildFrontendCallbackUrl({ error: "google_auth_failed" }));
    return;
  }

  const token = signAuthToken(user);

  res.redirect(
    buildFrontendCallbackUrl({
      token,
      email: user.email,
      role: user.role || "",
      rolePending: String(!user.role),
    })
  );
};

export const handleGoogleFailure = (_req: Request, res: Response): void => {
  res.redirect(buildFrontendCallbackUrl({ error: "google_auth_failed" }));
};
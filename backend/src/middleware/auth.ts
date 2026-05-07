import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { UserRole } from "../models/userModel.js";

const JWT_SECRET = process.env.JWT_SECRET;

const getJWTSecret = (): string => {
  const secret = process.env.JWT_SECRET;
  if (!secret) {
    throw new Error("JWT_SECRET is not defined in .env");
  }
  return secret;
};

export interface AuthTokenPayload {
  id: string;
  email: string;
  role?: UserRole | null;
  rolePending?: boolean;
}

export interface AuthenticatedRequest extends Request {
  user?: AuthTokenPayload;
}

export const requireAuth = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.header("Authorization");

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({ success: false, message: "Authorization token is required" });
    return;
  }

  const token = authHeader.replace("Bearer ", "").trim();

  try {
    const decoded = jwt.verify(token, getJWTSecret()) as jwt.JwtPayload & AuthTokenPayload;

    if (!decoded.id || !decoded.email) {
      res.status(401).json({ success: false, message: "Invalid token payload" });
      return;
    }

    (req as AuthenticatedRequest).user = {
      id: String(decoded.id),
      email: String(decoded.email),
      role: decoded.role ?? null,
      rolePending: Boolean(decoded.rolePending),
    };

    next();
  } catch {
    res.status(401).json({ success: false, message: "Invalid or expired token" });
  }
};

export const requireRole = (...roles: UserRole[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    const user = (req as AuthenticatedRequest).user;

    if (!user) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!user.role) {
      res.status(403).json({ success: false, message: "Complete role setup to continue" });
      return;
    }

    if (!roles.includes(user.role)) {
      res.status(403).json({ success: false, message: "You do not have access to this action" });
      return;
    }

    next();
  };
};

export const requireTeacher = requireRole("teacher");
export const requireStudent = requireRole("student");

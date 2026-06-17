import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const protect = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) {
    console.log("AUTH ERROR: No token provided");
    return res.status(401).json({ message: "No token, unauthorized" });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as any;
    const user = await User.findById(decoded.id).select("name email role");
    if (!user) {
      console.log("AUTH ERROR: User not found for ID:", decoded.id);
      return res.status(401).json({ message: "User not found" });
    }
    (req as any).user = { id: user._id, name: user.name, role: user.role };
    next();
  } catch (error: any) {
    console.error("AUTH ERROR:", error.message);
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" });
    }
    res.status(401).json({ message: "Invalid token" });
  }
};

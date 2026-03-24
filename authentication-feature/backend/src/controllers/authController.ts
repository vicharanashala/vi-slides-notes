import { Request, Response } from "express";
import User from "../models/User";
import jwt from "jsonwebtoken";

// 🔐 Generate Token
const generateToken = (id: string) => {
  return jwt.sign({ id }, process.env.JWT_SECRET || "secret", {
    expiresIn: "7d",
  });
};

// =========================
// REGISTER
// =========================
export const register = async (req: Request, res: Response) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        message: "All fields are required",
      });
    }

    // Check existing
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exists",
      });
    }

    // 🔥 DO NOT HASH HERE (schema karega)
    const user = await User.create({
      name,
      email,
      password,
      role,
    });

    res.status(201).json({
      message: "User registered successfully",
      token: generateToken(user._id.toString()),
    });

  } catch (error: any) {
    console.error("REGISTER ERROR:", error);
    res.status(500).json({
      message: error.message,
    });
  }
};

// =========================
// LOGIN
// =========================
export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    // find user WITH password
    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    // compare
    const isMatch = await user.comparePassword(password);

    if (!isMatch) {
      return res.status(401).json({
        message: "Invalid credentials",
      });
    }

    res.json({
      message: "Login success",
      token: generateToken(user._id.toString()),
    });

  } catch (error: any) {
    console.error("LOGIN ERROR:", error);
    res.status(500).json({
      message: "Server error",
    });
  }
};
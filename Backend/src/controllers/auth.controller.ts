import { Request, Response } from "express";
import userModel from "../models/user.model";
import jwt, { JwtPayload } from "jsonwebtoken";
import bcrypt from "bcrypt";

interface AuthRequest extends Request {
  user?: {
    _id: string;
  };
}

// ------------------- GET USER -------------------
const getUserController = async (req: Request, res: Response): Promise<void> => {
  try {
    const token = req.cookies?.token;

    if (!token) {
      res.status(200).json({ user: null });
      return;
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    const user = await userModel
      .findById(decoded._id)
      .select("-password");

    if (!user) {
      res.status(200).json({ user: null });
      return;
    }

    res.status(200).json({ user });
  } catch (err) {
    res.status(200).json({ user: null });
  }
};

// ------------------- REGISTER -------------------
const registerController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullname, email, password, role } = req.body;

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userModel.create({
      fullname,
      email,
      password: hashedPassword,
      role, 
    });

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user.toObject();

    res.status(201).json({
      message: "User registered successfully",
      user: userData,
    });
  } catch (err: any) {
    if (err.code === 11000) {
      const field = Object.keys(err.keyPattern)[0];
      res.status(400).json({ message: `${field} already exists` });
      return;
    }

    res.status(500).json({ message: err.message });
  }
};

// ------------------- LOGIN -------------------
const loginController = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    const user = await userModel.findOne({ email });

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      res.status(401).json({ message: "Invalid password" });
      return;
    }

    const token = jwt.sign(
      { _id: user._id },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.cookie("token", token, {
      httpOnly: true,
      secure: true,
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    const { password: _, ...userData } = user.toObject();

    res.status(200).json({
      message: "User logged in successfully",
      user: userData,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server error" });
  }
};

// ------------------- LOGOUT -------------------
const logoutController = async (_req: Request, res: Response): Promise<void> => {
  res.clearCookie("token", {
    httpOnly: true,
    secure: true,
    sameSite: "none",
  });

  res.json({
    message: "Logged out successfully",
  });
};

// ------------------- UPDATE USER -------------------
const updateUserController = async (
  req: AuthRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?._id;

    if (!userId) {
      res.status(401).json({ message: "Unauthorized" });
      return;
    }

    const { fullname, oldPassword, newPassword } = req.body;

    const user = await userModel.findById(userId);

    if (!user) {
      res.status(404).json({ message: "User not found" });
      return;
    }

    const updateData: Record<string, any> = {};

    if (fullname) {
      if (fullname.trim().length < 2) {
        res.status(400).json({ message: "Fullname too short" });
        return;
      }
      updateData.fullname = fullname.trim();
    }

    if (oldPassword || newPassword) {
      if (!oldPassword || !newPassword) {
        res.status(400).json({
          message: "Both oldPassword and newPassword are required",
        });
        return;
      }

      const isMatch = await bcrypt.compare(oldPassword, user.password);
      if (!isMatch) {
        res.status(400).json({ message: "Old password is incorrect" });
        return;
      }

      if (newPassword.length < 6) {
        res.status(400).json({
          message: "New password must be at least 6 characters long",
        });
        return;
      }

      const isSame = await bcrypt.compare(newPassword, user.password);
      if (isSame) {
        res.status(400).json({
          message: "New password cannot be the same as old password",
        });
        return;
      }

      const hashedPassword = await bcrypt.hash(newPassword, 10);
      updateData.password = hashedPassword;
    }

    if (Object.keys(updateData).length === 0) {
      res.status(400).json({ message: "Nothing to update" });
      return;
    }

    const updatedUser = await userModel
      .findByIdAndUpdate(userId, { $set: updateData }, { new: true })
      .select("-password");

    res.status(200).json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (err: any) {
    console.error("Update user error:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export {
  registerController,
  loginController,
  logoutController,
  getUserController,
  updateUserController,
};
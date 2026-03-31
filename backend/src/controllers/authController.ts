import { Request, Response } from "express";
import { validationResult } from "express-validator";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User";

type GoogleAuthIntent = "student_login" | "teacher_signup";

const generateToken = (id: string): string => {
  const jwtSecret = process.env.JWT_SECRET;
  const jwtExpire = process.env.JWT_EXPIRE || "7d";

  if (!jwtSecret) {
    throw new Error("JWT_SECRET is not defined");
  }

  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpire as any,
  });
};

const isTrustedGoogleIssuer = (issuer?: string): boolean => {
  return (
    issuer === "accounts.google.com" || issuer === "https://accounts.google.com"
  );
};

const getAllowedTeacherIds = (): string[] => {
  const raw = process.env.TEACHER_VERIFICATION_IDS || "";
  return raw
    .split(",")
    .map((item) => item.trim().toUpperCase())
    .filter(Boolean);
};

const isTeacherIdAllowed = (teacherId: string): boolean => {
  const allowed = getAllowedTeacherIds();
  return allowed.includes(teacherId.trim().toUpperCase());
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role,
      },
    });
  } catch (error) {
    console.error("GetMe error:", error);
    res.status(500).json({
      success: false,
      message: "Server error",
    });
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    if (!req.user) {
      res.status(401).json({
        success: false,
        message: "Not authorized",
      });
      return;
    }

    const { name, email } = req.body;

    if (email && email !== req.user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        res.status(400).json({
          success: false,
          message: "Email is already in use",
        });
        return;
      }
    }

    const user = await User.findByIdAndUpdate(
      req.user.id,
      { name, email },
      { new: true, runValidators: true },
    );

    if (!user) {
      res.status(404).json({
        success: false,
        message: "User not found",
      });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("UpdateDetails error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during update",
    });
  }
};

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        errors: errors.array(),
      });
      return;
    }

    const { token, intent, teacherId } = req.body as {
      token: string;
      intent: GoogleAuthIntent;
      teacherId?: string;
    };
    const googleClientId = process.env.GOOGLE_CLIENT_ID;

    if (!googleClientId) {
      res.status(500).json({
        success: false,
        message: "Google authentication is not configured",
      });
      return;
    }

    const client = new OAuth2Client(googleClientId);

    let payload;
    try {
      const ticket = await client.verifyIdToken({
        idToken: token,
        audience: googleClientId,
      });
      payload = ticket.getPayload();
    } catch (verifyError) {
      res.status(401).json({
        success: false,
        message: "Invalid or expired Google token",
      });
      return;
    }

    if (!payload) {
      res
        .status(400)
        .json({ success: false, message: "Invalid Google token payload" });
      return;
    }

    const {
      email,
      name,
      sub: googleId,
      picture,
      email_verified,
      iss,
    } = payload;

    if (!email || !googleId) {
      res.status(400).json({
        success: false,
        message: "Google token is missing required claims",
      });
      return;
    }

    if (!email_verified) {
      res
        .status(401)
        .json({ success: false, message: "Google email is not verified" });
      return;
    }

    if (!isTrustedGoogleIssuer(iss)) {
      res
        .status(401)
        .json({ success: false, message: "Untrusted Google token issuer" });
      return;
    }

    if (intent === "teacher_signup") {
      if (!teacherId) {
        res.status(400).json({
          success: false,
          message: "Teacher ID is required for teacher signup",
        });
        return;
      }

      if (getAllowedTeacherIds().length === 0) {
        res.status(500).json({
          success: false,
          message: "Teacher verification is not configured",
        });
        return;
      }

      if (!isTeacherIdAllowed(teacherId)) {
        res.status(403).json({
          success: false,
          message: "Invalid Teacher ID",
        });
        return;
      }
    }

    let user = await User.findOne({ email });

    if (!user) {
      const isTeacherSignup = intent === "teacher_signup";

      user = await User.create({
        name: name || email.split("@")[0],
        email,
        googleId,
        role: isTeacherSignup ? "Teacher" : "Student",
        teacherId: isTeacherSignup
          ? teacherId?.trim().toUpperCase()
          : undefined,
        teacherVerified: isTeacherSignup,
        avatar: picture,
      });
    } else {
      let updated = false;

      if (intent === "teacher_signup" && user.role !== "Teacher") {
        res.status(403).json({
          success: false,
          message:
            "You are already registered. Your role cannot be changed. Contact admin if you need role change.",
        });
        return;
      }

      if (!user.googleId) {
        user.googleId = googleId;
        updated = true;
      }
      if (picture && !user.avatar) {
        user.avatar = picture;
        updated = true;
      }

      if (updated) await user.save();
    }

    const appToken = generateToken(user._id.toString());

    res.status(200).json({
      success: true,
      token: appToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Google login error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during Google login",
    });
  }
};

// @desc    Get top users by points
// @route   GET /api/auth/leaderboard
// @access  Public
export const getLeaderboard = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const users = await User.find({ role: "Student" })
      .select("name points")
      .sort({ points: -1 })
      .limit(10);

    res.status(200).json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Leaderboard error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching leaderboard",
    });
  }
};

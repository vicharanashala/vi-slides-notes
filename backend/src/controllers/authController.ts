import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import User from "../models/User";

// GOOGLE AUTH CALLBACK
export const googleAuth = async (req: Request, res: Response) => {
  try {
    const { credential, role } = req.body;
    
    if (!credential) {
      return res.status(400).json({ message: "Missing credential" });
    }

    // Decode Google JWT token (it comes in 3 parts separated by dots)
    // Step 1: Split by '.' to get [header, payload, signature]
    // Step 2: Take middle part (payload) which has user info
    // Step 3: Decode from base64 to readable text
    // Step 4: Convert text to JavaScript object
    const parts = credential.split('.');
    const payload = parts[1];
    const decodedText = Buffer.from(payload, 'base64').toString();
    const decoded = JSON.parse(decodedText);
    
    // Extract user information from decoded token
    const googleId = decoded.sub;  // Google's unique ID for this user
    const email = decoded.email;
    const name = decoded.name;
    const picture = decoded.picture;

    // Check if user exists
    let user = await User.findOne({ $or: [{ googleId }, { email }] });

    if (user) {
      // User exists - use their existing role
      const token = jwt.sign(
        { id: user._id, role: user.role },
        process.env.JWT_SECRET as string,
        { expiresIn: "7d" }
      );

      return res.status(200).json({
        message: "Authentication successful",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          picture: user.picture,
        },
      });
    }

    // New user - role is required
    if (!role) {
      return res.status(400).json({ message: "Role is required for new users" });
    }

    // Create new user with selected role
    user = await User.create({
      googleId,
      email,
      name,
      picture,
      role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET as string,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Authentication successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        picture: user.picture,
      },
    });
  } catch (error) {
    console.error("GOOGLE AUTH ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

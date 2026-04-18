import express from 'express';
import { OAuth2Client } from 'google-auth-library';
import { User } from '../models/User.js';
import jwt from 'jsonwebtoken';

const router = express.Router();
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

router.post('/google-login', async (req, res) => {
  const { token, role } = req.body;

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload) return res.status(400).json({ message: "Invalid Token" });

    const { sub: googleId, email, name } = payload;

    
    let user = await User.findOne({ googleId });

    
    if (!user && !role) {
      return res.json({ isNewUser: true });
    }

    
    if (!user && role) {
      user = await User.create({
        googleId,
        email,
        name,
        role: role
      });
    }

    
    if (!user) {
      return res.status(400).json({ message: "User creation failed" });
    }

    
    const sessionToken = jwt.sign(
      { id: user._id }, 
      process.env.JWT_SECRET || "fallback-secret", 
      { expiresIn: '3h' }
    );

    return res.json({ 
      user, 
      sessionToken, 
      isNewUser: false 
    });

  } catch (error) {
    console.error("AUTH ERROR:", error);
    return res.status(500).json({ message: "Auth failed" });
  }
});

export default router;
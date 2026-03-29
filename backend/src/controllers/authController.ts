import { Request, Response } from 'express';
import { validationResult } from 'express-validator';
import jwt from 'jsonwebtoken';
import { OAuth2Client } from 'google-auth-library';
import crypto from 'crypto';
import User, { IUser } from '../models/User';
import { sendPasswordResetEmail } from '../services/emailService';

// Augment express-serve-static-core
declare module 'express-serve-static-core' {
    interface Request {
        user?: IUser;
    }
}

// Generate JWT Token
const generateToken = (id: string): string => {
    const jwtSecret = process.env.JWT_SECRET;
    const jwtExpire = process.env.JWT_EXPIRE || '7d';

    if (!jwtSecret) {
        throw new Error('JWT_SECRET is not defined');
    }

    return jwt.sign({ id }, jwtSecret, {
        expiresIn: jwtExpire as any
    });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            });
            return;
        }

        const { name, email, password, role } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            res.status(400).json({
                success: false,
                message: 'User already exists with this email'
            });
            return;
        }

        // Create user
        const user = await User.create({
            name,
            email,
            password,
            role
        });

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(201).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during registration'
        });
    }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req: Request, res: Response): Promise<void> => {
    try {
        // Check for validation errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            res.status(400).json({
                success: false,
                errors: errors.array()
            });
            return;
        }

        const { email, password } = req.body;

        // Check if user exists (include password field)
        const user = await User.findOne({ email }).select('+password');
        if (!user) {
            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Check if account is locked
        if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
            const minutesLeft = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
            res.status(403).json({
                success: false,
                message: `Account temporarily locked due to too many failed attempts. Try again in ${minutesLeft} minutes.`
            });
            return;
        }

        // Check if password matches
        const isMatch = await user.comparePassword(password);
        if (!isMatch) {
            user.loginAttempts = (user.loginAttempts || 0) + 1;
            if (user.loginAttempts >= 5) {
                user.lockUntil = new Date(Date.now() + 15 * 60 * 1000); // Lock for 15 mins
            }
            await user.save();

            res.status(401).json({
                success: false,
                message: 'Invalid credentials'
            });
            return;
        }

        // Reset login attempts on success
        if (user.loginAttempts > 0) {
            user.loginAttempts = 0;
            user.lockUntil = undefined;
            await user.save();
        }

        // Generate token
        const token = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            token,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during login'
        });
    }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: req.user._id,
                name: req.user.name,
                email: req.user.email,
                role: req.user.role
            }
        });
    } catch (error) {
        console.error('GetMe error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error'
        });
    }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        if (!req.user) {
            res.status(401).json({
                success: false,
                message: 'Not authorized'
            });
            return;
        }

        const { name, email } = req.body;

        // If email is changing, check for duplicates
        if (email && email !== req.user.email) {
            const existingUser = await User.findOne({ email });
            if (existingUser) {
                res.status(400).json({
                    success: false,
                    message: 'Email is already in use'
                });
                return;
            }
        }

        const user = await User.findByIdAndUpdate(
            req.user.id,
            { name, email },
            { new: true, runValidators: true }
        );

        if (!user) {
            res.status(404).json({
                success: false,
                message: 'User not found'
            });
            return;
        }

        res.status(200).json({
            success: true,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error('UpdateDetails error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during update'
        });
    }
};

// @desc    Login with Google
// @route   POST /api/auth/google
// @access  Public
export const googleLogin = async (req: Request, res: Response): Promise<void> => {
    try {
        const { token, role } = req.body;
        const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

        // Verify the token
        const ticket = await client.verifyIdToken({
            idToken: token,
            audience: process.env.GOOGLE_CLIENT_ID
        });

        const payload = ticket.getPayload();
        if (!payload) {
            res.status(400).json({ success: false, message: 'Invalid Google Token' });
            return;
        }

        const { email, name, sub: googleId, picture } = payload;

        if (!email) {
            res.status(400).json({ success: false, message: 'Google token missing email' });
            return;
        }

        // Check if user exists
        let user = await User.findOne({ email });

        if (!user) {
            // Register new user
            const userRole = role === 'Teacher' || role === 'Student' ? role : 'Student';

            user = await User.create({
                name,
                email,
                googleId,
                role: userRole,
                avatar: picture
            });
        } else {
            // If user exists but has no googleId or avatar, update it
            let updated = false;
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

        // Generate token
        const appToken = generateToken(user._id.toString());

        res.status(200).json({
            success: true,
            token: appToken,
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                avatar: user.avatar
            }
        });

    } catch (error) {
        console.error('Google login error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during Google login'
        });
    }
};

// @desc    Forgot Password
// @route   POST /api/auth/forgotpassword
// @access  Public
export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        const user = await User.findOne({ email: req.body.email });

        if (!user) {
            // We return true even if user not found to prevent email enumeration
            res.status(200).json({ success: true, message: 'Email sent' });
            return;
        }

        // Get reset token
        const resetToken = user.getResetPasswordToken();

        await user.save({ validateBeforeSave: false });

        // Create reset url
        const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:5173';
        const resetUrl = `${frontendUrl}/reset-password/${resetToken}`;

        try {
            const emailResult = await sendPasswordResetEmail(user.email, resetUrl);

            if (!emailResult.success) {
                user.resetPasswordToken = undefined;
                user.resetPasswordExpire = undefined;
                await user.save({ validateBeforeSave: false });

                res.status(500).json({
                    success: false,
                    message: 'Email could not be sent. Please check backend SMTP configuration.'
                });
                return;
            }

            res.status(200).json({
                success: true,
                message: 'Email sent'
            });
        } catch (error) {
            user.resetPasswordToken = undefined;
            user.resetPasswordExpire = undefined;
            await user.save({ validateBeforeSave: false });

            res.status(500).json({
                success: false,
                message: 'Email could not be sent'
            });
        }
    } catch (error) {
        console.error('Forgot password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// @desc    Reset Password
// @route   PUT /api/auth/resetpassword/:resettoken
// @access  Public
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
    try {
        // Get hashed token
        const resetPasswordToken = crypto
            .createHash('sha256')
            .update(req.params.resettoken)
            .digest('hex');

        const user = await User.findOne({
            resetPasswordToken,
            resetPasswordExpire: { $gt: Date.now() }
        });

        if (!user) {
            res.status(400).json({
                success: false,
                message: 'Invalid or expired token'
            });
            return;
        }

        // Set new password
        user.password = req.body.password;
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // Force save to trigger bcrypt middleware
        await user.save();

        res.status(200).json({
            success: true,
            message: 'Password updated successfully'
        });
    } catch (error) {
        console.error('Reset password error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error during password reset'
        });
    }
};

// @desc    Get top users by points
// @route   GET /api/auth/leaderboard
// @access  Public
export const getLeaderboard = async (req: Request, res: Response): Promise<void> => {
    try {
        const users = await User.find({ role: 'Student' })
            .select('name points')
            .sort({ points: -1 })
            .limit(10);

        res.status(200).json({
            success: true,
            data: users
        });
    } catch (error) {
        console.error('Leaderboard error:', error);
        res.status(500).json({
            success: false,
            message: 'Server error fetching leaderboard'
        });
    }
};

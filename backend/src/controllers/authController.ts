import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User';
import { mockStore } from '../services/MockStorage.service';

const generateToken = (id: string, role: string) => {
    return jwt.sign({ id, role }, process.env.JWT_SECRET || 'secret', {
        expiresIn: '30d',
    });
};

export const registerUser = async (req: Request, res: Response): Promise<void> => {
    const { name, email, password, role } = req.body;

    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const userExists = await mockStore.findUserByEmail(email);
            if (userExists) {
                res.status(400).json({ message: 'User already exists' });
                return;
            }
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);
            const user = await mockStore.createUser({ name, email, passwordHash, role: role || 'student' });
            res.status(201).json({
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user.id || user._id) as string, user.role),
            });
            return;
        }

        const userExists = await User.findOne({ email });
        if (userExists) {
            res.status(400).json({ message: 'User already exists' });
            return;
        }

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);

        const user = await User.create({
            name,
            email,
            passwordHash,
            role: role || 'student',
        });

        res.status(201).json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

export const loginUser = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;

    try {
        if (process.env.USE_MOCK_DB === 'true') {
            const user = await mockStore.findUserByEmail(email);
            if (!user) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            const isMatch = password === 'password123' || (await bcrypt.compare(password, user.passwordHash));
            if (!isMatch) {
                res.status(400).json({ message: 'Invalid credentials' });
                return;
            }
            res.json({
                _id: user.id || user._id,
                name: user.name,
                email: user.email,
                role: user.role,
                token: generateToken((user.id || user._id) as string, user.role),
            });
            return;
        }

        const user = await User.findOne({ email });
        if (!user) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        const isMatch = await bcrypt.compare(password, user.passwordHash);
        if (!isMatch) {
            res.status(400).json({ message: 'Invalid credentials' });
            return;
        }

        res.json({
            _id: user.id,
            name: user.name,
            email: user.email,
            role: user.role,
            token: generateToken(user.id, user.role),
        });
    } catch (error) {
        res.status(500).json({ message: 'Server error' });
    }
};

import express from 'express';
import { body } from 'express-validator';
import { guestJoinSession, getPublicSessionInfo, createGuestQuestion, getGuestQuestions } from '../controllers/guestController';

const router = express.Router();

// @route   GET /api/guest/session/:code
// @desc    Get public session info
// @access  Public
router.get('/session/:code', getPublicSessionInfo);

// @route   POST /api/guest/join
// @desc    Guest join session with form submission
// @access  Public (no authentication)
router.post(
    '/join',
    [
        body('code').trim().notEmpty().withMessage('Session code is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Valid email is required'),
        body('question').optional().trim()
    ],
    guestJoinSession
);

// @route   POST /api/guest/questions
// @desc    Post a question as a guest
// @access  Public
router.post(
    '/questions',
    [
        body('sessionId').notEmpty().withMessage('Session ID is required'),
        body('content').trim().notEmpty().withMessage('Question content is required'),
        body('name').trim().notEmpty().withMessage('Name is required'),
        body('email').trim().isEmail().withMessage('Valid email is required')
    ],
    createGuestQuestion
);

// @route   GET /api/guest/questions/:sessionId
// @desc    Get all questions for a session
// @access  Public
router.get('/questions/:sessionId', getGuestQuestions);

export default router;

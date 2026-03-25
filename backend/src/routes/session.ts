import express, { Request, Response, NextFunction } from 'express';
import { body, param, validationResult } from 'express-validator';
import {
    createSession,
    joinSession,
    getSessionDetails,
    endSession,
    getActiveSession,
    pauseSession,
    leaveSession,
    getStudentSessions,
    getOrCreateQuerySession,
    updateQueryUrl
} from '../controllers/sessionController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

/**
 // @desc Utility middleware to check for validation errors from express-validator.
 // If errors exist, it blocks the request and returns a 400 response.
 */
const validateRequest = (req: Request, res: Response, next: NextFunction): void => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(400).json({
            success: false,
            message: 'Validation failed',
            errors: errors.array()
        });
        return; // Stop execution if validation fails
    }
    next(); // Proceed to the controller if valid
};

// GLOBAL MIDDLEWARE

// Apply authentication protection to all session routes.
// Users must be logged in (possess a valid JWT) to access any of these endpoints.
router.use(protect);

// SESSION FETCHING ROUTES

// @route   GET /api/sessions/current/active
// @desc    Get the active session for the current user (Teacher or Student)
router.get('/current/active', getActiveSession);

// @route   GET /api/sessions/student/history
// @desc    Get session history for a student (used for rendering certificates)
router.get('/student/history', getStudentSessions);

// @route   GET /api/sessions/query-mode
// @desc    Get or create a teacher's persistent query session
router.get('/query-mode', authorize('Teacher'), getOrCreateQuerySession);

// @route   GET /api/sessions/:code
// @desc    Get specific session details by its 6-character code
router.get(
    '/:code', 
    [
        param('code').trim().isLength({ min: 6, max: 6 }).withMessage('Invalid session code format'),
        validateRequest
    ], 
    getSessionDetails
);


// SESSION CREATION & JOINING ROUTES

// @route   POST /api/sessions
// @desc    Create a new standard session (Teacher only)
router.post(
    '/',
    authorize('Teacher'),
    [
        body('title')
            .trim()
            .notEmpty().withMessage('Session title is required')
            .isLength({ max: 100 }).withMessage('Title cannot exceed 100 characters'),
        body('description')
            .optional()
            .trim()
            .isLength({ max: 500 }).withMessage('Description cannot exceed 500 characters'),
        validateRequest // Execute validation
    ],
    createSession
);

// @route   POST /api/sessions/join
// @desc    Join an active session using a code (Students & Teachers)
router.post(
    '/join',
    [
        body('code')
            .trim()
            .notEmpty().withMessage('Session code is required')
            .isLength({ min: 6, max: 6 }).withMessage('Session code must be exactly 6 characters')
            .isAlphanumeric().withMessage('Session code can only contain letters and numbers')
            .toUpperCase(), // Auto-format to uppercase before reaching the controller
        validateRequest // Execute validation
    ],
    joinSession
);


// SESSION MANAGEMENT ROUTES (TEACHER)

// @route   PATCH /api/sessions/query-mode/url
// @desc    Update the custom URL for a teacher's query mode session
router.patch(
    '/query-mode/url', 
    authorize('Teacher'), 
    [
        body('url')
            .trim()
            .notEmpty().withMessage('URL is required')
            .isURL().withMessage('Please provide a valid URL format'),
        validateRequest
    ],
    updateQueryUrl
);

// @route   PATCH /api/sessions/:id/end
// @desc    Permanently end a session and generate an AI mood summary (Teacher only)
router.patch(
    '/:id/end', 
    authorize('Teacher'), 
    [
        param('id').isMongoId().withMessage('Invalid session ID format'),
        validateRequest
    ],
    endSession
);

// @route   PATCH /api/sessions/:id/pause
// @desc    Toggle Pause/Resume for an active session (Teacher only)
router.patch(
    '/:id/pause', 
    authorize('Teacher'), 
    [
        param('id').isMongoId().withMessage('Invalid session ID format'),
        validateRequest
    ],
    pauseSession
);


// SESSION DEPARTURE ROUTES

// @route   POST /api/sessions/:code/leave
// @desc    Leave an active session (records leave time for attendance)
router.post(
    '/:code/leave', 
    [
        param('code')
            .trim()
            .isLength({ min: 6, max: 6 }).withMessage('Invalid session code format'),
        validateRequest
    ],
    leaveSession
);

export default router;
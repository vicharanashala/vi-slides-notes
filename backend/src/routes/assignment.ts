import express from 'express';
import {
    createAssignment,
    getAllAssignments,
    getAssignmentById,
    updateAssignment,
    deleteAssignment,
    joinAssignmentGroup
} from '../controllers/assignmentController';
import { protect } from '../middleware/auth';

const router = express.Router();

// All routes require authentication
router.use(protect);

// @route   POST /api/assignments
// @desc    Create a new assignment
router.post('/', createAssignment);

// @route   GET /api/assignments
// @desc    Get all assignments (filtered by role)
router.get('/', getAllAssignments);

// @route   POST /api/assignments/join-group
// @desc    Join assignment group as student
router.post('/join-group', joinAssignmentGroup);

// @route   GET /api/assignments/:id
// @desc    Get assignment by ID
router.get('/:id', getAssignmentById);

// @route   PATCH /api/assignments/:id
// @desc    Update assignment
router.patch('/:id', updateAssignment);

// @route   DELETE /api/assignments/:id
// @desc    Delete assignment
router.delete('/:id', deleteAssignment);

export default router;

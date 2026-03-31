import express from 'express';
import { protect } from '../middleware/auth';
import {
    getMyAssignmentGroups,
    joinAssignmentGroup
} from '../controllers/assignmentGroupController';

const router = express.Router();

router.use(protect);

// @route   GET /api/assignment-groups/my
// @desc    Get joined assignment groups for current student
router.get('/my', getMyAssignmentGroups);

// @route   POST /api/assignment-groups/join
// @desc    Join assignment group by group ID
router.post('/join', joinAssignmentGroup);

export default router;

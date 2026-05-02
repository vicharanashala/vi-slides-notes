import express from 'express';
import {
    createSubject,
    getAllSubjects,
    getEnrolledSubjects,
    getSubjectById,
    requestToJoin,
    approveStudent,
    rejectStudent,
    removeStudent,
    getSubjectSessions,
    getSubjectAssignments,
    deleteSubject,
    updateSubject
} from '../controllers/subjectController';
import { protect, authorize } from '../middleware/auth';

const router = express.Router();

router.use(protect);

// General subject routes
router.post('/', authorize('Teacher'), createSubject);
router.get('/', getAllSubjects);
router.get('/enrolled', authorize('Student'), getEnrolledSubjects);

// Specific subject routes
router.get('/:id', getSubjectById);
router.patch('/:id', authorize('Teacher'), updateSubject);
router.delete('/:id', authorize('Teacher'), deleteSubject);

// Enrollment management
router.post('/:id/request-join', authorize('Student'), requestToJoin);
router.patch('/:id/approve/:studentId', authorize('Teacher'), approveStudent);
router.patch('/:id/reject/:studentId', authorize('Teacher'), rejectStudent);
router.delete('/:id/students/:studentId', authorize('Teacher'), removeStudent);

// Subject content
router.get('/:id/sessions', getSubjectSessions);
router.get('/:id/assignments', getSubjectAssignments);

export default router;

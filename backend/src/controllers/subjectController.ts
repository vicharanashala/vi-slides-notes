import { Request, Response } from 'express';
import Subject from '../models/Subject';
import Session from '../models/Session';
import Assignment from '../models/Assignment';
import mongoose from 'mongoose';

// @desc    Create a new subject
// @route   POST /api/subjects
// @access  Private (Teacher only)
export const createSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can create subjects' });
            return;
        }

        const { name, description } = req.body;

        if (!name?.trim()) {
            res.status(400).json({ success: false, message: 'Subject name is required' });
            return;
        }

        const subject = await Subject.create({
            name: name.trim(),
            description: description?.trim(),
            teacher: req.user._id,
            enrolledStudents: [],
            pendingRequests: []
        });

        await subject.populate('teacher', 'name email');

        res.status(201).json({ success: true, data: subject });
    } catch (error) {
        console.error('Create subject error:', error);
        res.status(500).json({ success: false, message: 'Server error creating subject' });
    }
};

// @desc    Get all subjects
//          Teacher -> own subjects
//          Student -> all subjects (with join status)
// @route   GET /api/subjects
// @access  Private
export const getAllSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        if (req.user?.role === 'Teacher') {
            const subjects = await Subject.find({ teacher: userId })
                .populate('teacher', 'name email')
                .populate('enrolledStudents', 'name email')
                .populate('pendingRequests', 'name email')
                .sort({ createdAt: -1 });

            res.status(200).json({ success: true, data: subjects });
        } else {
            // Students see all subjects with their enrollment status
            const subjects = await Subject.find()
                .populate('teacher', 'name email')
                .sort({ createdAt: -1 });

            const subjectsWithStatus = subjects.map(sub => {
                const isEnrolled = sub.enrolledStudents.some(
                    (s: any) => s.toString() === userId?.toString()
                );
                const isPending = sub.pendingRequests.some(
                    (s: any) => s.toString() === userId?.toString()
                );
                return {
                    _id: sub._id,
                    name: sub.name,
                    description: sub.description,
                    teacher: sub.teacher,
                    enrolledCount: sub.enrolledStudents.length,
                    createdAt: sub.createdAt,
                    status: isEnrolled ? 'enrolled' : isPending ? 'pending' : 'not_joined'
                };
            });

            res.status(200).json({ success: true, data: subjectsWithStatus });
        }
    } catch (error) {
        console.error('Get subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching subjects' });
    }
};

// @desc    Get enrolled subjects for student
// @route   GET /api/subjects/enrolled
// @access  Private (Student only)
export const getEnrolledSubjects = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        const subjects = await Subject.find({ enrolledStudents: userId })
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });

        // Attach ongoing session count for each subject
        const enriched = await Promise.all(subjects.map(async (sub) => {
            const ongoingSession = await Session.findOne({
                subject: sub._id,
                status: 'active'
            }).select('_id title code status');

            return {
                _id: sub._id,
                name: sub.name,
                description: sub.description,
                teacher: sub.teacher,
                enrolledCount: sub.enrolledStudents.length,
                createdAt: sub.createdAt,
                ongoingSession: ongoingSession || null
            };
        }));

        res.status(200).json({ success: true, data: enriched });
    } catch (error) {
        console.error('Get enrolled subjects error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get subject by ID
// @route   GET /api/subjects/:id
// @access  Private
export const getSubjectById = async (req: Request, res: Response): Promise<void> => {
    try {
        const subject = await Subject.findById(req.params.id)
            .populate('teacher', 'name email')
            .populate('enrolledStudents', 'name email')
            .populate('pendingRequests', 'name email');

        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        console.error('Get subject by ID error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Student requests to join a subject
// @route   POST /api/subjects/:id/request-join
// @access  Private (Student only)
export const requestToJoin = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Student') {
            res.status(403).json({ success: false, message: 'Only students can request to join subjects' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        const userId = req.user._id;

        const alreadyEnrolled = subject.enrolledStudents.some(
            s => s.toString() === userId.toString()
        );
        if (alreadyEnrolled) {
            res.status(400).json({ success: false, message: 'You are already enrolled in this subject' });
            return;
        }

        const alreadyPending = subject.pendingRequests.some(
            s => s.toString() === userId.toString()
        );
        if (alreadyPending) {
            res.status(400).json({ success: false, message: 'Your request is already pending approval' });
            return;
        }

        subject.pendingRequests.push(userId);
        await subject.save();

        res.status(200).json({ success: true, message: 'Join request sent. Waiting for teacher approval.' });
    } catch (error) {
        console.error('Request to join error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Teacher approves a student's join request
// @route   PATCH /api/subjects/:id/approve/:studentId
// @access  Private (Teacher only)
export const approveStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can approve students' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        if (subject.teacher.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to manage this subject' });
            return;
        }

        const studentId = new mongoose.Types.ObjectId(req.params.studentId);

        const isPending = subject.pendingRequests.some(
            s => s.toString() === studentId.toString()
        );
        if (!isPending) {
            res.status(400).json({ success: false, message: 'No pending request from this student' });
            return;
        }

        // Remove from pending, add to enrolled
        subject.pendingRequests = subject.pendingRequests.filter(
            s => s.toString() !== studentId.toString()
        ) as mongoose.Types.ObjectId[];

        subject.enrolledStudents.push(studentId);
        await subject.save();

        res.status(200).json({ success: true, message: 'Student approved and enrolled successfully' });
    } catch (error) {
        console.error('Approve student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Teacher rejects a student's join request
// @route   PATCH /api/subjects/:id/reject/:studentId
// @access  Private (Teacher only)
export const rejectStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can reject requests' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        if (subject.teacher.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to manage this subject' });
            return;
        }

        const studentId = req.params.studentId;
        subject.pendingRequests = subject.pendingRequests.filter(
            s => s.toString() !== studentId
        ) as mongoose.Types.ObjectId[];

        await subject.save();

        res.status(200).json({ success: true, message: 'Request rejected' });
    } catch (error) {
        console.error('Reject student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Remove/unenroll a student from subject (teacher action)
// @route   DELETE /api/subjects/:id/students/:studentId
// @access  Private (Teacher only)
export const removeStudent = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can remove students' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        if (subject.teacher.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const studentId = req.params.studentId;
        subject.enrolledStudents = subject.enrolledStudents.filter(
            s => s.toString() !== studentId
        ) as mongoose.Types.ObjectId[];

        await subject.save();

        res.status(200).json({ success: true, message: 'Student removed from subject' });
    } catch (error) {
        console.error('Remove student error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get sessions for a subject
// @route   GET /api/subjects/:id/sessions
// @access  Private
export const getSubjectSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        const sessions = await Session.find({ subject: subject._id })
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get subject sessions error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Get assignments for a subject
// @route   GET /api/subjects/:id/assignments
// @access  Private
export const getSubjectAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        const assignments = await Assignment.find({ subject: subject._id })
            .populate('teacher', 'name email')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: assignments });
    } catch (error) {
        console.error('Get subject assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Delete a subject
// @route   DELETE /api/subjects/:id
// @access  Private (Teacher only)
export const deleteSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can delete subjects' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        if (subject.teacher.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this subject' });
            return;
        }

        await subject.deleteOne();

        res.status(200).json({ success: true, message: 'Subject deleted successfully' });
    } catch (error) {
        console.error('Delete subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

// @desc    Update subject details
// @route   PATCH /api/subjects/:id
// @access  Private (Teacher only)
export const updateSubject = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role !== 'Teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can update subjects' });
            return;
        }

        const subject = await Subject.findById(req.params.id);
        if (!subject) {
            res.status(404).json({ success: false, message: 'Subject not found' });
            return;
        }

        if (subject.teacher.toString() !== req.user._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized' });
            return;
        }

        const { name, description } = req.body;
        if (name) subject.name = name.trim();
        if (description !== undefined) subject.description = description.trim();

        await subject.save();
        await subject.populate('teacher', 'name email');

        res.status(200).json({ success: true, data: subject });
    } catch (error) {
        console.error('Update subject error:', error);
        res.status(500).json({ success: false, message: 'Server error' });
    }
};

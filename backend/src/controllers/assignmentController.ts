import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import Submission from '../models/Submission';
import AssignmentGroupMembership from '../models/AssignmentGroupMembership';

// @desc    Create a new assignment
// @route   POST /api/assignments
// @access  Private (Teacher only)
export const createAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description, groupId, maxMarks, deadline, attachmentUrl } = req.body;

        // Validate teacher role
        if (req.user?.role?.toLowerCase() !== 'teacher') {
            res.status(403).json({ success: false, message: 'Only teachers can create assignments' });
            return;
        }

        const normalizedGroupId = typeof groupId === 'string' ? groupId.trim().toUpperCase() : '';
        if (!normalizedGroupId) {
            res.status(400).json({ success: false, message: 'groupId is required' });
            return;
        }

        const assignment = await Assignment.create({
            title,
            description,
            teacher: req.user._id,
            groupId: normalizedGroupId,
            maxMarks,
            deadline: new Date(deadline),
            attachmentUrl: attachmentUrl?.trim() || null,
            attachmentName: null
        });

        res.status(201).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Create assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error creating assignment' });
    }
};

// @desc    Get all assignments (filtered by role)
// @route   GET /api/assignments
// @access  Private
export const getAllAssignments = async (req: Request, res: Response): Promise<void> => {
    try {
        let assignments;
        const requestedGroupId = typeof req.query.groupId === 'string'
            ? req.query.groupId.trim().toUpperCase()
            : '';

        if (req.user?.role?.toLowerCase() === 'teacher') {
            // Teachers see only their assignments
            const teacherFilter: { teacher: unknown; groupId?: string } = { teacher: req.user._id };
            if (requestedGroupId) {
                teacherFilter.groupId = requestedGroupId;
            }

            assignments = await Assignment.find(teacherFilter)
                .populate('teacher', 'name email')
                .sort({ createdAt: -1 });
        } else {
            // Students see active assignments only for groups they have joined.
            const memberships = await AssignmentGroupMembership.find({ student: req.user?._id })
                .select('groupId -_id')
                .lean();

            const joinedGroupIds = memberships.map((membership) => membership.groupId);

            if (joinedGroupIds.length === 0) {
                res.status(200).json({
                    success: true,
                    data: []
                });
                return;
            }

            if (requestedGroupId && !joinedGroupIds.includes(requestedGroupId)) {
                res.status(200).json({
                    success: true,
                    data: []
                });
                return;
            }

            const groupFilter = requestedGroupId || { $in: joinedGroupIds };

            assignments = await Assignment.find({ status: 'active', groupId: groupFilter })
                .populate('teacher', 'name email')
                .sort({ deadline: 1 });
        }

        res.status(200).json({
            success: true,
            data: assignments
        });
    } catch (error) {
        console.error('Get assignments error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching assignments' });
    }
};

// @desc    Get assignment by ID
// @route   GET /api/assignments/:id
// @access  Private
export const getAssignmentById = async (req: Request, res: Response): Promise<void> => {
    try {
        const assignment = await Assignment.findById(req.params.id)
            .populate('teacher', 'name email');

        if (!assignment) {
            res.status(404).json({ success: false, message: 'Assignment not found' });
            return;
        }

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Get assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching assignment' });
    }
};

// @desc    Update assignment
// @route   PATCH /api/assignments/:id
// @access  Private (Teacher only - own assignments)
export const updateAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            res.status(404).json({ success: false, message: 'Assignment not found' });
            return;
        }

        // Check if user is the teacher who created this assignment
        if (assignment.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to update this assignment' });
            return;
        }

        const { title, description, groupId, maxMarks, deadline, status, attachmentUrl } = req.body;

        if (title) assignment.title = title;
        if (description) assignment.description = description;
        if (groupId) assignment.groupId = groupId.toString().trim().toUpperCase();
        if (maxMarks) assignment.maxMarks = maxMarks;
        if (deadline) assignment.deadline = new Date(deadline);
        if (status) assignment.status = status;
        if (attachmentUrl !== undefined) {
            assignment.attachmentUrl = attachmentUrl?.trim() || null;
            assignment.attachmentName = null;
        }

        await assignment.save();

        res.status(200).json({
            success: true,
            data: assignment
        });
    } catch (error) {
        console.error('Update assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error updating assignment' });
    }
};

// @desc    Delete assignment
// @route   DELETE /api/assignments/:id
// @access  Private (Teacher only - own assignments)
export const deleteAssignment = async (req: Request, res: Response): Promise<void> => {
    try {
        const assignment = await Assignment.findById(req.params.id);

        if (!assignment) {
            res.status(404).json({ success: false, message: 'Assignment not found' });
            return;
        }

        // Check if user is the teacher who created this assignment
        if (assignment.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Not authorized to delete this assignment' });
            return;
        }

        // Delete all submissions for this assignment
        await Submission.deleteMany({ assignment: assignment._id });

        // Delete the assignment
        await assignment.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Assignment and all submissions deleted successfully'
        });
    } catch (error) {
        console.error('Delete assignment error:', error);
        res.status(500).json({ success: false, message: 'Server error deleting assignment' });
    }
};

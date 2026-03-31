import { Request, Response } from 'express';
import Assignment from '../models/Assignment';
import AssignmentGroupMembership from '../models/AssignmentGroupMembership';

// @desc    Join an assignment group
// @route   POST /api/assignment-groups/join
// @access  Private (Student only)
export const joinAssignmentGroup = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role?.toLowerCase() !== 'student') {
            res.status(403).json({ success: false, message: 'Only students can join assignment groups' });
            return;
        }

        const rawGroupId = typeof req.body.groupId === 'string' ? req.body.groupId : '';
        const groupId = rawGroupId.trim().toUpperCase();

        if (!groupId) {
            res.status(400).json({ success: false, message: 'groupId is required' });
            return;
        }

        const groupExists = await Assignment.exists({ groupId });
        if (!groupExists) {
            res.status(404).json({ success: false, message: 'No assignments found for this group ID' });
            return;
        }

        const existingMembership = await AssignmentGroupMembership.findOne({
            student: req.user._id,
            groupId
        });

        if (existingMembership) {
            res.status(200).json({
                success: true,
                data: existingMembership,
                message: 'Already joined this group'
            });
            return;
        }

        const membership = await AssignmentGroupMembership.create({
            student: req.user._id,
            groupId
        });

        res.status(201).json({
            success: true,
            data: membership,
            message: 'Joined assignment group successfully'
        });
    } catch (error) {
        console.error('Join assignment group error:', error);
        res.status(500).json({ success: false, message: 'Server error joining assignment group' });
    }
};

// @desc    Get joined assignment groups for current student
// @route   GET /api/assignment-groups/my
// @access  Private (Student only)
export const getMyAssignmentGroups = async (req: Request, res: Response): Promise<void> => {
    try {
        if (req.user?.role?.toLowerCase() !== 'student') {
            res.status(403).json({ success: false, message: 'Only students can view assignment groups' });
            return;
        }

        const groups = await AssignmentGroupMembership.find({ student: req.user._id })
            .select('groupId joinedAt')
            .sort({ joinedAt: -1 })
            .lean();

        res.status(200).json({
            success: true,
            data: groups
        });
    } catch (error) {
        console.error('Get assignment groups error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching assignment groups' });
    }
};

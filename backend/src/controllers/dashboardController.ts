import { Request, Response } from 'express';
import Session from '../models/Session';
import Assignment from '../models/Assignment';
import AssignmentGroupMembership from '../models/AssignmentGroupMembership';

// @desc    Get dashboard metrics by role
// @route   GET /api/dashboard/:role
// @access  Private
export const getDashboardByRole = async (req: Request, res: Response): Promise<void> => {
    try {
        const requestedRole = String(req.params.role || '').trim().toLowerCase();
        const currentUserRole = String(req.user?.role || '').trim().toLowerCase();

        if (requestedRole !== currentUserRole) {
            res.status(403).json({ success: false, message: 'Not authorized for this dashboard' });
            return;
        }

        if (requestedRole !== 'teacher') {
            res.status(200).json({
                success: true,
                message: 'Dashboard metrics loaded',
                role: requestedRole,
                metrics: {},
                actions: []
            });
            return;
        }

        const teacherId = req.user?._id;

        const [sessionsConducted, liveSessions, totalAssignments] = await Promise.all([
            Session.countDocuments({ teacher: teacherId, status: 'ended' }),
            Session.countDocuments({ teacher: teacherId, status: { $in: ['active', 'paused'] } }),
            Assignment.countDocuments({ teacher: teacherId })
        ]);

        const teacherAssignments = await Assignment.find({ teacher: teacherId }).select('groupId -_id').lean();
        const assignmentGroupIds = Array.from(new Set(
            teacherAssignments
                .map((assignment) => assignment.groupId)
                .filter((groupId): groupId is string => Boolean(groupId))
        ));

        const studentIdsFromAssignments = assignmentGroupIds.length > 0
            ? await AssignmentGroupMembership.distinct('student', { groupId: { $in: assignmentGroupIds } })
            : [];

        const studentIdsFromSessions = await Session.distinct('students', { teacher: teacherId });

        const uniqueStudentIds = new Set<string>([
            ...studentIdsFromAssignments.map((id) => id.toString()),
            ...studentIdsFromSessions.map((id) => id.toString())
        ]);

        res.status(200).json({
            success: true,
            message: 'Teacher dashboard metrics loaded in real time',
            role: 'teacher',
            metrics: {
                sessionsConducted,
                liveSessions,
                totalAssignments,
                totalStudents: uniqueStudentIds.size
            },
            actions: ['create_session', 'manage_assignments', 'view_submissions']
        });
    } catch (error) {
        console.error('Get dashboard error:', error);
        res.status(500).json({ success: false, message: 'Server error loading dashboard metrics' });
    }
};
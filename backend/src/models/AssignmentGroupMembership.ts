import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignmentGroupMembership extends Document {
    student: mongoose.Types.ObjectId;
    groupId: string;
    joinedAt: Date;
}

const assignmentGroupMembershipSchema = new Schema<IAssignmentGroupMembership>({
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    groupId: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: false
});

assignmentGroupMembershipSchema.index({ student: 1, groupId: 1 }, { unique: true });
assignmentGroupMembershipSchema.index({ student: 1, joinedAt: -1 });

const AssignmentGroupMembership = mongoose.model<IAssignmentGroupMembership>(
    'AssignmentGroupMembership',
    assignmentGroupMembershipSchema
);

export default AssignmentGroupMembership;

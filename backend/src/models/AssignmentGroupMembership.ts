import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignmentGroupMembership extends Document {
    groupId: string;
    student: mongoose.Types.ObjectId;
    joinedAt: Date;
}

const AssignmentGroupMembershipSchema = new Schema<IAssignmentGroupMembership>({
    groupId: {
        type: String,
        required: true,
        trim: true,
        uppercase: true
    },
    student: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    joinedAt: {
        type: Date,
        default: Date.now
    }
}, {
    timestamps: true
});

AssignmentGroupMembershipSchema.index({ groupId: 1, student: 1 }, { unique: true });

export default mongoose.model<IAssignmentGroupMembership>('AssignmentGroupMembership', AssignmentGroupMembershipSchema);

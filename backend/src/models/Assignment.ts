import mongoose, { Document, Schema } from 'mongoose';

export interface IAssignment extends Document {
    title: string;
    description: string;
    teacher: mongoose.Types.ObjectId;
    groupId: string;
    maxMarks: number;
    deadline: Date;
    attachmentUrl?: string | null;
    attachmentName?: string | null;
    createdAt: Date;
    status: 'active' | 'closed';
}

const AssignmentSchema = new Schema<IAssignment>({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        required: true
    },
    teacher: {
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
    maxMarks: {
        type: Number,
        required: true,
        min: 1
    },
    deadline: {
        type: Date,
        required: true
    },
    attachmentUrl: {
        type: String,
        default: null
    },
    attachmentName: {
        type: String,
        default: null
    },
    status: {
        type: String,
        enum: ['active', 'closed'],
        default: 'active'
    }
}, {
    timestamps: true
});

AssignmentSchema.index({ teacher: 1, groupId: 1, createdAt: -1 });
AssignmentSchema.index({ groupId: 1, status: 1, deadline: 1 });

export default mongoose.model<IAssignment>('Assignment', AssignmentSchema);

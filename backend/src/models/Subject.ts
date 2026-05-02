import mongoose, { Document, Schema } from 'mongoose';

export interface ISubject extends Document {
    name: string;
    description?: string;
    teacher: mongoose.Types.ObjectId;
    enrolledStudents: mongoose.Types.ObjectId[];
    pendingRequests: mongoose.Types.ObjectId[];
    createdAt: Date;
}

const subjectSchema = new Schema<ISubject>({
    name: {
        type: String,
        required: [true, 'Please provide a subject name'],
        trim: true,
        maxlength: [100, 'Subject name cannot exceed 100 characters']
    },
    description: {
        type: String,
        trim: true,
        maxlength: [500, 'Description cannot exceed 500 characters']
    },
    teacher: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    enrolledStudents: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    pendingRequests: [{
        type: Schema.Types.ObjectId,
        ref: 'User'
    }],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Subject = mongoose.model<ISubject>('Subject', subjectSchema);
export default Subject;

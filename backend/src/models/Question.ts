import mongoose, { Schema, Document } from 'mongoose';

export interface IQuestion extends Document {
    id?: string;
    sessionCode: string;
    question: string;
    isAnonymous: boolean;
    status: 'pending' | 'answered_ai' | 'answered_teacher';
    complexity: number;
    cognitiveLevel?: string;
    aiSuggestedAnswer?: string;
    category?: string;
}

const QuestionSchema: Schema = new Schema({
    sessionCode: { type: String, required: true },
    question: { type: String, required: true },
    isAnonymous: { type: Boolean, default: false },
    status: { type: String, enum: ['pending', 'answered_ai', 'answered_teacher'], default: 'pending' },
    complexity: { type: Number, default: 0 },
    cognitiveLevel: { type: String },
    aiSuggestedAnswer: { type: String },
    category: { type: String }
}, { timestamps: true });

export default mongoose.model<IQuestion>('Question', QuestionSchema);

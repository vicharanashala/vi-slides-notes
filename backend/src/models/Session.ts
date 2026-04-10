import mongoose, { Schema, Document } from 'mongoose';

export interface ISession extends Document {
    id?: string;
    teacherId: mongoose.Types.ObjectId;
    sessionCode: string;
    isActive: boolean; // Retained for backwards compatibility if needed
    status: 'active' | 'paused' | 'ended';
    mood: string;
}

const SessionSchema: Schema = new Schema({
    teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    sessionCode: { type: String, required: true, unique: true },
    isActive: { type: Boolean, default: true },
    status: { type: String, enum: ['active', 'paused', 'ended'], default: 'active' },
    mood: { type: String, default: 'neutral' },
}, { timestamps: true });

export default mongoose.model<ISession>('Session', SessionSchema);

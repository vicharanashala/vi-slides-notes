import mongoose, { Schema, Document } from 'mongoose';

export interface IUser extends Document {
    id?: string;
    name: string;
    email: string;
    passwordHash: string;
    role: 'teacher' | 'student';
}

const UserSchema: Schema = new Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    passwordHash: { type: String, required: true },
    role: { type: String, enum: ['teacher', 'student'], default: 'student' }
}, { timestamps: true });

export default mongoose.model<IUser>('User', UserSchema);

import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema({
  googleId: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  name: { type: String, required: true },
  role: { type: String, enum: ['teacher', 'student'], default: 'student' }
});

export const User = mongoose.model('User', UserSchema);
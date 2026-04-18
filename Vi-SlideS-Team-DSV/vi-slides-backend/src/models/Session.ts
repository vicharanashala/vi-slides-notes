import mongoose from 'mongoose';

const SessionSchema = new mongoose.Schema({
  sessionCode: { type: String, required: true, unique: true },
  teacherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['active', 'paused', 'ended'], default: 'active' },
  moodSummary: { type: String, default: "" },
  createdAt: { type: Date, default: Date.now }
});

export const Session = mongoose.model('Session', SessionSchema);
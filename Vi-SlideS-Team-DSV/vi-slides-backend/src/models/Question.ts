// import mongoose from 'mongoose';

// const QuestionSchema = new mongoose.Schema({
//   sessionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Session', required: true },
//   studentId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // Optional if anonymous
//   text: { type: String, required: true },
//   aiAnswer: { type: String, default: "" },
//   isComplex: { type: Boolean, default: false }, // If true, routes to teacher
//   isAnsweredByAI: { type: Boolean, default: false },
//   createdAt: { type: Date, default: Date.now }
// });

// export const Question = mongoose.model('Question', QuestionSchema);
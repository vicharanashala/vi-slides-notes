import mongoose, { Schema, Document, Model } from "mongoose";

/**
 * Interface for Poll documents
 * Stores poll questions, options, and student responses
 */
export interface IPoll extends Document {
  classId: mongoose.Types.ObjectId;    // Reference to the class
  question: string;                     // The poll question
  options: string[];                    // Array of answer options
  responses: {                          // Tracks who voted for what
    userId: mongoose.Types.ObjectId;
    selectedOption: number;             // Index of the selected option
  }[];
  isActive: boolean;                    // Poll open/closed state
  createdBy: mongoose.Types.ObjectId;  // Instructor who created it
  createdAt: Date;                      // Timestamp
}

const pollSchema: Schema<IPoll> = new Schema(
  {
    classId: {
      type: Schema.Types.ObjectId,
      ref: "class",
      required: true,
    },
    question: { type: String, required: true },
    options: [{ type: String, required: true }],
    responses: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        selectedOption: { type: Number, required: true },
      },
    ],
    isActive: { type: Boolean, default: true },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
  },
  { timestamps: true }
);

const pollModel: Model<IPoll> = mongoose.model<IPoll>("poll", pollSchema);
export default pollModel;
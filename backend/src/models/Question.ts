import mongoose, { Document, Schema } from "mongoose";

export interface IQuestion extends Document {
  content: string;
  user?: mongoose.Types.ObjectId;
  guestName?: string;
  guestEmail?: string;
  session: mongoose.Types.ObjectId;

  status: "active" | "archived";
  analysisStatus: "not_requested" | "pending" | "completed" | "failed";

  refinementStatus?: "pending" | "completed" | "failed";
  refinedContent?: string;
  originalContent?: string;
  refinementTimestamp?: Date;

  upvotes: mongoose.Types.ObjectId[];
  isPinned: boolean;
  isDirectToTeacher: boolean;

  teacherAnswer?: string;
  teacherAnsweredAt?: Date;

  aiAnalysis?: {
    complexity?: "simple" | "complex";
    aiAnswer?: string;
    sentiment?: string;
    cognitiveLevel?: string;
    answeredBy?: "ai" | "teacher";
  };

  createdAt: Date;
}

const questionSchema = new Schema<IQuestion>({
  content: {
    type: String,
    required: [true, "Question content is required"],
    trim: true,
    maxlength: [500, "Question cannot be more than 500 characters"],
  },

  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: false,
  },

  guestName: {
    type: String,
    trim: true,
    maxlength: [100, "Guest name cannot be more than 100 characters"],
  },

  guestEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },

  session: {
    type: Schema.Types.ObjectId,
    ref: "Session",
    required: true,
  },

  status: {
    type: String,
    enum: ["active", "archived"],
    default: "active",
  },

  analysisStatus: {
    type: String,
    enum: ["not_requested", "pending", "completed", "failed"],
    default: "not_requested",
  },

  refinementStatus: {
    type: String,
    enum: ["pending", "completed", "failed"],
    default: undefined,
  },

  refinedContent: {
    type: String,
    trim: true,
    maxlength: [500, "Refined question cannot be more than 500 characters"],
  },

  originalContent: {
    type: String,
    trim: true,
    maxlength: [500, "Original question cannot be more than 500 characters"],
  },

  refinementTimestamp: {
    type: Date,
    default: null,
  },

  upvotes: [
    {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  ],

  isPinned: {
    type: Boolean,
    default: false,
  },

  isDirectToTeacher: {
    type: Boolean,
    default: false,
  },

  teacherAnswer: {
    type: String,
    trim: true,
  },

  teacherAnsweredAt: {
    type: Date,
  },

  aiAnalysis: {
    complexity: {
      type: String,
      enum: ["simple", "complex"],
    },

    aiAnswer: {
      type: String,
      trim: true,
    },

    sentiment: {
      type: String,
    },

    cognitiveLevel: {
      type: String,
    },

    answeredBy: {
      type: String,
      enum: ["ai", "teacher"],
      default: null,
    },
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },
});

// Index for faster queries
questionSchema.index({ session: 1, createdAt: -1 });

const Question = mongoose.model<IQuestion>("Question", questionSchema);

export default Question;

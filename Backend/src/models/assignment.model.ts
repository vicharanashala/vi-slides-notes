import mongoose, { Document, Schema, Model } from "mongoose";

// ------------------- INTERFACE -------------------
export interface IAssignment extends Document {
  title: string;
  description: string;
  createdBy: mongoose.Types.ObjectId;
  dueDate: Date;
  maxMarks: number;

  submissions: {
    student: mongoose.Types.ObjectId;
    fileUrl: string;
    submittedAt: Date;
  }[];

  createdAt: Date;
  updatedAt: Date;
}

// ------------------- SUBMISSION SCHEMA -------------------
const submissionSchema = new Schema(
  {
    student: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

// ------------------- ASSIGNMENT SCHEMA -------------------
const assignmentSchema: Schema<IAssignment> = new Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      required: true,
    },

    createdBy: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },

    dueDate: {
      type: Date,
      required: true,
    },

    maxMarks: {
      type: Number,
      required: true,
      min: 0,
    },

    submissions: [submissionSchema],
  },
  {
    timestamps: true,
  }
);

const assignmentModel: Model<IAssignment> = mongoose.model(
  "assignment",
  assignmentSchema
);

export default assignmentModel;
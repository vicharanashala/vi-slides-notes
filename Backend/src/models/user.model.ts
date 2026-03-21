import mongoose, { Document, Schema, Model } from "mongoose";

// ------------------- INTERFACE -------------------
export interface IUser extends Document {
  fullname: string;
  email: string;
  password: string;
  role: "Student" | "Instructor";
  createdAt: Date;
  updatedAt: Date;
}

// ------------------- SCHEMA -------------------
const userSchema: Schema<IUser> = new Schema(
  {
    fullname: { type: String, required: true, trim: true },
    email: { type: String, unique: true, required: true, lowercase: true },
    password: { type: String, required: true },
    role: {
      type: String,
      enum: ["Student", "Instructor"],
      required: true,
      default: "Student",
    },
  },
  { timestamps: true }
);

// ------------------- MODEL -------------------
const userModel: Model<IUser> = mongoose.model<IUser>(
  "user",
  userSchema
);

export default userModel;
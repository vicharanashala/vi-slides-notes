import mongoose, { Schema, Document } from "mongoose";

export type UserRole = "teacher" | "student";
export type AuthProvider = "local" | "google";

export interface IUser extends Document {
  email: string;
  password?: string;
  role?: UserRole;
  provider: AuthProvider;
  providerId?: string;
  displayName?: string;
  avatarUrl?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

const userSchema = new Schema<IUser>({
  email:      { type: String, required: true, unique: true, trim: true, lowercase: true },
  password:   { type: String },
  role:       { type: String, enum: ["teacher", "student"] },
  provider:   { type: String, enum: ["local", "google"], default: "local" },
  providerId: { type: String, unique: true, sparse: true },
  displayName:{ type: String, trim: true },
  avatarUrl:  { type: String, trim: true },
}, {
  timestamps: true,
});

export default mongoose.model<IUser>("User", userSchema);
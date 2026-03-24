import mongoose, { Document, Schema } from "mongoose";
import bcrypt from "bcryptjs";

// Interface
export interface IUser extends Document {
  name: string;
  email: string;
  password?: string;
  role: "Teacher" | "Student";
  comparePassword(candidatePassword: string): Promise<boolean>;
}

// Schema
const userSchema = new Schema<IUser>({
  name: {
    type: String,
    required: true,
  },

  email: {
    type: String,
    required: true,
    unique: true,
  },

  password: {
    type: String,
    required: true,
    select: false,
  },

  role: {
    type: String,
    enum: ["Teacher", "Student"],
    default: "Student",
  },
});

// 🔐 HASH PASSWORD (ONLY HERE)
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) return next();

  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password!, salt);

  next();
});

// 🔐 COMPARE PASSWORD
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password!);
};

// Export
const User = mongoose.model<IUser>("User", userSchema);
export default User;
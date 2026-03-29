import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export interface IUser extends Document {
    name: string;
    email: string;
    password?: string;
    role: 'Teacher' | 'Student';
    googleId?: string;
    avatar?: string;
    points: number;
    bookmarks: {
        sessionTitle: string;
        sessionCode: string;
        timestamp: Date;
    }[];
    createdAt: Date;
    resetPasswordToken?: string;
    resetPasswordExpire?: Date;
    loginAttempts: number;
    lockUntil?: Date;
    comparePassword(candidatePassword: string): Promise<boolean>;
    getResetPasswordToken(): string;
}

const userSchema = new Schema<IUser>({
    name: {
        type: String,
        required: [true, 'Please add a name'],
        trim: true
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        lowercase: true,
        trim: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    password: {
        type: String,
        required: function (this: IUser) { return !this.googleId; }, // Password required only if not Google Login
        minlength: 6,
        select: false // Don't return password by default
    },
    role: {
        type: String,
        enum: ['Teacher', 'Student'],
        default: 'Student'
    },
    googleId: {
        type: String,
        unique: true,
        sparse: true // Allow null/undefined values to be unique (though unique index ignores null usually, sparse is safer)
    },
    avatar: {
        type: String
    },
    points: {
        type: Number,
        default: 0
    },
    bookmarks: [{
        sessionTitle: String,
        sessionCode: String,
        timestamp: { type: Date, default: Date.now }
    }],
    createdAt: {
        type: Date,
        default: Date.now
    },
    resetPasswordToken: String,
    resetPasswordExpire: Date,
    loginAttempts: {
        type: Number,
        required: true,
        default: 0
    },
    lockUntil: Date
});

// Hash password before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
        return;
    }

    if (this.password) {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    }
    next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
    return await bcrypt.compare(candidatePassword, this.password);
};

// Generate and hash password token
userSchema.methods.getResetPasswordToken = function (): string {
    // Generate token
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash token and set to resetPasswordToken field
    this.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Set expire (10 minutes)
    this.resetPasswordExpire = new Date(Date.now() + 10 * 60 * 1000);

    return resetToken;
};

const User = mongoose.model<IUser>('User', userSchema);

export default User;

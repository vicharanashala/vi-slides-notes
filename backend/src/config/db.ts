import mongoose from 'mongoose';

const connectDB = async () => {
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/vislides');
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${(error as Error).message}`);
        if (process.env.USE_MOCK_DB !== 'true') {
            process.exit(1);
        } else {
            console.log('Mock Mode Active: Continuing without MongoDB...');
        }
    }
};

export default connectDB;

import express, { Application, Request, Response } from "express";
import http from "http";
import dotenv from "dotenv";
import cors from "cors";
import connectDB from "./config/database";
import { initSocket } from "./config/socket";

import authRoutes from "./routes/auth";
import sessionRoutes from "./routes/session";
import questionRoutes from "./routes/question";
import pollRoutes from "./routes/poll";
import assignmentRoutes from "./routes/assignment";
import submissionRoutes from "./routes/submission";
import guestRoutes from "./routes/guest";

dotenv.config();

const app: Application = express();
const server = http.createServer(app);

const startServer = async () => {
    try {
        await connectDB();

        initSocket(server);

        app.use(cors());
        app.use(express.json());
        app.use(express.urlencoded({ extended: true }));

        app.use("/api/auth", authRoutes);
        app.use("/api/sessions", sessionRoutes);
        app.use("/api/questions", questionRoutes);
        app.use("/api/polls", pollRoutes);
        app.use("/api/assignments", assignmentRoutes);
        app.use("/api/submissions", submissionRoutes);
        app.use("/api/guest", guestRoutes);

        app.get("/api/health", (req: Request, res: Response) => {
            res.status(200).json({
                success: true,
                message: "Vi-SlideS API is running with Real-time support",
                timestamp: new Date().toISOString()
            });
        });

        app.use((req: Request, res: Response) => {
            res.status(404).json({
                success: false,
                message: "Route not found"
            });
        });

        const PORT = process.env.PORT || 5001;

        server.listen(PORT, () => {
            console.log(`🚀 Server running on port ${PORT}`);
            console.log(`📡 Environment: ${process.env.NODE_ENV}`);
            console.log(`🔌 Real-time Socket.io initialized`);
        });

    } catch (error) {
        console.error("❌ Server startup failed:", error);
        process.exit(1);
    }
};

startServer();

export default app;
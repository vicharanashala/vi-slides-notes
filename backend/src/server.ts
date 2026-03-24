import express from 'express';
import http from 'http';
import cors from 'cors';
import dotenv from 'dotenv';

import connectDB from './config/database';
import { initSocket } from './config/socket';

import authRoutes from './routes/auth';
import sessionRoutes from './routes/session';
import questionRoutes from './routes/question';

import pollRoutes from "./routes/poll";


dotenv.config();

const app = express();
const server = http.createServer(app);

initSocket(server);
connectDB();

app.use(cors());
app.use(express.json());

app.use("/api/polls", pollRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/questions', questionRoutes);

app.get('/api/health', (req, res) => {
  res.json({ success: true });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: 'Route not found' });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on ${PORT}`));
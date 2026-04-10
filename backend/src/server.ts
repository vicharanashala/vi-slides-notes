import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import http from 'http';
import { Server } from 'socket.io';
import connectDB from './config/db';
import authRoutes from './routes/authRoutes';
import sessionRoutes from './routes/sessionRoutes';
import aiRoutes from './routes/ai.routes';
import analyticsRoutes from './routes/analyticsRoutes';
import { analyzeQuestionPrompt } from './services/ai.service';
import Question from './models/Question';

dotenv.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: { origin: '*' }
});

const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());
connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/analytics', analyticsRoutes);

app.get('/api/questions/:sessionCode', async (req, res) => {
    try {
        const questions = await Question.find({ sessionCode: req.params.sessionCode }).sort('-createdAt');
        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching questions' });
    }
});

io.on('connection', (socket) => {
    let currentRoom: string | null = null;

    socket.on('join_session', (sessionCode) => {
        socket.join(sessionCode);
        currentRoom = sessionCode;
        const roomSize = io.sockets.adapter.rooms.get(sessionCode)?.size || 0;
        io.to(sessionCode).emit('member_count', roomSize);
    });

    socket.on('send_question', async (data) => {
        try {
            // Start triage
            const analysis = await analyzeQuestionPrompt(data.question);
            // stricter threshold so AI doesn't gobble up all questions
            const isAutoAnswerable = analysis && analysis.complexity <= 4;

            const savedQuestion = await Question.create({
                sessionCode: data.sessionCode,
                question: data.question,
                isAnonymous: data.isAnonymous,
                complexity: analysis?.complexity || 5,
                category: analysis?.category || 'General',
                aiSuggestedAnswer: analysis?.suggestedAnswer || '',
                status: isAutoAnswerable ? 'answered_ai' : 'pending'
            });

            if (!isAutoAnswerable) {
                io.to(data.sessionCode).emit('receive_question', {
                    id: savedQuestion._id.toString(),
                    tempId: data.tempId,
                    question: savedQuestion.question,
                    isAnonymous: savedQuestion.isAnonymous,
                    complexity: savedQuestion.complexity,
                    timestamp: new Date().toISOString()
                });
            } else {
                socket.emit('auto_answer', {
                    questionId: savedQuestion._id.toString(),
                    tempId: data.tempId,
                    question: data.question,
                    answer: analysis.suggestedAnswer
                });
                // Broadcast to Teacher's screen and others, excluding the sender
                socket.to(data.sessionCode).emit('receive_question', {
                    id: savedQuestion._id.toString(),
                    tempId: data.tempId,
                    question: savedQuestion.question,
                    isAnonymous: savedQuestion.isAnonymous,
                    complexity: savedQuestion.complexity,
                    status: 'answered_ai',
                    aiSuggestedAnswer: analysis.suggestedAnswer,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error('Error processing question:', error);
        }
    });

    socket.on('slide_update', (data) => {
        io.to(data.sessionCode).emit('slide_update', data);
    });

    socket.on('session_status_change', (data) => {
        io.to(data.sessionCode).emit('session_status_change', data);
    });

    socket.on('escalate_question', async (data) => {
        try {
            await Question.findByIdAndUpdate(data.questionId, { status: 'pending' });
            const q = await Question.findById(data.questionId);
            if (q) {
                // Forward to teacher
                io.to(q.sessionCode).emit('receive_question', {
                    id: q._id.toString(),
                    question: q.question,
                    isAnonymous: q.isAnonymous,
                    complexity: q.complexity,
                    timestamp: (q as any).createdAt
                });
            }
        } catch (e) { console.error(e) }
    });

    socket.on('request_ai_answer', async (data) => {
        try {
            const q = await Question.findById(data.questionId);
            if (q) {
                const analysis = await analyzeQuestionPrompt(q.question);
                socket.emit('ai_assist_result', { questionId: data.questionId, answer: analysis?.suggestedAnswer || '' });
            }
        } catch (e) { }
    });

    socket.on('teacher_reply', async (data) => {
        try {
            await Question.findByIdAndUpdate(data.questionId, { status: 'answered_teacher', aiSuggestedAnswer: data.answer });
            io.to(data.sessionCode).emit('receive_teacher_reply', data);
        } catch (e) { }
    });

    socket.on('disconnect', () => {
        if (currentRoom) {
            const roomSize = io.sockets.adapter.rooms.get(currentRoom)?.size || 0;
            io.to(currentRoom).emit('member_count', roomSize);
        }
    });
});

app.get('/', (req, res) => res.send('Vi-SlideS Core API is running'));

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));

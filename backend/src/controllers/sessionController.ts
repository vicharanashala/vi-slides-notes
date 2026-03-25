import { Request, Response } from 'express';
import Session from '../models/Session';
import Question from '../models/Question';
import { emitToSession } from '../config/socket';
import { generateMoodSummary } from '../services/aiService';
import QRCode from 'qrcode';
import os from 'os';

/**
 * Helper to determine the best local or public URL for QR code generation.
 * This ensures the QR code points to the correct network address.
 */
const getLocalUrl = (): string => {
    // High priority: Explicit PUBLIC_URL (e.g., ngrok, tunnel, domain)
    if (process.env.PUBLIC_URL) {
        return process.env.PUBLIC_URL.replace(/\/$/, '');
    }

    // Medium priority: FRONTEND_URL if it's not localhost
    const envUrl = process.env.FRONTEND_URL;
    if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
        return envUrl.replace(/\/$/, '');
    }

    // Fallback: Detect Local Network IP (for same-WiFi usage)
    const interfaces = os.networkInterfaces();
    let detectedIp = '';

    for (const name of Object.keys(interfaces)) {
        const ifaceList = interfaces[name];
        if (!ifaceList) continue;

        for (const iface of ifaceList) {
            if (iface.internal || iface.family !== 'IPv4') continue;
            if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
                return `http://${iface.address}:5173`;
            }
            detectedIp = iface.address;
        }
    }

    if (detectedIp) {
        return `http://${detectedIp}:5173`;
    }

    // Ultimate Fallback: Default Localhost
    return envUrl || 'http://localhost:5173';
};

/**
 * Helper to generate a unique 6-character alphanumeric session code.
 */
const generateSessionCode = (length: number = 6): string => {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

// SESSION CONTROLLERS

/**
 // @desc    Create a new session
 // @route   POST /api/sessions
 // @access  Private (Teacher only)
 */
export const createSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { title, description } = req.body;

        // Ensure teacher is authenticated
        if (!req.user?._id) {
            res.status(401).json({ success: false, message: 'Unauthorized. Teacher ID missing.' });
            return;
        }

        // Generate a strictly unique 6-character code
        let code = generateSessionCode();
        let codeExists = await Session.findOne({ code });

        while (codeExists) {
            code = generateSessionCode();
            codeExists = await Session.findOne({ code });
        }

        // Initialize the session in the database
        const session = await Session.create({
            title,
            description,
            code,
            teacher: req.user._id,
            status: 'active',
            students: [],
            attendance: []
        });

        // Generate Join URL and QR Code
        const baseUrl = getLocalUrl();
        const joinUrl = `${baseUrl}/join/${code}`;
        
        try {
            const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#6366f1', light: '#ffffff' }
            });
            session.qrCodeDataUrl = qrCodeDataUrl;
            session.joinUrl = joinUrl;
            await session.save();
        } catch (qrError) {
            console.error('QR code generation error:', qrError);
            // We continue even if QR generation fails; the session code still works
        }

        res.status(201).json({ success: true, data: session });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({ success: false, message: 'Server error during session creation' });
    }
};

/**
 // @desc    Join a session using a 6-character code
 // @route   POST /api/sessions/join
 // @access  Private (Registered Students only)
 */
export const joinSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.body;
        const user = req.user;

        // Validate Input and User
        if (!code || typeof code !== 'string') {
            res.status(400).json({ success: false, message: 'Please provide a valid session code' });
            return;
        }

        if (!user || !user._id) {
            res.status(401).json({ success: false, message: 'Unauthorized. User information missing.' });
            return;
        }

        const cleanCode = code.trim().toUpperCase();

        // Find Session (Allow joining both 'active' and 'paused' sessions)
        const session = await Session.findOne({ 
            code: cleanCode, 
            status: { $in: ['active', 'paused'] } 
        });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found or has ended' });
            return;
        }

        const studentId = user._id;
        const isAlreadyJoined = session.students.includes(studentId);

        // Handle Idempotent Join & Attendance Tracking
        if (!isAlreadyJoined) {
            // Add to active students list
            session.students.push(studentId);
            
            // Record attendance for reporting
            session.attendance.push({
                student: studentId,
                name: user.name || 'Unknown Student',
                email: user.email || 'Unknown Email',
                joinTime: new Date()
            });

            await session.save();

            // Emit real-time event to update the teacher's dashboard
            emitToSession(session.code, 'student_joined', {
                studentId,
                name: user.name,
                joinTime: new Date(),
                totalStudents: session.students.length
            });
        }

        res.status(200).json({
            success: true,
            message: isAlreadyJoined ? 'Re-joined session successfully' : 'Joined session successfully',
            data: session
        });
    } catch (error) {
        console.error('Join session error:', error);
        res.status(500).json({ success: false, message: 'Server error during joining session' });
    }
};

/**
 // @desc    Get session details by code
 // @route   GET /api/sessions/:code
 // @access  Private
 */
export const getSessionDetails = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const session = await Session.findOne({ code: code.toUpperCase() })
            .populate('teacher', 'name email')
            .populate('students', 'name email');

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Auto-refresh QR code if network environment changed (e.g., dev switched networks)
        const baseUrl = getLocalUrl();
        if (!baseUrl.includes('localhost') && !baseUrl.includes('127.0.0.1') &&
            (!session.joinUrl || session.joinUrl.includes('localhost') || session.joinUrl.includes('127.0.0.1'))) {

            const joinUrl = session.isQuerySession ? `${baseUrl}/ask/${session.code}` : `${baseUrl}/join/${session.code}`;
            try {
                const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
                    width: 300,
                    margin: 2,
                    color: { dark: '#6366f1', light: '#ffffff' }
                });
                session.qrCodeDataUrl = qrCodeDataUrl;
                session.joinUrl = joinUrl;
                await session.save();
            } catch (qrError) {
                console.error('QR refresh error in getSessionDetails:', qrError);
            }
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching session' });
    }
};

/**
 // @desc    End a session and generate an AI mood summary
 // @route   PATCH /api/sessions/:id/end
 // @access  Private (Teacher only)
 */
export const endSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        // Verify authorization
        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Unauthorized to end this session' });
            return;
        }

        // Mark session as ended
        session.status = 'ended';
        session.endedAt = new Date();

        // Generate Mood Summary based on all asked questions
        const questions = await Question.find({ session: session._id });
        const questionTexts = questions.map(q => q.content);
        
        // Wait for AI to process the summary before saving
        session.moodSummary = await generateMoodSummary(questionTexts);
        await session.save();

        // Notify all participants the session has ended
        emitToSession(session.code, 'session_status_update', { status: 'ended' });

        res.status(200).json({
            success: true,
            data: {
                _id: session._id,
                title: session.title,
                code: session.code,
                questionCount: questions.length,
                duration: Math.round((session.endedAt.getTime() - session.createdAt.getTime()) / 60000), // in minutes
                moodSummary: session.moodSummary
            },
            message: 'Session ended successfully'
        });
    } catch (error) {
        console.error('End session error:', error);
        res.status(500).json({ success: false, message: 'Server error ending session' });
    }
};

/**
 // @desc    Pause or Resume a session
 // @route   PATCH /api/sessions/:id/pause
 // @access  Private (Teacher only)
 */
export const pauseSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const session = await Session.findById(req.params.id);

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        if (session.teacher.toString() !== req.user?._id.toString()) {
            res.status(403).json({ success: false, message: 'Unauthorized to control this session' });
            return;
        }

        // Toggle status
        const newStatus = session.status === 'paused' ? 'active' : 'paused';
        session.status = newStatus;
        await session.save();

        // Notify participants to freeze/unfreeze their UI
        emitToSession(session.code, 'session_status_update', { status: newStatus });

        res.status(200).json({
            success: true,
            status: newStatus,
            message: `Session ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`
        });
    } catch (error) {
        console.error('Pause session error:', error);
        res.status(500).json({ success: false, message: 'Server error toggling session pause' });
    }
};

/**
 // @desc    Leave a session (Records leave time for attendance)
 // @route   POST /api/sessions/:code/leave
 // @access  Private
 */
export const leaveSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const { code } = req.params;
        const session = await Session.findOne({ code: code.toUpperCase() });

        if (!session) {
            res.status(404).json({ success: false, message: 'Session not found' });
            return;
        }

        const userId = req.user?._id;
        
        if (userId) {
            // Remove user from the active 'students' list
            session.students = session.students.filter(id => id.toString() !== userId.toString()) as any;
            
            //  Find their latest attendance record and mark their leave time
            // We reverse slice to find the *most recent* time they joined in case they joined/left multiple times
            const attendanceRecord = session.attendance
                .slice()
                .reverse()
                .find(record => record.student.toString() === userId.toString() && !record.leaveTime);

            if (attendanceRecord) {
                attendanceRecord.leaveTime = new Date();
            }

            await session.save();

            //  Update the teacher's UI
            emitToSession(session.code, 'student_left', {
                studentId: userId,
                totalStudents: session.students.length
            });
        }

        res.status(200).json({ success: true, message: 'Left session successfully' });
    } catch (error) {
        console.error('Leave session error:', error);
        res.status(500).json({ success: false, message: 'Server error leaving session' });
    }
};

/**
 // @desc    Get active session for user
 // @route   GET /api/sessions/current/active
 // @access  Private
 */
export const getActiveSession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        let session;

        // Teachers see sessions they own; Students see sessions they are actively in
        if (req.user?.role === 'Teacher') {
            session = await Session.findOne({ teacher: userId, status: { $in: ['active', 'paused'] } });
        } else {
            session = await Session.findOne({ students: userId, status: { $in: ['active', 'paused'] } });
        }

        res.status(200).json({ success: true, data: session || null });
    } catch (error) {
        console.error('Get active session error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching active session' });
    }
};

/**
 // @desc    Get all sessions a student has joined (Used for displaying certificates)
 // @route   GET /api/sessions/student/history
 // @access  Private
 */
export const getStudentSessions = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;

        // We check the attendance array directly to ensure we catch sessions they joined even if they left before it ended
        const sessions = await Session.find({
            'attendance.student': userId
        })
            .populate('teacher', 'name')
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, data: sessions });
    } catch (error) {
        console.error('Get student sessions error:', error);
        res.status(500).json({ success: false, message: 'Server error fetching student sessions' });
    }
};

/**
 // @desc    Get or create a teacher's persistent query session
 // @route   GET /api/sessions/query-mode
 // @access  Private (Teacher only)
 */
export const getOrCreateQuerySession = async (req: Request, res: Response): Promise<void> => {
    try {
        const userId = req.user?._id;
        const baseUrl = getLocalUrl();

        // Find existing query session
        let session = await Session.findOne({ teacher: userId, isQuerySession: true });

        // If session exists but has localhost URL, refresh it for network use
        if (session && session.joinUrl?.includes('localhost') && !baseUrl.includes('localhost')) {
            const askUrl = `${baseUrl}/ask/${session.code}`;
            const qrCodeDataUrl = await QRCode.toDataURL(askUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#6366f1', light: '#ffffff' }
            });
            session.qrCodeDataUrl = qrCodeDataUrl;
            session.joinUrl = askUrl;
            await session.save();
        }

        // Create new if it doesn't exist
        if (!session) {
            let code = generateSessionCode();
            let codeExists = await Session.findOne({ code });

            while (codeExists) {
                code = generateSessionCode();
                codeExists = await Session.findOne({ code });
            }

            const askUrl = `${baseUrl}/ask/${code}`;
            const qrCodeDataUrl = await QRCode.toDataURL(askUrl, {
                width: 300,
                margin: 2,
                color: { dark: '#6366f1', light: '#ffffff' }
            });

            session = await Session.create({
                title: `${req.user?.name}'s Query Mode`,
                code,
                teacher: userId,
                status: 'active',
                isQuerySession: true,
                joinUrl: askUrl,
                qrCodeDataUrl
            });
        }

        res.status(200).json({ success: true, data: session });
    } catch (error) {
        console.error('Get/Create query session error:', error);
        res.status(500).json({ success: false, message: 'Server error handling query session' });
    }
};

/**
 * @desc    Update custom query URL
 * @route   PATCH /api/sessions/query-mode/url
 * @access  Private (Teacher only)
 */
export const updateQueryUrl = async (req: Request, res: Response): Promise<void> => {
    try {
        const { url } = req.body;
        const userId = req.user?._id;

        const session = await Session.findOne({ teacher: userId, isQuerySession: true });

        if (!session) {
            res.status(404).json({ success: false, message: 'Query session not found' });
            return;
        }

        session.customQueryUrl = url;
        await session.save();

        res.status(200).json({
            success: true,
            data: session,
            message: 'Query URL updated successfully'
        });
    } catch (error) {
        console.error('Update query URL error:', error);
        res.status(500).json({ success: false, message: 'Server error updating query URL' });
    }
};
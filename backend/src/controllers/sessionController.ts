import { Request, Response } from 'express';
import Session from '../models/Session';
import User from '../models/User';
import Question from '../models/Question';
import { emitToSession } from '../config/socket';
import { generateMoodSummary } from '../services/aiService';
import { sendSessionInvitation } from '../services/emailService';
import { sendCertificateEmail } from '../services/emailService';
import QRCode from 'qrcode';
import os from 'os';

const getLocalUrl = (): string => {
  // 1. High priority: Explicit PUBLIC_URL (ngrok, tunnel, domain)
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, ''); // Remove trailing slash
  }

  // 2. Medium priority: FRONTEND_URL if it's not localhost
  const envUrl = process.env.FRONTEND_URL;
  if (envUrl && !envUrl.includes('localhost') && !envUrl.includes('127.0.0.1')) {
    return envUrl.replace(/\/$/, '');
  }

  // 3. Fallback: Detect Local Network IP (for same-WiFi usage)
  const interfaces = os.networkInterfaces();
  let detectedIp = '';

  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      // Skip internal (loopback) and non-IPv4 addresses
      if (iface.internal || iface.family !== 'IPv4') continue;

      // Prioritize common private networks
      if (iface.address.startsWith('192.168.') || iface.address.startsWith('10.')) {
        return `http://${iface.address}:5173`;
      }
      detectedIp = iface.address;
    }
  }

  if (detectedIp) {
    return `http://${detectedIp}:5173`;
  }

  // 4. Ultimate Fallback: Default Localhost
  return envUrl || 'http://localhost:5173';
};

// Helper to generate a unique 6-character code
const generateSessionCode = (length: number = 6): string => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// @desc    Create a new session
// @route   POST /api/sessions
// @access  Private (Teacher only)
export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title, description } = req.body;

    // Prevent duplicate session creation from repeated clicks
    const existingSession = await Session.findOne({ teacher: req.user?._id, status: { $in: ['active', 'paused'] } });
    if (existingSession) {
      console.log(`Teacher ${req.user?._id} attempted to create a new session while one is already active`);
      res.status(400).json({
        success: false,
        message: 'You already have an active session. End or pause it before creating another.',
        data: existingSession
      });
      return;
    }

    // Generate unique code
    let code = generateSessionCode();
    let codeExists = await Session.findOne({ code });

    // Ensure uniqueness
    while (codeExists) {
      code = generateSessionCode();
      codeExists = await Session.findOne({ code });
    }

    const session = await Session.create({
      title,
      description,
      code,
      teacher: req.user?._id,
      status: 'active'
    });

    const baseUrl = getLocalUrl();
    const joinUrl = `${baseUrl}/join/${code}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6366f1',
          light: '#ffffff'
        }
      });
      session.qrCodeDataUrl = qrCodeDataUrl;
      session.joinUrl = joinUrl;
      await session.save();

    } catch (qrError) {
      console.error('QR code generation error:', qrError);
      // Continue even if QR generation fails
    }

    // Send invitations by default (unless inviteStudents=false). 
    // Call with inviteStudents=false to skip, or inviteEmails to target specific users.
    let invitationResults: any[] = [];
    const inviteEmails: string[] = Array.isArray(req.body.inviteEmails) ? req.body.inviteEmails : [];
    const inviteAll = req.body.inviteStudents !== false; // default true

    if (inviteAll || inviteEmails.length) {
      console.log(`Invitation trigger: inviteAll=${inviteAll}, inviteEmails=${JSON.stringify(inviteEmails)}, sessionCode=${session.code}`);
      try {
        const teacher = await User.findById(req.user?._id);
        if (!teacher) {
          throw new Error('Teacher not found for invitation email sender');
        }

        let studentsToInvite: any[] = [];

        if (inviteAll) {
          studentsToInvite = await User.find({ role: 'Student' });
          console.log(`Inviting all students, count=${studentsToInvite.length}`);
        } else {
          const normalized = inviteEmails
            .map((e) => e.trim().toLowerCase())
            .filter(Boolean);
          console.log(`Inviting selected emails: ${JSON.stringify(normalized)}`);
          studentsToInvite = await User.find({ email: { $in: normalized } });
          console.log(`Matched students count=${studentsToInvite.length}`);
        }

        const invites = studentsToInvite.map(async (student) => {
          const result = await sendSessionInvitation(
            student.email,
            student.name,
            session.title,
            session.code,
            joinUrl,
            teacher.name || 'Your Teacher'
          );
          return { email: student.email, success: result.success, message: result.message };
        });

        invitationResults = await Promise.all(invites);
      } catch (inviteError) {
        console.error('Send session invitation error:', inviteError);
      }
    }

    res.status(201).json({
      success: true,
      data: session,
      invitations: invitationResults
    });
  } catch (error) {
    console.error('Create session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during session creation'
    });
  }
};

// @desc    Join a session
// @route   POST /api/sessions/join
// @access  Private (Student only)
export const joinSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res.status(400).json({ success: false, message: 'Please provide a session code' });
      return;
    }

    const session = await Session.findOne({ code: code.toUpperCase(), status: 'active' });

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Active session not found with this code'
      });
      return;
    }

    // Add student to session if not already added
    const studentId = req.user?._id;
    if (studentId && !session.students.includes(studentId)) {
      session.students.push(studentId);
      await session.save();
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Join session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error during joining session'
    });
  }
};

// @desc    Get session details by code
// @route   GET /api/sessions/:code
// @access  Private
export const getSessionDetails = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const session = await Session.findOne({ code: code.toUpperCase() })
      .populate('teacher', 'name email')
      .populate('students', 'name email');

    if (!session) {
      res.status(404).json({
        success: false,
        message: 'Session not found'
      });
      return;
    }

    if (session) {
      const baseUrl = getLocalUrl();
      // If the current detected base URL is public but the session's joinUrl is local/localhost,
      // refresh it so the QR code matches the current tunnel/domain.
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
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching session'
    });
  }
};

// @desc    End a session
// @route   PATCH /api/sessions/:id/end
// @access  Private (Teacher only)
export const endSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    // Check if user is the teacher of this session
    if (session.teacher.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized to end this session' });
      return;
    }

    session.status = 'ended';
    session.endedAt = new Date();

    // 1. Fetch all questions
    const questions = await Question.find({ session: session._id });
    const questionTexts = questions.map(q => q.content);

    // 2. Generate Mood Summary
    session.moodSummary = await generateMoodSummary(questionTexts);

    // ✅ SAVE SESSION
    await session.save();

    // ✅ SEND CERTIFICATES (FIXED PROPERLY)
    try {
      const teacher = await User.findById(session.teacher);
      const sentEmails = new Set<string>();

      for (const entry of session.attendance) {
        // ❌ Skip teacher
        if (entry.email === teacher?.email) continue;

        // ❌ Skip duplicates
        if (sentEmails.has(entry.email)) continue;

        sentEmails.add(entry.email);

        await sendCertificateEmail(
          entry.email,
          entry.name,
          session.title,
          session.code,
          session.endedAt?.toISOString() || new Date().toISOString(),
          teacher?.name || 'Instructor'
        );
      }

      console.log('Certificates sent to students (filtered)');
    } catch (err) {
      console.error('Certificate email error:', err);
    }

    // Notify all participants
    emitToSession(session.code, 'session_status_update', { status: 'ended' });

    res.status(200).json({
      success: true,
      data: {
        _id: session._id,
        title: session.title,
        code: session.code,
        questionCount: questions.length,
        duration: Math.round((session.endedAt.getTime() - session.createdAt.getTime()) / 60000),
        moodSummary: session.moodSummary
      },
      message: 'Session ended successfully'
    });

  } catch (error) {
    console.error('End session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error ending session'
    });
  }
};
// @desc    Pause or Resume a session
// @route   PATCH /api/sessions/:id/pause
// @access  Private (Teacher only)
export const pauseSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({ success: false, message: 'Session not found' });
      return;
    }

    // Check if user is the teacher of this session
    if (session.teacher.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: 'Unauthorized to control this session' });
      return;
    }

    // Toggle status
    const newStatus = session.status === 'paused' ? 'active' : 'paused';
    session.status = newStatus;
    await session.save();

    // Notify all participants
    emitToSession(session.code, 'session_status_update', { status: newStatus });

    res.status(200).json({
      success: true,
      status: newStatus,
      message: `Session ${newStatus === 'paused' ? 'paused' : 'resumed'} successfully`
    });
  } catch (error) {
    console.error('Pause session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error toggling session pause'
    });
  }
};

// @desc    Leave a session
// @route   POST /api/sessions/:code/leave
// @access  Private
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
      // Remove user from students array
      session.students = session.students.filter(id => id.toString() !== userId.toString()) as any;
      await session.save();
    }

    res.status(200).json({
      success: true,
      message: 'Left session successfully'
    });
  } catch (error) {
    console.error('Leave session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error leaving session'
    });
  }
};

// @desc    Get active session for user
// @route   GET /api/sessions/current/active
// @access  Private
export const getActiveSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;
    let session;

    if (req.user?.role === 'Teacher') {
      session = await Session.findOne({ teacher: userId, status: { $in: ['active', 'paused'] } });
    } else {
      session = await Session.findOne({ students: userId, status: { $in: ['active', 'paused'] } });
    }

    res.status(200).json({
      success: true,
      data: session || null
    });
  } catch (error) {
    console.error('Get active session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching active session'
    });
  }
};

// @desc    Send test session invitation emails
// @route   POST /api/sessions/test-email
// @access  Private (Teacher only)
export const sendTestSessionInvitation = async (req: Request, res: Response): Promise<void> => {
  try {
    const session = await Session.findOne({ status: 'active' });
    if (!session) {
      res.status(404).json({ success: false, message: 'No active session found' });
      return;
    }

    const teacher = await User.findById(req.user?._id);
    if (!teacher) {
      res.status(404).json({ success: false, message: 'Teacher not found' });
      return;
    }

    const students = await User.find({ role: 'Student' });
    if (!students.length) {
      res.status(404).json({ success: false, message: 'No student users found' });
      return;
    }

    const joinUrl = session.joinUrl || `${getLocalUrl()}/join/${session.code}`;
    const results = [];

    for (const student of students) {
      const result = await sendSessionInvitation(
        student.email,
        student.name,
        session.title,
        session.code,
        joinUrl,
        teacher.name || 'Your Teacher'
      );
      results.push({ email: student.email, success: result.success, message: result.message });
    }

    res.status(200).json({
      success: true,
      message: `Sent ${results.filter(r => r.success).length}/${results.length} test emails`,
      results
    });
  } catch (error) {
    console.error('Test invite error:', error);
    res.status(500).json({ success: false, message: 'Server error sending test email' });
  }
};

// @desc    Get all sessions a student has joined (for certificates)
// @route   GET /api/sessions/student/history
// @access  Private
export const getStudentSessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Find sessions where student is in participants list
    const sessions = await Session.find({
      students: userId
    })
      .populate('teacher', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions
    });
  } catch (error) {
    console.error('Get student sessions error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error fetching student sessions'
    });
  }
};
// @desc    Get or create a teacher's persistent query session
// @route   GET /api/sessions/query-mode
// @access  Private (Teacher only)
export const getOrCreateQuerySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const userId = req.user?._id;

    // Find existing query session for this teacher
    let session = await Session.findOne({ teacher: userId, isQuerySession: true });

    const baseUrl = getLocalUrl();

    // If session exists but has localhost URL, refresh it
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

    if (!session) {
      // Create a new persistent query session
      let code = generateSessionCode();
      let codeExists = await Session.findOne({ code });

      while (codeExists) {
        code = generateSessionCode();
        codeExists = await Session.findOne({ code });
      }

      session = await Session.create({
        title: `${req.user?.name}'s Query Mode`,
        code,
        teacher: userId,
        status: 'active',
        isQuerySession: true
      });

      const askUrl = `${baseUrl}/ask/${code}`;
      const qrCodeDataUrl = await QRCode.toDataURL(askUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: '#6366f1',
          light: '#ffffff'
        }
      });

      session.qrCodeDataUrl = qrCodeDataUrl;
      session.joinUrl = askUrl;
      await session.save();
    }

    res.status(200).json({
      success: true,
      data: session
    });
  } catch (error) {
    console.error('Get/Create query session error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error handling query session'
    });
  }
};

// @desc    Update custom query URL
// @route   PATCH /api/sessions/query-mode/url
// @access  Private (Teacher only)
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
    res.status(500).json({
      success: false,
      message: 'Server error updating query URL'
    });
  }
};

import { Request, Response } from "express";
import Session from "../models/Session";
import Question from "../models/Question";
import { emitToSession } from "../config/socket";
import { generateMoodSummary } from "../services/aiService";
import QRCode from "qrcode";
import os from "os";

const getLocalUrl = (): string => {
  if (process.env.PUBLIC_URL) {
    return process.env.PUBLIC_URL.replace(/\/$/, "");
  }

  const envUrl = process.env.FRONTEND_URL;
  if (
    envUrl &&
    !envUrl.includes("localhost") &&
    !envUrl.includes("127.0.0.1")
  ) {
    return envUrl.replace(/\/$/, "");
  }

  const interfaces = os.networkInterfaces();
  let detectedIp = "";

  for (const name of Object.keys(interfaces)) {
    const ifaceList = interfaces[name];
    if (!ifaceList) continue;

    for (const iface of ifaceList) {
      if (iface.internal || iface.family !== "IPv4") continue;

      if (
        iface.address.startsWith("192.168.") ||
        iface.address.startsWith("10.")
      ) {
        return `http://${iface.address}:5173`;
      }
      detectedIp = iface.address;
    }
  }

  if (detectedIp) {
    return `http://${detectedIp}:5173`;
  }

  return envUrl || "http://localhost:5173";
};

const generateSessionCode = (length: number = 6): string => {
  const characters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let result = "";
  for (let i = 0; i < 6; i++) {
    result += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return result;
};

// ============================
// CREATE SESSION
// ============================
export const createSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { title, description } = req.body;

    let code = generateSessionCode();
    let codeExists = await Session.findOne({ code });

    while (codeExists) {
      code = generateSessionCode();
      codeExists = await Session.findOne({ code });
    }

    const session = await Session.create({
      title,
      description,
      code,
      teacher: req.user?._id,
      status: "active",
    });

    const baseUrl = getLocalUrl();
    const joinUrl = `${baseUrl}/join/${code}`;

    try {
      const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
        width: 300,
        margin: 2,
        color: {
          dark: "#6366f1",
          light: "#ffffff",
        },
      });

      session.qrCodeDataUrl = qrCodeDataUrl;
      session.joinUrl = joinUrl;
      await session.save();
    } catch (qrError) {
      console.error("QR code generation error:", qrError);
    }

    res.status(201).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Create session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during session creation",
    });
  }
};

// ============================
// JOIN SESSION
// ============================
export const joinSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.body;

    if (!code) {
      res
        .status(400)
        .json({ success: false, message: "Please provide a session code" });
      return;
    }

    const session = await Session.findOne({
      code: code.toUpperCase(),
      status: "active",
    });

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Active session not found with this code",
      });
      return;
    }

    const studentId = req.user?._id;

    if (studentId && !session.students.includes(studentId)) {
      session.students.push(studentId);
      await session.save();
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Join session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error during joining session",
    });
  }
};

// ============================
// GET SESSION DETAILS
// ============================
export const getSessionDetails = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.params;

    const session = await Session.findOne({ code: code.toUpperCase() })
      .populate("teacher", "name email")
      .populate("students", "name email");

    if (!session) {
      res.status(404).json({
        success: false,
        message: "Session not found",
      });
      return;
    }

    const baseUrl = getLocalUrl();

    if (
      !baseUrl.includes("localhost") &&
      !baseUrl.includes("127.0.0.1") &&
      (!session.joinUrl ||
        session.joinUrl.includes("localhost") ||
        session.joinUrl.includes("127.0.0.1"))
    ) {
      const joinUrl = session.isQuerySession
        ? `${baseUrl}/ask/${session.code}`
        : `${baseUrl}/join/${session.code}`;

      try {
        const qrCodeDataUrl = await QRCode.toDataURL(joinUrl, {
          width: 300,
          margin: 2,
          color: { dark: "#6366f1", light: "#ffffff" },
        });

        session.qrCodeDataUrl = qrCodeDataUrl;
        session.joinUrl = joinUrl;
        await session.save();
      } catch (qrError) {
        console.error("QR refresh error:", qrError);
      }
    }

    res.status(200).json({
      success: true,
      data: session,
    });
  } catch (error) {
    console.error("Get session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching session",
    });
  }
};

// ============================
// END SESSION (UPDATED)
// ============================
export const endSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    if (session.teacher.toString() !== req.user?._id.toString()) {
      res
        .status(403)
        .json({ success: false, message: "Unauthorized to end this session" });
      return;
    }

    session.status = "ended";
    session.endedAt = new Date();

    const questions = await Question.find({ session: session._id });
    const questionTexts = questions.map((q) => q.content);

    // AI mood summary
    const moodSummary = await generateMoodSummary(questionTexts);
    session.moodSummary = moodSummary;

    await session.save();

    emitToSession(session.code, "session_status_update", {
      status: "ended",
    });

    const totalQuestions = questions.length;

    res.status(200).json({
      success: true,
      data: {
        sessionId: session._id,
        title: session.title,
        code: session.code,
        totalQuestions: totalQuestions,
        durationInMinutes: Math.round(
          (session.endedAt.getTime() - session.createdAt.getTime()) / 60000,
        ),
        moodSummary: moodSummary,
      },
      message: "Session ended successfully",
    });
  } catch (error) {
    console.error("End session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error ending session",
    });
  }
};

// ============================
// PAUSE SESSION
// ============================
export const pauseSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const session = await Session.findById(req.params.id);

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    if (session.teacher.toString() !== req.user?._id.toString()) {
      res
        .status(403)
        .json({
          success: false,
          message: "Unauthorized to control this session",
        });
      return;
    }

    const newStatus = session.status === "paused" ? "active" : "paused";
    session.status = newStatus;
    await session.save();

    emitToSession(session.code, "session_status_update", {
      status: newStatus,
    });

    res.status(200).json({
      success: true,
      status: newStatus,
      message: `Session ${newStatus} successfully`,
    });
  } catch (error) {
    console.error("Pause session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error toggling session pause",
    });
  }
};

// ============================
// LEAVE SESSION
// ============================
export const leaveSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { code } = req.params;

    const session = await Session.findOne({ code: code.toUpperCase() });

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    const userId = req.user?._id;

    if (userId) {
      session.students = session.students.filter(
        (id) => id.toString() !== userId.toString(),
      ) as any;

      await session.save();
    }

    res.status(200).json({
      success: true,
      message: "Left session successfully",
    });
  } catch (error) {
    console.error("Leave session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error leaving session",
    });
  }
};

// ============================
// ACTIVE SESSION
// ============================
export const getActiveSession = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;
    let session;

    if (req.user?.role === "Teacher") {
      session = await Session.findOne({
        teacher: userId,
        status: { $in: ["active", "paused"] },
      });
    } else {
      session = await Session.findOne({
        students: userId,
        status: { $in: ["active", "paused"] },
      });
    }

    res.status(200).json({
      success: true,
      data: session || null,
    });
  } catch (error) {
    console.error("Get active session error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching active session",
    });
  }
};

// ============================
// STUDENT HISTORY
// ============================
export const getStudentSessions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = req.user?._id;

    const sessions = await Session.find({
      students: userId,
    })
      .populate("teacher", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      data: sessions,
    });
  } catch (error) {
    console.error("Get student sessions error:", error);
    res.status(500).json({
      success: false,
      message: "Server error fetching student sessions",
    });
  }
};

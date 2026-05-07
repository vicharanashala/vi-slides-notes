import { Request, Response } from "express";
import Session from "../models/sessionModel.js";
import Question from "../models/questionModel.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const SESSION_STATUSES = new Set(["active", "inactive"]);

const generateSessionCode = (): string => {
  return Math.random().toString(36).substring(2, 8).toUpperCase();
};

export const listMySessions = async (req: Request, res: Response): Promise<void> => {
  try {
    const teacherId = (req as AuthenticatedRequest).user?.id;

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const sessions = await Session.find({ teacherId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .lean();

    res.status(200).json({ success: true, sessions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};


export const createSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { title } = req.body;
    const teacherId = (req as AuthenticatedRequest).user?.id;
    const cleanTitle = typeof title === "string" ? title.trim() : "";

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!cleanTitle) {
      res.status(400).json({ success: false, message: "Session title is required" });
      return;
    }

    let code = generateSessionCode();
    let attempts = 0;

    while (attempts < 5) {
      const exists = await Session.findOne({ code });

      if (!exists) {
        break;
      }

      code = generateSessionCode();
      attempts += 1;
    }

    const session = await Session.create({
      title: cleanTitle,
      code,
      status: "active",
      teacherId,
    });

    res.status(201).json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSessionStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const { status } = req.body;
    const teacherId = (req as AuthenticatedRequest).user?.id;
    const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";
    const normalizedStatus = typeof status === "string" ? status.trim().toLowerCase() : "";

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!normalizedCode) {
      res.status(400).json({ success: false, message: "Session code is required" });
      return;
    }

    if (!SESSION_STATUSES.has(normalizedStatus)) {
      res.status(400).json({ success: false, message: "Status must be active or inactive" });
      return;
    }

    const session = await Session.findOneAndUpdate(
      { code: normalizedCode, teacherId },
      { status: normalizedStatus },
      { new: true }
    );

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found for this teacher" });
      return;
    }

    res.status(200).json({ success: true, session });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const teacherId = (req as AuthenticatedRequest).user?.id;
    const normalizedCode = typeof code === "string" ? code.trim().toUpperCase() : "";

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!normalizedCode) {
      res.status(400).json({ success: false, message: "Session code is required" });
      return;
    }

    const session = await Session.findOne({ code: normalizedCode, teacherId });

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found for this teacher" });
      return;
    }

    await Question.deleteMany({ sessionId: session._id });
    await session.deleteOne();

    res.status(200).json({ success: true, message: "Session deleted successfully" });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
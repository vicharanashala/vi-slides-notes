import { Request, Response } from "express";
import Question from "../models/questionModel.js";
import Session from "../models/sessionModel.js";
import { AuthenticatedRequest } from "../middleware/auth.js";

const buildSimpleAIAnswer = (question: string): string => {
  // Simple placeholder AI response - replace with actual AI integration
  return `Thank you for your question: "${question}". This is an AI-generated response.`;
};


const extractStudentNameFromEmail = (email: string): string => {
  const [localPart] = email.trim().toLowerCase().split("@");
  const cleanName = (localPart || "").trim();

  return cleanName || "Student";
};


export const submitQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { sessionCode, text, isAnonymous } = req.body;
    const userId = (req as AuthenticatedRequest).user?.id;
    const cleanText = typeof text === "string" ? text.trim() : "";
    const normalizedCode = typeof sessionCode === "string" ? sessionCode.toUpperCase().trim() : "";

    if (!userId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!normalizedCode || !cleanText) {
      res.status(400).json({ success: false, message: "sessionCode and text are required" });
      return;
    }

    const session = await Session.findOne({ code: normalizedCode });

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    if (session.status !== "active") {
      res.status(400).json({ success: false, message: "Session is not active" });
      return;
    }

    const newQuestion = await Question.create({
      sessionId: session._id,
      question: cleanText,
      authorId: userId,
      isAnonymous: isAnonymous || false,
    });

    res.status(201).json({ success: true, question: newQuestion });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getQuestionsBySession = async (req: Request, res: Response): Promise<void> => {
  try {
    const { code } = req.params;
    const user = (req as AuthenticatedRequest).user;
    const normalizedCode = typeof code === "string" ? code.toUpperCase().trim() : "";

    if (!user?.id || !user.role) {
      res.status(401).json({ success: false, message: "Authentication with role is required" });
      return;
    }

    if (!normalizedCode) {
      res.status(400).json({ success: false, message: "Session code is required" });
      return;
    }

    const session = await Session.findOne({ code: normalizedCode });

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    if (user.role === "teacher" && String(session.teacherId) !== user.id) {
      res.status(403).json({ success: false, message: "You can only view your own sessions" });
      return;
    }

    const questions = await Question.find({ sessionId: session._id })
      .populate({ path: "authorId", select: "email" })
      .sort({ isPinned: -1, createdAt: -1 })
      .lean();

    const normalizedQuestions = questions.map((question) => {
      const author = question.authorId as unknown;

      let authorId = "";
      let authorEmail = "";

      if (typeof author === "string") {
        authorId = author;
      } else if (author && typeof author === "object") {
        if ("_id" in author) {
          authorId = String((author as { _id?: unknown })._id || "");
          const candidateEmail = (author as { email?: unknown }).email;
          authorEmail = typeof candidateEmail === "string" ? candidateEmail : "";
        } else {
          authorId = String(author);
        }
      }

      const isMine = Boolean(authorId) && authorId === user.id;
      const studentName = authorEmail ? extractStudentNameFromEmail(authorEmail) : "";

      return {
        ...question,
        isMine,
        authorLabel: question.isAnonymous ? "Anonymous" : (studentName || (isMine ? "You" : "Student")),
      };
    });

    res.status(200).json({ success: true, questions: normalizedQuestions });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const answerQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { answer, answerType } = req.body;
    const teacherId = (req as AuthenticatedRequest).user?.id;
    const cleanAnswer = typeof answer === "string" ? answer.trim() : "";

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (!cleanAnswer) {
      res.status(400).json({ success: false, message: "Answer is required" });
      return;
    }

    const type = answerType === "ai" ? "ai" : "manual";
    const question = await Question.findById(id);

    if (!question) {
      res.status(404).json({ success: false, message: "Question not found" });
      return;
    }

    const session = await Session.findById(question.sessionId);

    if (!session || String(session.teacherId) !== teacherId) {
      res.status(403).json({ success: false, message: "You can answer only questions from your own sessions" });
      return;
    }

    question.answer = cleanAnswer;
    question.answerType = type;
    question.repliedBy = session.teacherId;
    question.repliedAt = new Date();

    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const answerQuestionWithAI = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const teacherId = (req as AuthenticatedRequest).user?.id;

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    const question = await Question.findById(id);

    if (!question) {
      res.status(404).json({ success: false, message: "Question not found" });
      return;
    }

    const session = await Session.findById(question.sessionId);

    if (!session || String(session.teacherId) !== teacherId) {
      res.status(403).json({ success: false, message: "You can answer only questions from your own sessions" });
      return;
    }

    question.answer = buildSimpleAIAnswer(question.question);
    question.answerType = "ai";
    question.repliedBy = session.teacherId;
    question.repliedAt = new Date();
    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const pinQuestion = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { pinned } = req.body;
    const teacherId = (req as AuthenticatedRequest).user?.id;

    if (!teacherId) {
      res.status(401).json({ success: false, message: "Authentication required" });
      return;
    }

    if (typeof pinned !== "boolean") {
      res.status(400).json({ success: false, message: "pinned must be boolean" });
      return;
    }

    const question = await Question.findById(id);

    if (!question) {
      res.status(404).json({ success: false, message: "Question not found" });
      return;
    }

    const session = await Session.findById(question.sessionId);

    if (!session || String(session.teacherId) !== teacherId) {
      res.status(403).json({ success: false, message: "You can pin only questions from your own sessions" });
      return;
    }

    question.isPinned = pinned;
    await question.save();

    res.status(200).json({ success: true, question });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
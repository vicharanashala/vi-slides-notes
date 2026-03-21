import { Request, Response } from "express";
import Question from "../models/Question";
import Session from "../models/Session";
import { emitToSession } from "../config/socket";
import { analyzeQuestion } from "../services/aiService";
import { queueQuestion } from "../services/questionBatchService";
import User from "../models/User";

export const createQuestion = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { content, sessionId, isDirectToTeacher } = req.body;

    if (!content || !sessionId) {
      res
        .status(400)
        .json({
          success: false,
          message: "Content and session ID are required",
        });
      return;
    }

    const session = await Session.findById(sessionId);
    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    const question = await Question.create({
      content,
      user: req.user?._id,
      session: sessionId,
      isDirectToTeacher: !!isDirectToTeacher,
      analysisStatus: "not_requested",
      refinementStatus: "pending",
      originalContent: content,
    });

    await User.findByIdAndUpdate(req.user?._id, { $inc: { points: 10 } });

    const populatedQuestion = await Question.findById(question._id).populate(
      "user",
      "name",
    );

    emitToSession(session.code, "new_question", {
      ...populatedQuestion?.toObject(),
      refinementStatus: "pending",
      message: "Question submitted and queued for refinement",
    });

    queueQuestion({
      _id: question._id,
      content,
      sessionId: sessionId.toString(),
      userId: req.user?._id?.toString(),
      timestamp: Date.now(),
    });

    res.status(201).json({
      success: true,
      data: populatedQuestion,
      refinementStatus: "pending",
    });
  } catch (error) {
    console.error("Create question error:", error);
    res
      .status(500)
      .json({
        success: false,
        message: "Server error during question creation",
      });
  }
};

export const getSessionQuestions = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const questions = await Question.find({
      session: sessionId,
      status: "active",
    })
      .populate("user", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: questions.length,
      data: questions,
    });
  } catch (error) {
    console.error("Get questions error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error fetching questions" });
  }
};

// @desc    Request AI analysis (UPDATED 🔥)
export const requestAIAnalysis = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const question = await Question.findById(req.params.id).populate(
      "session",
      "code teacher",
    );

    if (!question) {
      res.status(404).json({ success: false, message: "Question not found" });
      return;
    }

    const session = question.session as any;

    if (session.teacher.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: "Only teacher allowed" });
      return;
    }

    if (question.analysisStatus === "completed" && question.aiAnalysis) {
      res.status(200).json({ success: true, data: question });
      return;
    }

    question.analysisStatus = "pending";
    await question.save();

    const pendingQuestion = await Question.findById(question._id).populate(
      "user",
      "name",
    );
    emitToSession(session.code, "update_question", pendingQuestion);

    res.status(200).json({
      success: true,
      data: pendingQuestion,
      message: "AI analysis started",
    });

    (async () => {
      try {
        const analysis = await analyzeQuestion(question.content);

        const updateData: any = {
          aiAnalysis: {
            ...analysis,
            answeredBy: analysis.complexity === "simple" ? "ai" : "teacher",
          },
          analysisStatus: "completed",
          isDirectToTeacher: analysis.complexity === "complex",
        };

        if (analysis.complexity === "simple" && analysis.aiAnswer) {
          updateData.teacherAnswer = analysis.aiAnswer;
          updateData.teacherAnsweredAt = new Date();
        }

        await Question.findByIdAndUpdate(question._id, updateData);

        const updatedQuestion = await Question.findById(question._id).populate(
          "user",
          "name",
        );

        emitToSession(session.code, "question_analyzed", updatedQuestion);
      } catch (err) {
        console.error("AI Analysis failed:", err);

        await Question.findByIdAndUpdate(question._id, {
          analysisStatus: "failed",
        });

        const failedQuestion = await Question.findById(question._id).populate(
          "user",
          "name",
        );

        emitToSession(session.code, "update_question", failedQuestion);
      }
    })();
  } catch (error) {
    console.error("Request AI analysis error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error requesting AI analysis" });
  }
};

export const processBatch = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { sessionId } = req.params;

    const session = await Session.findById(sessionId).populate("teacher");

    if (!session) {
      res.status(404).json({ success: false, message: "Session not found" });
      return;
    }

    if (session.teacher.toString() !== req.user?._id.toString()) {
      res.status(403).json({ success: false, message: "Only teacher allowed" });
      return;
    }

    const { triggerBatchProcessing } =
      await import("../services/questionBatchService");

    triggerBatchProcessing(sessionId);

    res.status(202).json({
      success: true,
      message: "Batch refinement triggered",
    });
  } catch (error) {
    console.error("Process batch error:", error);
    res
      .status(500)
      .json({ success: false, message: "Server error processing batch" });
  }
};

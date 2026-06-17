import { Request, Response } from "express";
import Question from "../models/Question";
import Session from "../models/Session";
import { io } from "../index";

// SUBMIT QUESTION
export const submitQuestion = async (req: Request, res: Response) => {
  try {
    const studentId = (req as any).user.id;
    const { sessionId, text } = req.body;

    const session = await Session.findById(sessionId);
    if (!session) return res.status(404).json({ message: "Session not found" });
    if (session.status === "ended") return res.status(400).json({ message: "Session has ended" });
    if (session.status === "paused") return res.status(400).json({ message: "Session is paused" });

    const question = await Question.create({
      sessionId,
      studentId,
      text,
      status: "pending",
    });

    const populated = await Question.findById(question._id).populate("studentId", "name");

    // Emit to teacher
    io.to(sessionId).emit("new-question", populated);

    res.status(201).json({ message: "Question submitted successfully", question });
  } catch (error) {
    console.error("SUBMIT QUESTION ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// GET ALL QUESTIONS
export const getQuestions = async (req: Request, res: Response) => {
  try {
    const { sessionId } = req.params;
    const questions = await Question.find({ sessionId })
      .populate("studentId", "name")
      .sort({ createdAt: 1 });
    res.status(200).json({ questions });
  } catch (error) {
    console.error("GET QUESTIONS ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

// ANSWER QUESTION
export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const { questionId } = req.params;
    const { answer } = req.body;

    const question = await Question.findByIdAndUpdate(
      questionId,
      { answer, status: "answered" },
      { new: true }
    ).populate("studentId", "name");

    if (!question) return res.status(404).json({ message: "Question not found" });

    io.to(question.sessionId.toString()).emit("question-answered", question);

    res.status(200).json({ message: "Answer submitted", question });
  } catch (error) {
    console.error("ANSWER QUESTION ERROR:", error);
    res.status(500).json({ message: "Server error", error });
  }
};

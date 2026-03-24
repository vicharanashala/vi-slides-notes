import { Request, Response } from "express";
import Question from "../models/Question";

export const submitQuestion = async (req : Request, res : Response) => {
  try {
    console.log("Incoming body:", req.body); // 👈 DEBUG

    const { content, sessionId } = req.body;
    const userId = req.user?.id || null;

    if (!content || !sessionId) {
      return res.status(400).json({
        success: false,
        message: "content and sessionId required",
      });
    }

    const question = await Question.create({
      content,
      session: sessionId,
      user: null
    });

    res.status(201).json({
      success: true,
      data: question,
    });
  } catch (error: any) {
    console.error("❌ QUESTION SUBMIT ERROR:", error); // 👈 KEY LINE
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
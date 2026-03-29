import { Request, Response } from "express";
import { geminiModel } from "../config/gemini";
import { AuthRequest } from "../middleware/auth.middleware";

export const generateAIAnswer = async (req: AuthRequest, res: Response) => {
  try {
    if (req.user?.role !== "Instructor") {
      return res.status(403).json({
        error: "Only instructors can use AI",
      });
    }
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ error: "Question required" });
    }

    const result = await geminiModel.generateContent([
      {
        text: `
          You are a helpful instructor.

          Return ONLY valid Markdown.

          Strict rules:
          - Start directly with Markdown (no intro text)
          - Use ## for title
          - Use ### for sections
          - Use bullet points or numbered lists
          - Use **bold** for key terms
          - Keep spacing clean
          - No JSON
          - No quotes
          - No escape characters
          - No explanations outside Markdown

          Structure:

          ## Title

          ### Explanation
          - Point 1
          - Point 2

          ### Conclusion
          Short summary

          Question:
          ${question}
          `,
      },
    ]);

    const answer = result.response.text();

    res.json({ answer });
  } catch (err) {
    console.error("Gemini error:", err);
    res.status(500).json({ error: "AI failed" });
  }
};

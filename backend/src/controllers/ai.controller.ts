import { Request, Response } from 'express';
import { analyzeQuestionPrompt } from '../services/ai.service';

export const analyzeQuestion = async (req: Request, res: Response) => {
    try {
        const { question } = req.body;
        if (!question) {
            return res.status(400).json({ error: "Question field is required in the body." });
        }
        
        const analysis = await analyzeQuestionPrompt(question);
        return res.status(200).json({ analysis });
    } catch (error) {
        console.error("Error in analyzeQuestion controller:", error);
        return res.status(500).json({ error: "Internal server error during analysis." });
    }
};

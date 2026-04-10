import { Request, Response } from 'express';
import Question from '../models/Question';
import Session from '../models/Session';
import { analyzeSessionMood } from '../services/ai.service';

export const getSessionAnalytics = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionCode } = req.params;
        
        const totalQuestions = await Question.countDocuments({ sessionCode });
        const autoAnswered = await Question.countDocuments({ sessionCode, status: 'answered_ai' });
        
        const complexityStats = await Question.aggregate([
            { $match: { sessionCode } },
            { $group: { _id: null, avgComplexity: { $avg: '$complexity' } } }
        ]);

        const avgComplexity = complexityStats.length > 0 ? parseFloat(complexityStats[0].avgComplexity.toFixed(1)) : 0;

        res.json({
            sessionCode,
            totalQuestions,
            autoAnswered,
            teacherAnswered: totalQuestions - autoAnswered,
            avgComplexity
        });
    } catch (error) {
        console.error('Analytics Error:', error);
        res.status(500).json({ message: 'Error retrieving metrics' });
    }
};

export const analyzeSessionMoodHandler = async (req: Request, res: Response): Promise<void> => {
    try {
        const { sessionCode } = req.params;
        
        // Fetch all questions for this session
        const questions = await Question.find({ sessionCode });
        const questionTexts = questions.map(q => q.question);
        
        // Analyze mood
        const moodResult = await analyzeSessionMood(questionTexts);
        
        // Update session
        const updatedSession = await Session.findOneAndUpdate(
            { sessionCode },
            { mood: moodResult.mood },
            { new: true }
        );
        
        if (!updatedSession) {
            res.status(404).json({ message: 'Session not found' });
            return;
        }
        
        res.json({
            sessionCode,
            mood: moodResult.mood,
            summary: moodResult.summary
        });
    } catch (error) {
        console.error('Mood Analysis Error:', error);
        res.status(500).json({ message: 'Error analyzing session mood' });
    }
};

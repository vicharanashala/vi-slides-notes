import Question from '../models/Question';
import { emitToSession } from '../config/socket';
import { analyzeQuestion } from './aiService';

const emitQuestionUpdate = async (questionId: string, sessionCode: string, event: 'update_question' | 'question_analyzed') => {
    const populatedQuestion = await Question.findById(questionId).populate('user', 'name');
    if (populatedQuestion) {
        emitToSession(sessionCode, event, populatedQuestion);
        if (event === 'question_analyzed') {
            emitToSession(sessionCode, 'update_question', populatedQuestion);
        }
    }
};

export const autoAnalyzeQuestion = async (questionId: string, sessionCode: string, questionText: string): Promise<void> => {
    try {
        await Question.findByIdAndUpdate(questionId, {
            analysisStatus: 'pending'
        });

        await emitQuestionUpdate(questionId, sessionCode, 'update_question');

        const analysis = await analyzeQuestion(questionText);

        await Question.findByIdAndUpdate(questionId, {
            aiAnalysis: analysis,
            analysisStatus: 'completed',
            isDirectToTeacher: analysis.complexity === 'complex'
        });

        await emitQuestionUpdate(questionId, sessionCode, 'question_analyzed');
    } catch (error) {
        console.error(`Auto analysis failed for question ${questionId}:`, error);

        await Question.findByIdAndUpdate(questionId, {
            analysisStatus: 'failed',
            isDirectToTeacher: true
        });

        await emitQuestionUpdate(questionId, sessionCode, 'update_question');
    }
};

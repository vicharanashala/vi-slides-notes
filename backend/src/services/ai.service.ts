import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';
// Load environment variables early, in case this service is run independently
dotenv.config();

const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
});

export const analyzeQuestionPrompt = async (question: string) => {
    try {
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please analyze this student question: "${question}"`,
            config: {
                systemInstruction: `You are 'Vi-SlideS Smart Triage AI', an advanced educational teaching assistant.
Your goal is to perform Cognitive Complexity Classification on student questions and decide if they should be auto-answered or sent to the live teacher.

1. Evaluate the question's complexity on a scale from 1 to 10.
2. Classify its cognitive level (e.g., "Factual", "Conceptual", "Procedural", "Analytical").
3. Determine the general category or topic of the question.
4. Auto-Answering Logic:
   - If complexity <= 4 (e.g., simple factual queries), provide a clear, concise direct answer in 'suggestedAnswer' and set 'action' to 'auto_answer'.
   - If complexity > 4 (e.g., conceptual, subjective, or complex analytical queries), provide a brief helpful hint or leave empty in 'suggestedAnswer', and set 'action' to 'forward_to_teacher'.

Output STRICTLY valid JSON with the following schema:
{
  "complexity": number (1-10),
  "cognitiveLevel": string,
  "category": string,
  "suggestedAnswer": string,
  "action": "auto_answer" | "forward_to_teacher"
}`,
                responseMimeType: "application/json",
            }
        });
        
        return response.text ? JSON.parse(response.text) : null;
    } catch (error) {
        console.error("Error analyzing question via Gemini:", error);
        return {
            complexity: 5,
            cognitiveLevel: "Unknown",
            category: "Error",
            suggestedAnswer: "AI processing error. Forwarding to teacher.",
            action: "forward_to_teacher",
            error: true
        };
    }
};

export const analyzeSessionMood = async (questions: string[]) => {
    try {
        if (!questions || questions.length === 0) {
            return { mood: 'neutral', summary: 'No questions asked yet.' };
        }

        const questionsText = questions.map((q, i) => `${i + 1}. ${q}`).join('\\n');
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Please analyze the overall mood and sentiment of the class based on these questions: \\n${questionsText}`,
            config: {
                systemInstruction: `You are 'Vi-SlideS Smart Triage AI', an advanced educational teaching assistant.
Your goal is to perform a Sentiment and Mood Analysis on a batch of student questions from a single class session.

1. Evaluate the questions to understand the collective state of the students.
2. Determine the overall 'mood' using one of these strict categories: 'engaged', 'confused', 'frustrated', 'bored', 'curious', or 'neutral'.
3. Provide a brief 1-2 sentence 'summary' explaining why this mood was chosen.

Output STRICTLY valid JSON with the following schema:
{
  "mood": string,
  "summary": string
}`,
                responseMimeType: "application/json",
            }
        });
        
        return response.text ? JSON.parse(response.text) : { mood: 'neutral', summary: 'Failed to parse AI response.' };
    } catch (error) {
        console.error("Error analyzing session mood via Gemini:", error);
        return {
            mood: 'neutral',
            summary: 'Error analyzing session mood.',
            error: true
        };
    }
};

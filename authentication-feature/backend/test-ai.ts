import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

async function listModels() {
    try {
        console.log('Using Key:', process.env.GEMINI_API_KEY?.substring(0, 10) + '...');
        // The SDK doesn't have a direct listModels top level, we might need to use the REST API or just trial and error
        // Actually, let's just try to hit the "v1" endpoint instead of "v1beta" manually if we were using fetch, 
        // but since we use the SDK, let's try just one more specific model string.

        const modelsToTest = ['gemini-1.5-flash', 'gemini-1.5-flash-8b', 'gemini-1.5-pro', 'gemini-pro'];

        for (const modelName of modelsToTest) {
            try {
                const model = genAI.getGenerativeModel({ model: modelName });
                const result = await model.generateContent("Hi");
                const response = await result.response;
                console.log(`✅ Success with ${modelName}:`, response.text().substring(0, 20));
                return;
            } catch (e: any) {
                console.log(`❌ Failed with ${modelName}:`, e.message);
            }
        }
    } catch (err: any) {
        console.error('Fatal error:', err.message);
    }
}

listModels();

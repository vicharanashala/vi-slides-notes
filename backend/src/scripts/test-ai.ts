import { analyzeQuestionPrompt } from '../services/ai.service';

const test = async () => {
    // Take the question from the command line arguments, or use a default one
    const question = process.argv[2] || "Can you explain the difference between mitosis and meiosis?";
    console.log(`Testing AI Service with Question: "${question}"`);
    console.log('---');
    
    const result = await analyzeQuestionPrompt(question);
    
    console.log("AI Analysis Result:");
    console.log(JSON.stringify(result, null, 2));
};

test();

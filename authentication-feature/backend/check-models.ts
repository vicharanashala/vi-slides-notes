import axios from 'axios';
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
    try {
        console.log('Testing Key:', apiKey?.substring(0, 10) + '...');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
        const response = await axios.get(url);

        console.log('--- List of available models ---');
        const models = response.data.models;
        models.forEach((m: any) => {
            if (m.name.includes('gemini')) {
                console.log(`Model: ${m.name} | Methods: ${m.supportedGenerationMethods}`);
            }
        });

    } catch (err: any) {
        if (err.response) {
            console.error('❌ API Error:', err.response.status, err.response.data);
        } else {
            console.error('❌ Error:', err.message);
        }
    }
}

checkModels();

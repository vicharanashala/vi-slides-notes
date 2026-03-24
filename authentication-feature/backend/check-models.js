const dotenv = require('dotenv');
const path = require('path');

dotenv.config({ path: path.join(__dirname, '.env') });

const apiKey = process.env.GEMINI_API_KEY;

async function checkModels() {
    try {
        console.log('Testing Key:', apiKey ? apiKey.substring(0, 10) + '...' : 'MISSING');
        const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;

        const response = await fetch(url);
        const data = await response.json();

        if (data.error) {
            console.error('❌ API Error:', JSON.stringify(data.error, null, 2));
            return;
        }

        console.log('--- Full List of available models ---');
        const models = data.models;
        if (!models) {
            console.log('No models found.');
            return;
        }

        models.forEach((m) => {
            console.log(`- ${m.name}`);
        });

    } catch (err) {
        console.error('❌ Fatal Error:', err.message);
    }
}

checkModels();

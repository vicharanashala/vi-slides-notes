const axios = require('axios');

async function testAuth() {
    try {
        console.log('Testing Registration...');
        const regRes = await axios.post('http://localhost:5000/api/auth/register', {
            name: 'Test Student',
            email: 'test@student.com',
            password: 'password123',
            role: 'student'
        });
        console.log('Registration Success:', regRes.data);

        console.log('\nTesting Login...');
        const loginRes = await axios.post('http://localhost:5000/api/auth/login', {
            email: 'test@student.com',
            password: 'password123'
        });
        console.log('Login Success:', loginRes.data);

        console.log('\nTesting Session Creation...');
        const sessionRes = await axios.post('http://localhost:5000/api/sessions', {
            teacherId: regRes.data._id
        });
        console.log('Session Creation Success:', sessionRes.data);

    } catch (error) {
        console.error('Test Failed:', error.response ? error.response.data : error.message);
    }
}

testAuth();

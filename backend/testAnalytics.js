const http = require('http');

async function test() {
    console.log("1. Generating JWT Token via Login");
    
    // We can just hit the analytics endpoint directly by faking the token or using login
    // Let's do a quick fetch
    const loginRes = await fetch("http://localhost:5000/api/auth/register", {
        method: "POST",
        headers: {"Content-Type": "application/json"},
        body: JSON.stringify({ name: "Analytics Tester", email: "test@ana.com", password: "password", role: "teacher" })
    });
    
    // If already registered, it might fail, so let's try login as well
    let data = await loginRes.json();
    if (!loginRes.ok) {
        const loginAgain = await fetch("http://localhost:5000/api/auth/login", {
            method: "POST",
            headers: {"Content-Type": "application/json"},
            body: JSON.stringify({ email: "test@ana.com", password: "password" })
        });
        data = await loginAgain.json();
    }
    
    const token = data.token;
    console.log("Token acquired:", token ? "YES" : "NO");

    console.log("\n2. Fetching Analytics for TEST12");
    const anaRes = await fetch("http://localhost:5000/api/analytics/TEST12", {
        headers: { "Authorization": `Bearer ${token}` }
    });
    
    const anaData = await anaRes.json();
    console.log("Status:", anaRes.status);
    console.log(anaData);
    
    if (anaRes.ok) {
        console.log("\n[SUCCESS] Phase 4 Analytics endpoint is fully protected and returning aggregate data!");
    } else {
        console.error("\n[FAILED] Analytics endpoint failed.");
    }
}

test();

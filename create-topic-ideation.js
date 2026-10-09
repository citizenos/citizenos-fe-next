const http = require('http');
const https = require('https');

async function run() {
  const email = process.env.E2E_USER_EMAIL;
  const password = process.env.E2E_USER_PASSWORD;
  
  const agent = new https.Agent({ rejectUnauthorized: false });
  
  // 1. Login
  const loginRes = await fetch('https://localhost:3001/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
    agent
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  
  // 2. Create topic
  const topicRes = await fetch('https://localhost:3001/api/topics', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({
      title: "Playwright Ideation Test",
      visibility: "private",
      status: "ideation",
      description: "Testing ideation visual parity"
    }),
    agent
  });
  const topicData = await topicRes.json();
  const topicId = topicData.data.id;
  
  console.log("TOPIC_ID=" + topicId);
}

run().catch(console.error);

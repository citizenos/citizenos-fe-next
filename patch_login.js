const fs = require('fs');
let file = fs.readFileSync('e2e/specs/ideation-visual.spec.ts', 'utf8');

file = file.replace(/  const email = process.env\['E2E_USER_EMAIL'\];\n  const password = process.env\['E2E_USER_PASSWORD'\];\n\n  \/\/ Login via UI to get the session set up in the browser\n  const loginUrl = TARGET === 'legacy' \? `\$\{BASE_URL\}\/account\/login` : `\$\{BASE_URL\}\/en\/account\/login`;\n  await page.goto\(loginUrl, \{ waitUntil: 'networkidle' \}\);\n  \n  if \(TARGET === 'legacy'\) \{\n    await page.fill\('input\\[type="email"\\]', email\);\n    await page.fill\('input\\[type="password"\\]', password\);\n    await page.click\('button:has-text\("Log in"\)'\);\n  \} else \{\n    await page.fill\('input\\[type="email"\\]', email\);\n    await page.fill\('input\\[type="password"\\]', password\);\n    await page.click\('cos-button:has-text\("Log in"\)'\);\n  \}\n  \n  await page.waitForTimeout\(3000\);/, `  const email = process.env['E2E_USER_EMAIL'];
  const password = process.env['E2E_USER_PASSWORD'];

  // Fetch token directly from API to bypass UI issues
  const loginRes = await page.request.post(\`\${API_URL}/api/auth/login\`, {
    data: { email, password },
    ignoreHTTPSErrors: true
  });
  const loginData = await loginRes.json();
  const token = loginData.data.token;
  
  // Set the cookie
  await page.context().addCookies([
    {
      name: 'citizenos_session',
      value: token,
      domain: 'localhost',
      path: '/'
    }
  ]);`);

fs.writeFileSync('e2e/specs/ideation-visual.spec.ts', file);

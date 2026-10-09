const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  // Login as admin
  await page.goto('http://localhost:4200/en/account/login');
  await page.fill('input[type="email"]', 'citizenos@citizenos.com');
  await page.fill('input[type="password"]', 'password');
  await page.click('button[type="submit"]');
  await page.waitForURL('**/my/topics');
  
  // Wait a bit
  await page.waitForTimeout(2000);
  
  const response = await page.request.get('http://localhost:3003/api/topics?status=ideation');
  const body = await response.json();
  if (body.data.rows.length === 0) {
      console.log("No ideation topics!");
      await browser.close();
      return;
  }
  const topicId = body.data.rows[0].id;
  
  await page.goto(`http://localhost:4200/en/topics/${topicId}`);
  await page.waitForSelector('.ideation_header');
  
  const header = await page.$('.ideation_header');
  await header.screenshot({ path: '/home/ilmar/.gemini/antigravity-cli/brain/fea3d26b-1834-46bd-9233-2a5b062ccd0b/header_screenshot.png' });
  console.log("Screenshot saved!");
  await browser.close();
})();

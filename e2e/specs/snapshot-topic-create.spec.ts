import { test, expect } from '@playwright/test';

test.use({ viewport: { width: 1280, height: 800 } });

test('Snapshot Topic Create', async ({ page }) => {
  await page.goto('https://localhost:4200/en/topics/create', { waitUntil: 'networkidle' });
  
  // Login
  const email = process.env['E2E_USER_EMAIL'];
  const password = process.env['E2E_USER_PASSWORD'];
  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);
  await page.click('button:has-text("Log in")');
  
  await page.waitForTimeout(3000);
  
  await page.goto('https://localhost:4200/en/topics/create', { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/home/ilmar/.gemini/antigravity-cli/brain/fea3d26b-1834-46bd-9233-2a5b062ccd0b/next-topic-create.png', fullPage: true });
});

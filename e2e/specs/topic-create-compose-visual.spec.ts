import { test, expect } from '@playwright/test';
import { API_URL } from '../fixtures/test-fixtures';

const TARGET = process.env['TARGET'] || 'next';
const LEGACY_URL = process.env['LEGACY_FE_URL'] || 'http://localhost:3000';
const NEXT_URL = process.env['NEXT_FE_URL'] || 'https://localhost:4200';
const BASE_URL = TARGET === 'legacy' ? LEGACY_URL : NEXT_URL;

test.use({ viewport: { width: 1280, height: 800 } });

test('Compare topic create compose step', async ({ page }) => {
  const email = process.env['E2E_USER_EMAIL'];
  const password = process.env['E2E_USER_PASSWORD'];

  // Login via UI to get the session set up in the browser
  const loginUrl = TARGET === 'legacy' ? `${BASE_URL}/account/login` : `${BASE_URL}/en/account/login`;
  await page.goto(loginUrl, { waitUntil: 'networkidle' });
  
  if (TARGET === 'legacy') {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('button:has-text("Log in")');
  } else {
    await page.fill('input[type="email"]', email);
    await page.fill('input[type="password"]', password);
    await page.click('cos-button:has-text("Log in")');
  }
  
  await page.waitForTimeout(3000);

  // Navigate to create topic
  const createUrl = TARGET === 'legacy' ? `${BASE_URL}/topics/create` : `${BASE_URL}/en/topics/create`;
  await page.goto(createUrl, { waitUntil: 'networkidle' });
  
  await page.waitForTimeout(3000);

  // Take full page screenshot
  await expect(page).toHaveScreenshot(`topic-create-compose-baseline.png`, {
    fullPage: true,
    maxDiffPixelRatio: 0.1,
    animations: 'disabled'
  });
});

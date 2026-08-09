import { test as setup } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { getEnv, API_URL, BASE_URL, DEFAULT_LANG } from './fixtures/test-fixtures';

const authFile = path.join(__dirname, '.auth/user.json');

/**
 * Global authentication setup.
 *
 * Logs in via the frontend login page and saves the authenticated
 * browser storage state (cookies) to .auth/user.json.
 * All "authenticated" project tests reuse this state.
 */
setup('authenticate', async ({ page }) => {
  const email = getEnv('E2E_USER_EMAIL');
  const password = getEnv('E2E_USER_PASSWORD');

  if (!email || !password) {
    throw new Error(
      'E2E_USER_EMAIL and E2E_USER_PASSWORD must be set.\n' +
      'Copy e2e/.env.example to e2e/.env and fill in your test credentials.'
    );
  }

  // Ensure .auth directory exists
  const authDir = path.dirname(authFile);
  if (!fs.existsSync(authDir)) {
    fs.mkdirSync(authDir, { recursive: true });
  }

  // Navigate to login page
  await page.goto(`${BASE_URL}/${DEFAULT_LANG}/account/login`, {
    waitUntil: 'networkidle',
  });

  // Fill in credentials and submit
  await page.locator('input[type="email"]').fill(email);
  await page.locator('input[type="password"]').fill(password);

  // Click the login/submit button (cos-button with type="submit")
  await page.locator('cos-button[type="submit"]').click();

  // Check if there's an error banner (e.g. invalid credentials)
  // We use Promise.race to either see the URL change or see the error
  await Promise.race([
    page.waitForURL(url => !url.pathname.includes('/account/login'), { timeout: 15000 }),
    page.waitForSelector('.error-banner', { state: 'visible', timeout: 15000 }).then(() => {
      throw new Error('Login failed: Invalid credentials or API error. Check the error banner in the UI.');
    })
  ]);

  // Verify we are authenticated by checking for the main app root
  await page.waitForSelector('app-root', { state: 'attached', timeout: 10000 });

  await page.evaluate(() => {
    localStorage.setItem('onboarding_topic', 'true');
    localStorage.setItem('onboarding_ideation', 'true');
    localStorage.setItem('onboarding_group', 'true');
    localStorage.setItem('onboarding_dashboard', 'true');
    localStorage.setItem('show-topic-tour', 'true');
    localStorage.setItem('show-ideation-tour', 'true');
    localStorage.setItem('show-dashboard-tour', 'true');
  });

  // Save the authenticated state
  await page.context().storageState({ path: authFile });
});

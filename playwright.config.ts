import { defineConfig, devices } from '@playwright/test';
import * as path from 'path';

/**
 * Playwright configuration for citizenos-fe-next E2E tests.
 *
 * Expects a running dev environment (all three services):
 *  - Frontend:  https://dev.citizenos.com:3001 (ng serve with SSL)
 *  - API:       https://dev.api.citizenos.com:3003
 *  - Etherpad:  https://dev.p.citizenos.com:9001 (required for topic create/edit)
 *
 * Test credentials are read from e2e/.env (see e2e/.env.example).
 */
export default defineConfig({
  testDir: './e2e/specs',
  fullyParallel: true,
  forbidOnly: !!process.env['CI'],
  retries: process.env['CI'] ? 2 : 0,
  workers: process.env['CI'] ? 1 : undefined,
  reporter: process.env['CI']
    ? [['html', { open: 'never' }], ['list']]
    : 'html',

  // Load test credentials from e2e/.env
  // dotenv is not needed — Playwright natively supports this via the
  // environment or we read it in the setup script.

  use: {
    baseURL: process.env['E2E_BASE_URL'] || 'https://dev.citizenos.com:3001',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',

    // Accept self-signed SSL certs in development
    ignoreHTTPSErrors: true,

    // Default locale and timezone
    locale: 'en-US',
    timezoneId: 'Europe/Tallinn',
  },

  projects: [
    // ---------- Auth Setup ----------
    {
      name: 'auth-setup',
      testDir: './e2e',
      testMatch: 'auth.setup.ts',
    },

    // ---------- Public pages (no login required) ----------
    {
      name: 'public',
      use: { ...devices['Desktop Chrome'] },
      testMatch: [
        'home.spec.ts',
        'navigation.spec.ts',
        'public-topics.spec.ts',
        'public-groups.spec.ts',
      ],
    },

    // ---------- Authenticated pages ----------
    {
      name: 'authenticated',
      use: {
        ...devices['Desktop Chrome'],
        storageState: path.join(__dirname, 'e2e/.auth/user.json'),
      },
      dependencies: ['auth-setup'],
      testMatch: [
        'auth.spec.ts',
        'dashboard.spec.ts',
        'topic-view.spec.ts',
        'topic-create.spec.ts',
      ],
    },

    // ---------- Mobile viewport ----------
    {
      name: 'mobile',
      use: {
        ...devices['iPhone 14'],
        storageState: path.join(__dirname, 'e2e/.auth/user.json'),
      },
      dependencies: ['auth-setup'],
      testMatch: ['home.spec.ts', 'navigation.spec.ts'],
    },
  ],

  // Do NOT auto-start the dev server — it requires SSL certs and
  // the API must also be running. Start both manually before running tests.
  // webServer: {
  //   command: 'npm start',
  //   url: 'https://dev.citizenos.com:3001',
  //   reuseExistingServer: true,
  //   ignoreHTTPSErrors: true,
  // },
});

import { test as base, expect, type Page, type APIRequestContext } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Load test environment variables from e2e/.env file.
 * Falls back to process.env if .env file doesn't exist.
 */
function loadEnv(): Record<string, string> {
  const envPath = path.join(__dirname, '..', '.env');
  const env: Record<string, string> = {};

  if (fs.existsSync(envPath)) {
    const content = fs.readFileSync(envPath, 'utf-8');
    for (const line of content.split('\n')) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIndex = trimmed.indexOf('=');
      if (eqIndex === -1) continue;
      const key = trimmed.slice(0, eqIndex).trim();
      const value = trimmed.slice(eqIndex + 1).trim();
      env[key] = value;
    }
  }

  return env;
}

const envVars = loadEnv();

export function getEnv(key: string, fallback?: string): string {
  return process.env[key] || envVars[key] || fallback || '';
}

/** API base URL for direct API calls in tests */
export const API_URL = getEnv('E2E_API_URL', 'https://dev.api.citizenos.com:3003');

/** Etherpad base URL — required for topic creation and editing */
export const ETHERPAD_URL = getEnv('E2E_ETHERPAD_URL', 'https://dev.p.citizenos.com:9001');

/** Frontend base URL */
export const BASE_URL = getEnv('E2E_BASE_URL', 'https://dev.citizenos.com:3001');

/** Default language prefix for routes */
export const DEFAULT_LANG = 'en';

/**
 * Helper to build a full route path with language prefix.
 * e.g. route('/dashboard') → '/en/dashboard'
 */
export function route(path: string): string {
  const clean = path.startsWith('/') ? path.slice(1) : path;
  return `/${DEFAULT_LANG}/${clean}`;
}

/**
 * Wait for the Angular app to finish initializing.
 * Waits for the app-root to be present and initial API calls to settle.
 */
export async function waitForApp(page: Page): Promise<void> {
  await page.waitForSelector('app-root', { state: 'attached', timeout: 15000 });
  // await page.waitForLoadState('networkidle');
  await page.waitForLoadState('domcontentloaded');
  await page.waitForTimeout(1500); // Give Angular zoneless a moment to fully render DOM
}

/**
 * Custom test fixtures that extend Playwright's base test.
 *
 * - `authenticatedPage`: A page with saved authentication cookies
 * - `apiContext`: An API request context for direct API calls
 */
export const test = base.extend<{
  apiContext: APIRequestContext;
}>({
  apiContext: async ({ playwright }, use) => {
    const context = await playwright.request.newContext({
      baseURL: API_URL,
      ignoreHTTPSErrors: true,
    });
    await use(context);
    await context.dispose();
  },
});

export { expect };

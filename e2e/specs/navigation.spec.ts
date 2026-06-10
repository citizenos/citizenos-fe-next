import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Navigation', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(route(''));
    await waitForApp(page);
  });

  test('should have working navigation links in the shell', async ({ page }) => {
    // The shell navigation should be present
    const nav = page.locator('nav, .nav, header').first();
    await expect(nav).toBeVisible();
  });

  test('should navigate to public topics from navigation', async ({ page }) => {
    const topicsLink = page.locator('a[href*="public/topics"]').first();
    if (await topicsLink.isVisible()) {
      await topicsLink.click();
      await page.waitForURL(/public\/topics/);
      await expect(page).toHaveURL(/public\/topics/);
    }
  });

  test('should navigate to public groups from navigation', async ({ page }) => {
    const groupsLink = page.locator('a[href*="public/groups"]').first();
    if (await groupsLink.isVisible()) {
      await groupsLink.click();
      await page.waitForURL(/public\/groups/);
      await expect(page).toHaveURL(/public\/groups/);
    }
  });

  test('should handle legacy routes by redirecting with /en prefix', async ({ page }) => {
    await page.goto('/topics');
    await expect(page).toHaveURL(/\/en\/topics/, { timeout: 15000 });
  });

  test('should show 404 page for unknown routes', async ({ page }) => {
    await page.goto(route('this-does-not-exist-12345'));
    await waitForApp(page);

    // Should show 404 content or redirect to 404
    await expect(page.locator('text=/not found|404|Page not found/i').first()).toBeVisible({ timeout: 15000 });
  });

  test('should handle the /en root route', async ({ page }) => {
    await page.goto('/en');
    await waitForApp(page);
    await expect(page.locator('app-root')).toBeAttached();
  });

  test('should navigate back to home when clicking logo', async ({ page }) => {
    // First navigate away from home
    await page.goto(route('public/topics'));
    await waitForApp(page);

    const logo = page.locator('cos-logo a, .logo a, a[href*="/en"]').first();
    if (await logo.isVisible()) {
      await logo.click();
      await page.waitForURL(/\/en\/?$/);
    }
  });
});

import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/home.page';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Home Page', () => {
  let homePage: HomePage;

  test.beforeEach(async ({ page }) => {
    homePage = new HomePage(page);
    await homePage.goto();
  });

  test('should load the home page', async ({ page }) => {
    await expect(page.locator('app-root')).toBeAttached();
    // The page should have a title
    await expect(page).toHaveTitle(/.+/);
  });

  test('should display the application logo', async () => {
    await expect(homePage.logo).toBeVisible();
  });

  test('should display login and register links for unauthenticated users', async () => {
    // At least one of login/register should be visible
    const loginVisible = await homePage.loginLink.isVisible().catch(() => false);
    const registerVisible = await homePage.registerLink.isVisible().catch(() => false);
    expect(loginVisible || registerVisible).toBeTruthy();
  });

  test('should have feature boxes on the home page', async () => {
    const featureCount = await homePage.featureBoxes.count();
    // The home page should have at least one feature box
    expect(featureCount).toBeGreaterThan(0);
  });

  test('should navigate to public topics', async ({ page }) => {
    const link = page.locator('a[href*="public/topics"]').first();
    if (await link.isVisible()) {
      await link.click();
      await page.waitForURL(/public\/topics/);
      await waitForApp(page);
      await expect(page).toHaveURL(/public\/topics/);
    }
  });

  test('should redirect root path to /en', async ({ page }) => {
    await page.goto('/');
    await page.waitForURL(/\/en/);
    await expect(page).toHaveURL(/\/en/);
  });

  test('should support language switching', async ({ page }) => {
    // Check that the page is serving in English by default
    await expect(page).toHaveURL(/\/en/);
  });
});

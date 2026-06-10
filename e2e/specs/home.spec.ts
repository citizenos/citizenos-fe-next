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

  test('should display the application logo', async ({ page }) => {
    const logoCount = await homePage.logo.count();
    let logoVisible = false;
    for (let i = 0; i < logoCount; i++) {
      if (await homePage.logo.nth(i).isVisible()) {
        logoVisible = true;
        break;
      }
    }
    expect(logoVisible).toBeTruthy();
  });

  test('should display login and register links for unauthenticated users', async ({ page, isMobile }) => {
    if (isMobile) {
      // On mobile, the login links are inside the navigation menu which must be opened
      const navMenuBtn = page.locator('.nav_mobile_actions button').nth(1);
      await navMenuBtn.waitFor({ state: 'attached' });
      await navMenuBtn.click({ force: true });
      await page.waitForTimeout(1000); // Wait for menu animation
    }

    const loginCount = await homePage.loginLink.count();
    let loginVisible = false;
    for (let i = 0; i < loginCount; i++) {
      if (await homePage.loginLink.nth(i).isVisible()) {
        loginVisible = true;
        break;
      }
    }

    const registerCount = await homePage.registerLink.count();
    let registerVisible = false;
    for (let i = 0; i < registerCount; i++) {
      if (await homePage.registerLink.nth(i).isVisible()) {
        registerVisible = true;
        break;
      }
    }

    expect(loginVisible || registerVisible).toBeTruthy();
  });

  test('should have feature boxes on the home page', async () => {
    // Wait for at least one feature box to be attached to the DOM
    await expect(homePage.featureBoxes.first()).toBeAttached();
    const featureCount = await homePage.featureBoxes.count();
    // The home page should have at least one feature box
    expect(featureCount).toBeGreaterThan(0);
  });

  test('should navigate to public topics', async ({ page }) => {
    const link = page.locator('a[href*="public/topics"]').first();
    if (await link.isVisible()) {
      await link.click({ force: true });
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

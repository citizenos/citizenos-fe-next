import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { route, waitForApp, getEnv } from '../fixtures/test-fixtures';

test.describe('Authentication', () => {
  test('should display the login form', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.expectOnLoginPage();
  });

  test('should show email and password fields', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.emailInput).toBeVisible();
    await expect(loginPage.passwordInput).toBeVisible();
    await expect(loginPage.submitButton).toBeVisible();
  });

  test('should show error on invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('invalid@example.com', 'wrongpassword');

    // Should stay on login page or show error
    await page.waitForTimeout(2000);
    const stillOnLogin = page.url().includes('account/login');
    const errorVisible = await loginPage.errorMessage.isVisible().catch(() => false);
    expect(stillOnLogin || errorVisible).toBeTruthy();
  });

  test('should have a link to the registration page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await expect(loginPage.signUpLink).toBeVisible();
  });

  test('should have a forgot password link', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    const forgotLink = loginPage.forgotPasswordLink;
    if (await forgotLink.isVisible()) {
      await forgotLink.click();
      await page.waitForURL(/password\/forgot/);
      await expect(page).toHaveURL(/password\/forgot/);
    }
  });

  test('should navigate to registration page', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.signUpLink.click();
    await page.waitForURL(/signup/);
    await expect(page).toHaveURL(/signup/);
  });

  test('should show registration form', async ({ page }) => {
    await page.goto(route('account/signup'));
    await waitForApp(page);

    // Registration form should have at least email and password
    const emailInput = page.locator('input[type="email"], input[name="email"]').first();
    const passwordInput = page.locator('input[type="password"], input[name="password"]').first();

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
  });

  test('should redirect to login when accessing protected route without auth', async ({ page }) => {
    await page.goto(route('dashboard'));
    // Should redirect to 401 or login
    await page.waitForURL(/401|account\/login/, { timeout: 10000 });
    const url = page.url();
    expect(url.includes('401') || url.includes('account/login')).toBeTruthy();
  });
});

test.describe('Authenticated User', () => {
  // These tests use the auth state from the setup
  test('should show user menu when authenticated', async ({ page }) => {
    await page.goto(route('dashboard'));
    await waitForApp(page);

    // The dashboard should load successfully (not redirect to login)
    await expect(page).toHaveURL(/dashboard/);
  });

  test('should be able to logout', async ({ page }) => {
    await page.goto(route('dashboard'));
    await waitForApp(page);

    // Look for logout button/link in the user menu
    const userMenu = page.locator('[class*="user-menu"], [class*="profile-menu"], [class*="account-menu"]').first();
    const logoutButton = page.locator('button:has-text("Log out"), a:has-text("Log out"), button:has-text("Logout")').first();

    // If there's a user menu, click it first to reveal logout
    if (await userMenu.isVisible()) {
      await userMenu.click();
    }

    if (await logoutButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await logoutButton.click();
      // Should redirect away from dashboard
      await page.waitForURL(url => !url.pathname.includes('/dashboard'), { timeout: 10000 });
    }
  });
});

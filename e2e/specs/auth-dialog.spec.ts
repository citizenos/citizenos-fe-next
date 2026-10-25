import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Auth Dialog Flow', () => {
  // Public context without stored authentication
  test.use({ storageState: { cookies: [], origins: [] } });

  test.beforeEach(async ({ page }) => {
    await page.goto(route(''));
    await waitForApp(page);
  });

  test('should open login dialog when clicking log in button in navigation', async ({ page }) => {
    const loginBtn = page.locator('.big_button_wrap button.btn_big_submit, button:has-text("Log in")').first();
    await expect(loginBtn).toBeVisible();
    await loginBtn.click();

    const loginDialog = page.locator('app-login-dialog');
    await expect(loginDialog).toBeVisible();

    const emailInput = loginDialog.locator('input[type="email"]');
    const passwordInput = loginDialog.locator('input[type="password"]');
    const closeBtn = loginDialog.locator('.btn-dialog-close');

    await expect(emailInput).toBeVisible();
    await expect(passwordInput).toBeVisible();
    await expect(closeBtn).toBeVisible();
  });

  test('should close login dialog when clicking close button', async ({ page }) => {
    const loginBtn = page.locator('.big_button_wrap button.btn_big_submit, button:has-text("Log in")').first();
    await loginBtn.click();

    const loginDialog = page.locator('app-login-dialog');
    await expect(loginDialog).toBeVisible();

    const closeBtn = loginDialog.locator('.btn-dialog-close');
    await closeBtn.click();

    await expect(loginDialog).toBeHidden();
  });

  test('should close login dialog when pressing Escape', async ({ page }) => {
    const loginBtn = page.locator('.big_button_wrap button.btn_big_submit, button:has-text("Log in")').first();
    await loginBtn.click();

    const loginDialog = page.locator('app-login-dialog');
    await expect(loginDialog).toBeVisible();

    await page.keyboard.press('Escape');

    await expect(loginDialog).toBeHidden();
  });

  test('should switch between login and register dialogs seamlessly', async ({ page }) => {
    const loginBtn = page.locator('.big_button_wrap button.btn_big_submit, button:has-text("Log in")').first();
    await loginBtn.click();

    const loginDialog = page.locator('app-login-dialog');
    await expect(loginDialog).toBeVisible();

    // Click link to switch to register
    const switchToRegister = loginDialog.locator('.auth-footer a');
    await expect(switchToRegister).toBeVisible();
    await switchToRegister.click();

    const registerDialog = page.locator('app-register-dialog');
    await expect(registerDialog).toBeVisible();
    await expect(loginDialog).toBeHidden();

    // Switch back to login
    const switchToLogin = registerDialog.locator('.auth-footer a');
    await expect(switchToLogin).toBeVisible();
    await switchToLogin.click();

    await expect(page.locator('app-login-dialog')).toBeVisible();
    await expect(registerDialog).toBeHidden();
  });

  test('should open register dialog directly from navigation sign up button', async ({ page }) => {
    const registerBtn = page.locator('.big_button_wrap button.btn_big_submit_ghost, button:has-text("Sign up")').first();
    await expect(registerBtn).toBeVisible();
    await registerBtn.click();

    const registerDialog = page.locator('app-register-dialog');
    await expect(registerDialog).toBeVisible();

    const nameInput = registerDialog.locator('input[type="text"]');
    const emailInput = registerDialog.locator('input[type="email"]');
    await expect(nameInput).toBeVisible();
    await expect(emailInput).toBeVisible();
  });

  test('should open login dialog when clicking quick action create on homepage', async ({ page }) => {
    // Feature boxes or create group quick actions on homepage
    const createActionBtn = page.locator('.feature_box button, button.btn_home_create, .create_group_btn').first();
    if (await createActionBtn.isVisible()) {
      await createActionBtn.click();
      const loginDialog = page.locator('app-login-dialog');
      await expect(loginDialog).toBeVisible();
    }
  });
});

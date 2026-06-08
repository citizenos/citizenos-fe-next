import { type Page, type Locator, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

/**
 * Page Object Model for the Login page.
 * Route: /:lang/account/login
 */
export class LoginPage {
  readonly page: Page;

  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly signUpLink: Locator;
  readonly forgotPasswordLink: Locator;
  readonly errorMessage: Locator;

  // Social login buttons
  readonly googleLoginButton: Locator;
  readonly facebookLoginButton: Locator;

  constructor(page: Page) {
    this.page = page;

    this.emailInput = page.locator('input[type="email"], input[name="email"]').first();
    this.passwordInput = page.locator('input[type="password"], input[name="password"]').first();
    this.submitButton = page.locator('button[type="submit"]').first();
    this.signUpLink = page.locator('a[href*="signup"]').first();
    this.forgotPasswordLink = page.locator('a[href*="password/forgot"]').first();
    this.errorMessage = page.locator('[class*="error"], [class*="alert"], .notification--error').first();

    this.googleLoginButton = page.locator('a[href*="auth/google"], button:has-text("Google")').first();
    this.facebookLoginButton = page.locator('a[href*="auth/facebook"], button:has-text("Facebook")').first();
  }

  async goto() {
    await this.page.goto(route('account/login'));
    await waitForApp(this.page);
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async expectOnLoginPage() {
    await expect(this.page).toHaveURL(/account\/login/);
    await expect(this.emailInput).toBeVisible();
    await expect(this.passwordInput).toBeVisible();
  }

  async expectLoginError() {
    await expect(this.errorMessage).toBeVisible({ timeout: 5000 });
  }
}

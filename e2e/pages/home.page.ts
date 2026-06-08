import { type Page, type Locator, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

/**
 * Page Object Model for the Home page (public landing page).
 * Route: /:lang/
 */
export class HomePage {
  readonly page: Page;

  // Shell / Navigation
  readonly navbar: Locator;
  readonly logo: Locator;
  readonly loginLink: Locator;
  readonly registerLink: Locator;
  readonly languageSelector: Locator;

  // Home page content
  readonly heroSection: Locator;
  readonly featureBoxes: Locator;
  readonly publicTopicsLink: Locator;
  readonly publicGroupsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Navigation
    this.navbar = page.locator('nav, .nav, .header, app-shell header, cos-logo').first();
    this.logo = page.locator('cos-logo, .logo').first();
    this.loginLink = page.locator('a[href*="account/login"], button:has-text("log in"), button:has-text("Log in")').first();
    this.registerLink = page.locator('a[href*="account/signup"], button:has-text("sign up"), button:has-text("Sign up")').first();
    this.languageSelector = page.locator('[class*="language"], [data-testid="language-selector"]').first();

    // Content
    this.heroSection = page.locator('.hero, .home-hero, [class*="hero"]').first();
    this.featureBoxes = page.locator('app-feature-box, [class*="feature"]');
    this.publicTopicsLink = page.locator('a[href*="public/topics"]').first();
    this.publicGroupsLink = page.locator('a[href*="public/groups"]').first();
  }

  async goto() {
    await this.page.goto(route(''));
    await waitForApp(this.page);
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(new RegExp(`/${route('')}$|/en/?$`));
    // The app shell should be present
    await expect(this.page.locator('app-root')).toBeAttached();
  }
}

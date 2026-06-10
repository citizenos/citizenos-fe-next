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
    this.logo = page.locator('.desktop_logo cos-logo, .nav_mobile cos-logo');
    this.loginLink = page.locator('.nav_items_wrap a[href*="account/login"], .big_button_wrap a[href*="account/login"], #mobile_login button.btn_big_submit');
    this.registerLink = page.locator('.nav_items_wrap a[href*="account/signup"], .big_button_wrap a[href*="account/signup"], #mobile_login button.btn_big_submit_ghost');
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

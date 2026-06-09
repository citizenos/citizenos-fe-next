import { type Page, type Locator, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

/**
 * Page Object Model for the Dashboard page.
 * Route: /:lang/dashboard (requires authentication)
 */
export class DashboardPage {
  readonly page: Page;

  // Dashboard sections
  readonly topicsSection: Locator;
  readonly groupsSection: Locator;
  readonly topicCards: Locator;
  readonly groupCards: Locator;

  // Create actions
  readonly createTopicButton: Locator;
  readonly createGroupButton: Locator;
  readonly createMenu: Locator;

  // Quick links
  readonly myTopicsLink: Locator;
  readonly myGroupsLink: Locator;
  readonly publicTopicsLink: Locator;

  constructor(page: Page) {
    this.page = page;

    // Dashboard list sections
    this.topicsSection = page.locator('app-dashboard-list-section, [class*="dashboard"]').first();
    this.groupsSection = page.locator('app-dashboard-list-section, [class*="dashboard"]').last();
    this.topicCards = page.locator('cos-topic-card');
    this.groupCards = page.locator('cos-group-card');

    // Create actions
    this.createTopicButton = page.locator('a[href*="topics/create"], button:has-text("Create topic")').first();
    this.createGroupButton = page.locator('a[href*="groups/create"], button:has-text("Create group")').first();
    this.createMenu = page.locator('cos-create-menu').first();

    // Links
    this.myTopicsLink = page.locator('a[href*="my/topics"]').first();
    this.myGroupsLink = page.locator('a[href*="my/groups"]').first();
    this.publicTopicsLink = page.locator('a[href*="public/topics"]').first();
  }

  async goto() {
    await this.page.goto(route('dashboard'));
    await waitForApp(this.page);
  }

  async expectPageLoaded() {
    await expect(this.page).toHaveURL(/dashboard/);
    await expect(this.page.locator('app-root')).toBeAttached();
  }

  async expectTopicCardsVisible() {
    // Wait for at least one topic card, or an empty state
    const topicCard = this.topicCards.first();
    const emptyState = this.page.locator('[class*="empty"], [class*="no-results"], .no_engagements').first();
    await expect(topicCard.or(emptyState)).toBeVisible({ timeout: 10000 });
  }
}

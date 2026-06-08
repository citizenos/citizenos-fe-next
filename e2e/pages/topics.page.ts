import { type Page, type Locator, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

/**
 * Page Object Model for Topics pages.
 * Covers: public topics list, my topics, and topic detail view.
 */
export class TopicsPage {
  readonly page: Page;

  // Topic list
  readonly topicCards: Locator;
  readonly searchInput: Locator;
  readonly filterToolbar: Locator;
  readonly pagination: Locator;
  readonly emptyState: Locator;

  // Topic view
  readonly topicTitle: Locator;
  readonly topicContent: Locator;
  readonly topicTabs: Locator;
  readonly argumentsList: Locator;
  readonly voteSection: Locator;
  readonly ideationSection: Locator;
  readonly topicHeader: Locator;
  readonly topicInfoSidebar: Locator;

  // Topic actions
  readonly shareButton: Locator;
  readonly settingsButton: Locator;
  readonly participantsButton: Locator;
  readonly followButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // List view
    this.topicCards = page.locator('cos-topic-card');
    this.searchInput = page.locator('app-search-input, input[type="search"]').first();
    this.filterToolbar = page.locator('app-list-filter-toolbar').first();
    this.pagination = page.locator('cos-pagination').first();
    this.emptyState = page.locator('[class*="empty"], [class*="no-results"]').first();

    // Detail view
    this.topicTitle = page.locator('h1, [class*="topic-title"], [class*="topic-header"] h1').first();
    this.topicContent = page.locator('app-topic-content, [class*="topic-content"]').first();
    this.topicTabs = page.locator('cos-tabs, [class*="topic-tabs"]').first();
    this.argumentsList = page.locator('cos-argument, [class*="argument"]');
    this.voteSection = page.locator('app-topic-vote, [class*="vote"]').first();
    this.ideationSection = page.locator('app-topic-ideation, [class*="ideation"]').first();
    this.topicHeader = page.locator('app-topic-header, [class*="topic-header"]').first();
    this.topicInfoSidebar = page.locator('app-topic-info-sidebar, [class*="info-sidebar"]').first();

    // Actions
    this.shareButton = page.locator('button:has-text("Share"), [class*="share"]').first();
    this.settingsButton = page.locator('button:has-text("Settings"), a[href*="settings"]').first();
    this.participantsButton = page.locator('button:has-text("Participants"), a[href*="participants"]').first();
    this.followButton = page.locator('button:has-text("Follow"), [class*="follow"]').first();
  }

  async gotoPublicTopics() {
    await this.page.goto(route('public/topics'));
    await waitForApp(this.page);
  }

  async gotoMyTopics() {
    await this.page.goto(route('my/topics'));
    await waitForApp(this.page);
  }

  async gotoTopic(topicId: string) {
    await this.page.goto(route(`topics/${topicId}`));
    await waitForApp(this.page);
  }

  async expectTopicListLoaded() {
    // Wait for either topic cards or empty state
    const card = this.topicCards.first();
    const empty = this.emptyState;
    await expect(card.or(empty)).toBeVisible({ timeout: 15000 });
  }

  async expectTopicViewLoaded() {
    await expect(this.page).toHaveURL(/topics\/[a-f0-9-]+/);
    await expect(this.topicTitle).toBeVisible({ timeout: 10000 });
  }

  async getTopicCount(): Promise<number> {
    return this.topicCards.count();
  }

  /** Click on the first topic card in a list to navigate to its detail view */
  async clickFirstTopic() {
    await this.topicCards.first().click();
    await this.page.waitForURL(/topics\/[a-f0-9-]+/);
    await waitForApp(this.page);
  }
}

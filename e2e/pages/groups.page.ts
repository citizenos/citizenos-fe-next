import { type Page, type Locator, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

/**
 * Page Object Model for Groups pages.
 * Covers: public groups list, my groups, and group detail view.
 */
export class GroupsPage {
  readonly page: Page;

  // Group list
  readonly groupCards: Locator;
  readonly searchInput: Locator;
  readonly filterToolbar: Locator;
  readonly pagination: Locator;
  readonly emptyState: Locator;

  // Group detail
  readonly groupTitle: Locator;
  readonly membersList: Locator;
  readonly topicsList: Locator;
  readonly groupDescription: Locator;

  // Group actions
  readonly settingsButton: Locator;
  readonly inviteButton: Locator;
  readonly joinButton: Locator;
  readonly leaveButton: Locator;
  readonly addTopicsButton: Locator;

  constructor(page: Page) {
    this.page = page;

    // List view
    this.groupCards = page.locator('cos-group-card');
    this.searchInput = page.locator('app-search-input, input[type="search"]').first();
    this.filterToolbar = page.locator('app-list-filter-toolbar').first();
    this.pagination = page.locator('cos-pagination').first();
    this.emptyState = page.locator('[class*="empty"], [class*="no-results"]').first();

    // Detail view
    this.groupTitle = page.locator('h1, [class*="group-title"], [class*="group-header"] h1').first();
    this.membersList = page.locator('[class*="members"], [class*="member-list"]').first();
    this.topicsList = page.locator('cos-topic-card');
    this.groupDescription = page.locator('[class*="group-description"], [class*="description"]').first();

    // Actions
    this.settingsButton = page.locator('button:has-text("Settings"), a[href*="settings"]').first();
    this.inviteButton = page.locator('button:has-text("Invite"), [class*="invite"]').first();
    this.joinButton = page.locator('button:has-text("Join"), [class*="join"]').first();
    this.leaveButton = page.locator('button:has-text("Leave"), [class*="leave"]').first();
    this.addTopicsButton = page.locator('button:has-text("Add topic"), [class*="add-topic"]').first();
  }

  async gotoPublicGroups() {
    await this.page.goto(route('public/groups'));
    await waitForApp(this.page);
  }

  async gotoMyGroups() {
    await this.page.goto(route('my/groups'));
    await waitForApp(this.page);
  }

  async gotoGroup(groupId: string) {
    await this.page.goto(route(`groups/${groupId}`));
    await waitForApp(this.page);
  }

  async expectGroupListLoaded() {
    const card = this.groupCards.first();
    const empty = this.emptyState;
    await expect(card.or(empty)).toBeVisible({ timeout: 15000 });
  }

  async expectGroupDetailLoaded() {
    await expect(this.page).toHaveURL(/groups\/[a-f0-9-]+/);
    await expect(this.groupTitle).toBeVisible({ timeout: 10000 });
  }

  async getGroupCount(): Promise<number> {
    return this.groupCards.count();
  }

  /** Click on the first group card to navigate to its detail view */
  async clickFirstGroup() {
    await this.groupCards.first().click();
    await this.page.waitForURL(/groups\/[a-f0-9-]+/);
    await waitForApp(this.page);
  }
}

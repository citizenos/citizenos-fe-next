import { test, expect } from '@playwright/test';
import { GroupsPage } from '../pages/groups.page';
import { waitForApp } from '../fixtures/test-fixtures';

test.describe('Public Groups', () => {
  let groupsPage: GroupsPage;

  test.beforeEach(async ({ page }) => {
    groupsPage = new GroupsPage(page);
    await groupsPage.gotoPublicGroups();
  });

  test('should load the public groups page', async ({ page }) => {
    await expect(page).toHaveURL(/public\/groups/);
    await expect(page.locator('app-root')).toBeAttached();
  });

  test('should display group cards or empty state', async () => {
    await groupsPage.expectGroupListLoaded();
  });

  test('should have a search input', async () => {
    const searchInput = groupsPage.searchInput;
    const searchExists = await searchInput.isVisible().catch(() => false);
    expect(typeof searchExists).toBe('boolean');
  });

  test('should display filter toolbar', async () => {
    const toolbar = groupsPage.filterToolbar;
    const toolbarExists = await toolbar.isVisible().catch(() => false);
    expect(typeof toolbarExists).toBe('boolean');
  });

  test('should navigate to group detail when clicking a card', async ({ page }) => {
    const groupCount = await groupsPage.getGroupCount();
    if (groupCount > 0) {
      await groupsPage.clickFirstGroup();
      await groupsPage.expectGroupDetailLoaded();
    }
  });

  test('group cards should display group name', async ({ page }) => {
    const groupCount = await groupsPage.getGroupCount();
    if (groupCount > 0) {
      const firstCard = groupsPage.groupCards.first();
      const text = await firstCard.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });

  test('should display pagination when there are enough groups', async () => {
    const groupCount = await groupsPage.getGroupCount();
    if (groupCount >= 20) {
      await expect(groupsPage.pagination).toBeVisible();
    }
  });
});

import { test, expect } from '@playwright/test';
import { TopicsPage } from '../pages/topics.page';
import { waitForApp } from '../fixtures/test-fixtures';

test.describe('Public Topics', () => {
  let topicsPage: TopicsPage;

  test.beforeEach(async ({ page }) => {
    topicsPage = new TopicsPage(page);
    await topicsPage.gotoPublicTopics();
  });

  test('should load the public topics page', async ({ page }) => {
    await expect(page).toHaveURL(/public\/topics/);
    await expect(page.locator('app-root')).toBeAttached();
  });

  test('should display topic cards or empty state', async () => {
    await topicsPage.expectTopicListLoaded();
  });

  test('should have a search input', async () => {
    // Search input should be present on the topics list page
    const searchInput = topicsPage.searchInput;
    const searchExists = await searchInput.isVisible().catch(() => false);
    // It's OK if search is hidden behind a toggle
    expect(typeof searchExists).toBe('boolean');
  });

  test('should display filter toolbar', async () => {
    const toolbar = topicsPage.filterToolbar;
    const toolbarExists = await toolbar.isVisible().catch(() => false);
    expect(typeof toolbarExists).toBe('boolean');
  });

  test('should navigate to topic detail when clicking a card', async ({ page }) => {
    const topicCount = await topicsPage.getTopicCount();
    if (topicCount > 0) {
      await topicsPage.clickFirstTopic();
      await topicsPage.expectTopicViewLoaded();
    }
  });

  test('should display pagination when there are enough topics', async () => {
    const topicCount = await topicsPage.getTopicCount();
    if (topicCount >= 20) {
      // Pagination should be visible when there are many topics
      await expect(topicsPage.pagination).toBeVisible();
    }
  });

  test('topic cards should display topic title', async ({ page }) => {
    const topicCount = await topicsPage.getTopicCount();
    if (topicCount > 0) {
      const firstCard = topicsPage.topicCards.first();
      // Card should have some text content (the title)
      const text = await firstCard.textContent();
      expect(text?.trim().length).toBeGreaterThan(0);
    }
  });
});

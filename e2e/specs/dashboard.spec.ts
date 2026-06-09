import { test, expect } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Dashboard', () => {
  let dashboard: DashboardPage;

  test.beforeEach(async ({ page }) => {
    dashboard = new DashboardPage(page);
    await dashboard.goto();
  });

  test('should load the dashboard for authenticated user', async () => {
    await dashboard.expectPageLoaded();
  });

  test('should display topic cards or empty state', async () => {
    await dashboard.expectTopicCardsVisible();
  });

  test('should have a create menu', async ({ page }) => {
    const createMenu = page.locator('cos-create-menu').first();
    const createButton = page.locator('button.desktop_create, button:has-text("Create")').first();
    const hasCreate = await createMenu.isVisible().catch(() => false) ||
      await createButton.isVisible().catch(() => false);
    expect(hasCreate).toBeTruthy();
  });

  test('should navigate to my topics', async ({ page }) => {
    const myTopicsLink = page.locator('a[href*="my/topics"]').first();
    if (await myTopicsLink.isVisible()) {
      await myTopicsLink.click();
      await page.waitForURL(/my\/topics/);
      await expect(page).toHaveURL(/my\/topics/);
    }
  });

  test('should navigate to my groups', async ({ page }) => {
    const myGroupsLink = page.locator('a[href*="my/groups"]').first();
    if (await myGroupsLink.isVisible()) {
      await myGroupsLink.click();
      await page.waitForURL(/my\/groups/);
      await expect(page).toHaveURL(/my\/groups/);
    }
  });

  test('should display group cards if groups section exists', async ({ page }) => {
    const hasGroups = await page.locator('app-dashboard-list-section').filter({ hasText: 'Groups' }).isVisible().catch(() => false);
    if (hasGroups) {
      await expect(page.locator('cos-group-card').first()).toBeVisible({ timeout: 10000 });
    }
  });

  test('should be able to click on a topic card to view it', async ({ page }) => {
    const topicCard = dashboard.topicCards.first();
    if (await topicCard.isVisible({ timeout: 5000 }).catch(() => false)) {
      await topicCard.click();
      await page.waitForURL(/topics\/[a-f0-9-]+/);
      await waitForApp(page);
      await expect(page).toHaveURL(/topics\/[a-f0-9-]+/);
    }
  });
});

import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Topic Settings & Attachments Flow', () => {
  const topicId = 'topic-settings-e2e-test-1';

  const mockTopicData = {
    id: topicId,
    title: 'Topic Settings & Configuration Test',
    description: 'A test topic for verifying topic settings dialog and controls.',
    visibility: 'public',
    status: 'inProgress',
    permission: { level: 'admin' },
    canEdit: true,
    canDelete: true,
    creator: { id: 'user-admin', name: 'Admin User' },
    categories: ['environment', 'governance'],
    attachments: [
      { id: 'att-1', name: 'Proposal_Document.pdf', type: 'application/pdf', size: 1048576 },
    ],
  };

  test.beforeEach(async ({ page }) => {
    // Intercept topic API calls
    await page.route(`**/api/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockTopicData }),
      });
    });

    await page.route(`**/api/users/self/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockTopicData }),
      });
    });

    await page.route(`**/api/topics/${topicId}/attachments`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: mockTopicData.attachments, count: 1 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/votes`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/ideations`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/arguments`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/members/users`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/members/groups`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.goto(route(`topics/${topicId}`));
    await waitForApp(page);
  });

  test('should open topic settings dialog from header options menu', async ({ page }) => {
    // Open topic actions dropdown in header
    const actionsTrigger = page.locator('.topic_header .options_dropdown_trigger, .topic_header .btn_header_actions, .topic_header button:has(cos-icon[name="more-vertical"])').first();
    await expect(actionsTrigger).toBeVisible();
    await actionsTrigger.click();

    // Click Settings option
    const settingsOption = page.locator('button.option').filter({ hasText: /Settings/i });
    await expect(settingsOption).toBeVisible();
    await settingsOption.click();

    // Verify settings dialog opened
    const dialog = page.locator('cos-topic-settings, div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check title in dialog
    await expect(dialog.locator('.title_description')).toContainText('Topic Settings & Configuration Test');
  });

  test('should display settings tabs and visibility toggle in settings modal', async ({ page }) => {
    // Trigger settings dialog
    const actionsTrigger = page.locator('.topic_header .options_dropdown_trigger, .topic_header .btn_header_actions, .topic_header button:has(cos-icon[name="more-vertical"])').first();
    await actionsTrigger.click();
    await page.locator('button.option').filter({ hasText: /Settings/i }).click();

    const dialog = page.locator('cos-topic-settings, div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Check Settings and Categories tabs
    const tabSettings = dialog.locator('button.tab_button').filter({ hasText: /Settings/i });
    const tabCategories = dialog.locator('button.tab_button').filter({ hasText: /Categories|Hashtags/i });

    await expect(tabSettings).toBeVisible();
    await expect(tabCategories).toBeVisible();

    // Verify visibility toggle exists in Settings tab
    const visibilityToggle = dialog.locator('.settings_section cos-toggle').first();
    await expect(visibilityToggle).toBeVisible();

    // Switch to Categories tab
    await tabCategories.click();
    await expect(tabCategories).toHaveClass(/active/);

    // Close dialog
    const closeBtn = dialog.locator('button.lightbox_close');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    await expect(dialog).toBeHidden();
  });

  test('should display attachments in topic sidebar', async ({ page }) => {
    const sidebar = page.locator('app-topic-info-sidebar');
    await expect(sidebar).toBeVisible();

    // Verify attachment list item or attachment name is displayed
    const attachmentItem = sidebar.locator('.info_item').filter({ hasText: 'Proposal_Document.pdf' });
    await expect(attachmentItem).toBeVisible();
  });
});

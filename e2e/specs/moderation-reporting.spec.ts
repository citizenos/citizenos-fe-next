import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Moderation & Reporting Lifecycle', () => {
  const topicId = 'report-topic-e2e-1';

  const mockPublicTopic = {
    id: topicId,
    title: 'Public Civic Topic for Reporting Tests',
    description: 'This is a public topic to verify moderation and abuse reporting flows.',
    visibility: 'public',
    status: 'inProgress',
    permission: { level: 'read' },
    canEdit: false,
    canDelete: false,
    report: null,
    creator: { id: 'other-user', name: 'Other User' },
    categories: ['environment'],
  };

  const mockArgument = {
    id: 'arg-report-1',
    topicId,
    type: 'pro',
    subject: 'Argument Subject Under Test',
    text: 'Argument body text content to test argument abuse reporting.',
    creator: { id: 'user-arg', name: 'Argument Author' },
    edits: {},
    votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false } },
  };

  test.beforeEach(async ({ page }) => {
    // Intercept topic API
    await page.route(`**/api/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockPublicTopic }),
      });
    });

    await page.route(`**/api/users/self/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockPublicTopic }),
      });
    });

    await page.route(`**/api/topics/${topicId}/arguments*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 20000, message: 'Success' },
          data: {
            rows: [mockArgument],
            count: 1,
          },
        }),
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

    await page.route(`**/api/topics/${topicId}/attachments`, async (routeHandler) => {
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

  test('should open topic reporting dialog from header options menu', async ({ page }) => {
    // Open topic actions dropdown in header
    const actionsTrigger = page.locator('.topic_header .options_dropdown_trigger, .topic_header .btn_header_actions, .topic_header button:has(cos-icon[name="more-vertical"])').first();
    await expect(actionsTrigger).toBeVisible();
    await actionsTrigger.click();

    // Click Report topic option
    const reportOption = page.locator('button.option').filter({ hasText: /Report/i });
    await expect(reportOption).toBeVisible();
    await reportOption.click();

    // Verify topic report dialog opened
    const dialog = page.locator('app-topic-report-form, div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify reason dropdown and text input
    await expect(dialog.locator('cos-dropdown#report_type, #report_type')).toBeVisible();
    await expect(dialog.locator('textarea#report_text')).toBeVisible();

    // Cancel and close dialog
    const cancelBtn = dialog.locator('cos-button').filter({ hasText: /No|Cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await expect(dialog).toBeHidden();
    }
  });

  test('should open argument reporting dialog from argument card options', async ({ page }) => {
    // Wait for the argument card to be visible
    const argumentCard = page.locator('cos-argument').first();
    await expect(argumentCard).toBeVisible();

    // Open argument actions dropdown
    const argActionsBtn = argumentCard.locator('.btn_argument_actions, button.btn_options, button:has(cos-icon[name="more-vertical"])').first();
    await expect(argActionsBtn).toBeVisible();
    await argActionsBtn.click();

    // Click Report option
    const reportOption = page.locator('.options button.option, button.option').filter({ hasText: /Report/i }).first();
    await expect(reportOption).toBeVisible();
    await reportOption.click();

    // Verify argument report dialog opened
    const dialog = page.locator('app-argument-report, div.dialog_wrap');
    await expect(dialog).toBeVisible();

    // Verify report reason element
    await expect(dialog.locator('#report_reason, cos-dropdown')).toBeVisible();

    // Dismiss dialog via close button
    const closeBtn = dialog.locator('.btn_dialog_close');
    await closeBtn.click();
    await expect(dialog).toBeHidden();
  });
});

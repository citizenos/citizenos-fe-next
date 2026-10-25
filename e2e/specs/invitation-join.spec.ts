import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Invitation & Join Flows', () => {
  test('should display topic invitation dialog on valid join token', async ({ page }) => {
    const mockToken = 'valid-test-topic-token-123';
    const mockTopic = {
      status: { code: 20000, message: 'Success' },
      data: {
        id: 'mock-topic-id-123',
        title: 'Community Sustainability Proposal',
        description: 'Discussion and ideation for sustainable community practices.',
        visibility: 'public',
        creator: {
          id: 'user-1',
          name: 'Jane Doe',
          imageUrl: null,
        },
        permission: {
          level: null,
        },
      },
    };

    // Intercept topic join token API
    await page.route(`**/api/topics/join/${mockToken}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockTopic),
      });
    });

    await page.goto(route(`topics/join/${mockToken}`));
    await waitForApp(page);

    // Expect invitation dialog to be presented
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();

    // Verify title and creator
    await expect(dialog.locator('.topic_title')).toContainText('Community Sustainability Proposal');
    await expect(dialog.locator('.dialog_content_join')).toContainText('Jane Doe');

    // Verify join button exists
    const joinBtn = dialog.locator('button.btn_medium_submit');
    await expect(joinBtn).toBeVisible();

    // Verify close/cancel button dismisses dialog
    const cancelBtn = dialog.locator('button.btn_link').filter({ hasText: /Cancel/i });
    if (await cancelBtn.isVisible()) {
      await cancelBtn.click();
      await expect(dialog).toBeHidden();
    }
  });

  test('should display group invitation dialog on valid group token', async ({ page }) => {
    const mockToken = 'valid-test-group-token-456';
    const mockGroup = {
      status: { code: 20000, message: 'Success' },
      data: {
        id: 'mock-group-id-456',
        name: 'Open Governance Working Group',
        description: 'A working group for municipal transparency and open civic data.',
        visibility: 'public',
        creator: {
          id: 'user-2',
          name: 'John Citizen',
          imageUrl: null,
        },
        userLevel: null,
      },
    };

    // Intercept group join token API
    await page.route(`**/api/groups/join/${mockToken}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockGroup),
      });
    });

    await page.goto(route(`groups/join/${mockToken}`));
    await waitForApp(page);

    // Expect invitation dialog
    const dialog = page.locator('div[role="dialog"]');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.topic_title')).toContainText('Open Governance Working Group');

    const joinBtn = dialog.locator('button.btn_medium_submit');
    await expect(joinBtn).toBeVisible();
  });

  test('should gracefully handle invalid topic token with 404 navigation', async ({ page }) => {
    const invalidToken = 'non-existent-token-xyz';

    await page.route(`**/api/topics/join/${invalidToken}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 40400, message: 'Not Found' },
        }),
      });
    });

    await page.goto(route(`topics/join/${invalidToken}`));
    await waitForApp(page);

    // App should not crash and should redirect to 404 or dashboard
    await expect(page).toHaveURL(/404|dashboard/);
  });
});

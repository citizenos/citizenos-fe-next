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
    members: { users: { count: 1, rows: [] }, groups: { count: 0, rows: [] } },
    attachments: [],
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

  test('should open idea reporting dialog from ideabox card options and submit report to moderators', async ({ page }) => {
    const ideationTopicId = 'report-ideation-topic-e2e-1';
    const ideationId = 'ideation-report-e2e-1';
    const ideaId = 'idea-report-e2e-1';

    const mockIdeationTopic = {
      ...mockPublicTopic,
      id: ideationTopicId,
      status: 'ideation',
      ideationId,
    };

    const mockIdeation = {
      id: ideationId,
      topicId: ideationTopicId,
      question: 'How can we improve public spaces?',
      allowAnonymous: false,
      deadline: null,
    };

    const mockIdea = {
      id: ideaId,
      topicId: ideationTopicId,
      ideationId,
      statement: 'Idea Under Report Test',
      description: 'Description of idea to report to moderators.',
      status: 'published',
      author: { id: 'author-1', name: 'Idea Author Name' },
      votes: { up: { count: 1, selected: false }, down: { count: 0, selected: false }, count: 1 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await page.route('**/api/auth/status*', async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 20000, message: 'Success' },
          data: { id: 'reporter-user-1', name: 'Reporter Citizen', email: 'reporter@citizenos.com' },
        }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeationTopic }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}/ideations/${ideationId}(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeation }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}/ideations/${ideationId}/ideas(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [mockIdea], count: 1 } }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}/ideations/${ideationId}/folders(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}/ideations/${ideationId}/participants(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${ideationTopicId}/(votes|arguments|attachments|events|members/(users|groups))(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/users/self/topics/${ideationTopicId}/ideations/${ideationId}/ideas/${ideaId}/reports`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20100, message: 'Created' }, data: { id: 'report-1' } }),
      });
    });

    await page.goto(route(`topics/${ideationTopicId}#ideation`));
    await waitForApp(page);

    // Locate ideabox card and open 3-dot dropdown
    const ideaCard = page.locator('app-ideabox').filter({ hasText: 'Idea Under Report Test' });
    await expect(ideaCard).toBeVisible();

    const ideaActionsBtn = ideaCard.locator('.idea_header_right .dropdown button[trigger]').first();
    await expect(ideaActionsBtn).toBeVisible();
    await ideaActionsBtn.click();

    // Click Report idea option
    const reportOption = ideaCard.locator('button.option').filter({ hasText: /Report/i }).first();
    await expect(reportOption).toBeVisible();
    await reportOption.click();

    // Verify IdeaReportComponent dialog opens with author name and form controls
    const dialog = page.locator('app-idea-report');
    await expect(dialog).toBeVisible();
    await expect(dialog.locator('.dialog_info .bold')).toContainText('Idea Author Name');
    await expect(dialog.locator('#report_reason')).toBeVisible();

    // Open reason dropdown and select another option (spam)
    await dialog.locator('cos-dropdown .dropdown-selection').click();
    const spamOption = dialog.locator('#report_reason_options .option').nth(2);
    await expect(spamOption).toBeVisible();
    await spamOption.click();

    // Fill report text and submit
    const reportTextarea = dialog.locator('textarea#report_text');
    await expect(reportTextarea).toBeVisible();
    await reportTextarea.fill('Reporting inappropriate idea content to moderators.');

    const postReportPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${ideationTopicId}/ideations/${ideationId}/ideas/${ideaId}/reports`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    const submitBtn = dialog.locator('button.btn_big_submit');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    const postReq = await postReportPromise;
    expect(postReq.postDataJSON()).toEqual({
      type: 'spam',
      text: 'Reporting inappropriate idea content to moderators.',
    });

    await expect(dialog).toBeHidden();

    // Now test the moderator email link (/topics/:topicId/ideation/:ideationId/ideas/:ideaId/reports/:reportId/moderate?token=...)
    const reportId = 'report-1';
    const modToken = 'mod-token-123';

    await page.route(`**/api/topics/${ideationTopicId}/ideations/${ideationId}/ideas/${ideaId}/reports/${reportId}*`, async (routeHandler) => {
      if (routeHandler.request().method() === 'GET') {
        await routeHandler.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: { code: 20000, message: 'Success' },
            data: {
              id: reportId,
              type: 'spam',
              text: 'Reporting inappropriate idea content to moderators.',
              idea: {
                id: ideaId,
                statement: 'Idea Under Report Test',
                description: 'Description of idea to report to moderators.',
              },
            },
          }),
        });
      } else {
        await routeHandler.continue();
      }
    });

    await page.route(`**/api/topics/${ideationTopicId}/ideations/${ideationId}/ideas/${ideaId}/reports/${reportId}/moderate`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: {} }),
      });
    });

    await page.goto(`/topics/${ideationTopicId}/ideation/${ideationId}/ideas/${ideaId}/reports/${reportId}/moderate?token=${modToken}`);
    await waitForApp(page);

    const modDialog = page.locator('app-idea-report-moderate');
    await expect(modDialog).toBeVisible();
    await expect(modDialog.locator('.delete_info_text.italic').first()).toContainText('Idea Under Report Test');

    // Open reason dropdown in IdeaReportModerateComponent and select first option (abuse)
    await modDialog.locator('cos-dropdown .dropdown-selection').click();
    const abuseOption = modDialog.locator('#report_reason_options .option').first();
    await expect(abuseOption).toBeVisible();
    await abuseOption.click();

    const postModeratePromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${ideationTopicId}/ideations/${ideationId}/ideas/${ideaId}/reports/${reportId}/moderate`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    const modSubmitBtn = modDialog.locator('button.btn_big_submit');
    await expect(modSubmitBtn).toBeEnabled();
    await modSubmitBtn.click();

    const modPostReq = await postModeratePromise;
    expect(modPostReq.postDataJSON()).toEqual({
      type: 'abuse',
      text: 'Reporting inappropriate idea content to moderators.',
    });
  });
});

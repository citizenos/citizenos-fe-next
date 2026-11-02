import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

const topicId = 'topic-discussion-e2e-test-1';
const discussionId = 'discussion-e2e-test-1';

interface DiscussionMockOptions {
  topicStatus?: 'draft' | 'inProgress';
  hasDiscussion?: boolean;
  question?: string;
  deadline?: string | null;
  postShouldFail?: boolean;
}

function createMockTopic(options: DiscussionMockOptions = {}) {
  const status = options.topicStatus || 'inProgress';
  const hasDiscussion = options.hasDiscussion ?? false;

  return {
    id: topicId,
    title: 'Community Discussion Test Topic',
    description: 'A test topic for validating the start discussion flow and empty state transition.',
    visibility: 'public',
    status,
    country: 'EE',
    discussionId: hasDiscussion ? discussionId : null,
    permission: { level: 'admin' },
    canEdit: true,
    canDelete: true,
    canUpdate: true,
    creator: { id: 'user-admin', name: 'Admin Coordinator' },
    categories: ['governance', 'community'],
    members: { users: { count: 1, rows: [] }, groups: { count: 0, rows: [] } },
    attachments: [],
  };
}

function createMockDiscussion(options: DiscussionMockOptions = {}) {
  return {
    id: discussionId,
    topicId,
    question: options.question || 'What civic initiatives should we prioritize for the next year?',
    deadline: options.deadline !== undefined ? options.deadline : '2027-12-31T23:59:59.000Z',
    createdAt: '2026-11-01T10:00:00.000Z',
    updatedAt: '2026-11-02T10:00:00.000Z',
  };
}

async function setupTopicDiscussionRoutes(page: Page, initialOptions: DiscussionMockOptions = {}) {
  let currentTopic = createMockTopic(initialOptions);
  let currentDiscussion = initialOptions.hasDiscussion ? createMockDiscussion(initialOptions) : null;
  let postShouldFail = initialOptions.postShouldFail ?? false;

  await page.addInitScript(() => {
    localStorage.setItem('show-topic-tour', 'true');
  });

  // Intercept auth status for logged in admin user
  await page.route('**/api/auth/status*', async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        status: { code: 20000, message: 'Success' },
        data: { id: 'user-admin', name: 'Admin Coordinator', email: 'admin@citizenos.com' },
      }),
    });
  });

  // Intercept topic endpoints (GET and PATCH)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}(\\?.*)?$`), async (routeHandler) => {
    const method = routeHandler.request().method();

    if (method === 'PATCH') {
      const patchData = routeHandler.request().postDataJSON() || {};
      currentTopic = { ...currentTopic, ...patchData };
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentTopic }),
      });
    } else {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentTopic }),
      });
    }
  });

  // Intercept discussion collection endpoints (POST)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/discussions(\\?.*)?$`), async (routeHandler) => {
    if (routeHandler.request().method() === 'POST') {
      if (postShouldFail) {
        await routeHandler.fulfill({
          status: 500,
          contentType: 'application/json',
          body: JSON.stringify({ status: { code: 50000, message: 'Internal Server Error' } }),
        });
        return;
      }

      const postData = routeHandler.request().postDataJSON() || {};
      currentDiscussion = {
        id: discussionId,
        topicId,
        question: postData.question || '',
        deadline: postData.deadline || null,
        createdAt: '2026-11-01T10:00:00.000Z',
        updatedAt: '2026-11-02T10:00:00.000Z',
      };
      currentTopic = {
        ...currentTopic,
        discussionId,
      };

      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentDiscussion }),
      });
    } else {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: currentDiscussion ? [currentDiscussion] : [], count: currentDiscussion ? 1 : 0 } }),
      });
    }
  });

  // Intercept single discussion endpoint (GET)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/discussions/${discussionId}(\\?.*)?$`), async (routeHandler) => {
    if (currentDiscussion) {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentDiscussion }),
      });
    } else {
      await routeHandler.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 40401, message: 'Discussion not found' } }),
      });
    }
  });

  // Intercept auxiliary endpoints
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/arguments(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/votes(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/attachments(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/events(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/members/users(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/members/groups(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  return {
    setPostShouldFail: (fail: boolean) => {
      postShouldFail = fail;
    },
    getCurrentTopic: () => currentTopic,
    getCurrentDiscussion: () => currentDiscussion,
  };
}

test.describe('Topic Discussion Flow & Start Discussion Dialog', () => {
  test('topic in draft status with no discussion shows empty state, opens dialog, fills question + deadline, and transitions to discussion view on submit', async ({ page }) => {
    await setupTopicDiscussionRoutes(page, {
      topicStatus: 'draft',
      hasDiscussion: false,
    });

    await page.goto(route(`topics/${topicId}#discussion`));
    await waitForApp(page);

    // 1. Verify empty state ("no discussion yet" heading and start discussion button)
    const emptyStateHeading = page.locator('cos-no-feature-yet .description_heading').first();
    await expect(emptyStateHeading).toBeVisible({ timeout: 10000 });
    await expect(emptyStateHeading).toContainText(/There is no discussion yet/i);

    const startDiscussionBtn = page.locator('cos-no-feature-yet button.btn_medium_submit');
    await expect(startDiscussionBtn).toBeVisible();
    await expect(startDiscussionBtn).toContainText(/Start discussion phase/i);

    // 2. Open Start discussion dialog
    await startDiscussionBtn.click();

    const dialog = page.locator('cos-topic-discussion-create-dialog');
    await expect(dialog).toBeVisible();

    // 3. Tab 1: Introduction - Click Continue to proceed to Tab 2
    const continueBtn = dialog.locator('.dialog_footer button.btn_medium_submit');
    await expect(continueBtn).toBeVisible();
    await expect(continueBtn).toContainText(/Continue/i);
    await continueBtn.click();

    // 4. Tab 2: Fill question and set deadline
    const questionInput = dialog.locator('#discussion_question');
    await expect(questionInput).toBeVisible();
    const testQuestion = 'How should municipal funding be allocated for 2027?';
    await questionInput.fill(testQuestion);

    // Set deadline via deadline-picker checkbox toggle
    const deadlineCheckbox = dialog.locator('cos-deadline-picker input[type="checkbox"]').first();
    await expect(deadlineCheckbox).toBeVisible();
    await deadlineCheckbox.check({ force: true });

    // 5. Submit discussion create dialog
    const submitBtn = dialog.locator('.dialog_footer button.btn_medium_submit');
    await expect(submitBtn).toBeEnabled();
    await expect(submitBtn).toContainText(/Start discussion phase/i);

    // Click submit and wait for dialog to close
    await submitBtn.click();

    // 6. Verify dialog closes
    await expect(dialog).not.toBeVisible({ timeout: 10000 });

    // 7. Verify empty state disappears
    await expect(page.locator('cos-no-feature-yet')).not.toBeVisible();

    // 8. Verify discussion wrap and question are shown
    const argumentsWrap = page.locator('.arguments_wrap');
    await expect(argumentsWrap).toBeVisible({ timeout: 10000 });
    const questionDisplay = argumentsWrap.locator('.arguments_header .question');
    await expect(questionDisplay).toBeVisible();
    await expect(questionDisplay).toContainText(testQuestion);
  });

  test('topic in inProgress status with no discussion opens dialog and submits successfully', async ({ page }) => {
    await setupTopicDiscussionRoutes(page, {
      topicStatus: 'inProgress',
      hasDiscussion: false,
    });

    await page.goto(route(`topics/${topicId}#discussion`));
    await waitForApp(page);

    // Verify empty state is displayed
    const emptyStateHeading = page.locator('cos-no-feature-yet .description_heading').first();
    await expect(emptyStateHeading).toBeVisible({ timeout: 10000 });

    // Open Start discussion dialog
    await page.locator('cos-no-feature-yet button.btn_medium_submit').click();

    const dialog = page.locator('cos-topic-discussion-create-dialog');
    await expect(dialog).toBeVisible();

    // Tab 1 -> Tab 2
    await dialog.locator('.dialog_footer button.btn_medium_submit').click();

    // Fill question
    const testQuestion = 'What strategies should we implement for solar adoption?';
    await dialog.locator('#discussion_question').fill(testQuestion);

    // Submit
    const submitBtn = dialog.locator('.dialog_footer button.btn_medium_submit');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Dialog closes, empty state disappears, question displayed
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('cos-no-feature-yet')).not.toBeVisible();
    const argumentsWrap = page.locator('.arguments_wrap');
    await expect(argumentsWrap).toBeVisible({ timeout: 10000 });
    await expect(argumentsWrap.locator('.arguments_header .question')).toContainText(testQuestion);
  });

  test('error case: when POST discussion fails, dialog stays open and preserves input', async ({ page }) => {
    const routeController = await setupTopicDiscussionRoutes(page, {
      topicStatus: 'inProgress',
      hasDiscussion: false,
      postShouldFail: true,
    });

    await page.goto(route(`topics/${topicId}#discussion`));
    await waitForApp(page);

    // Open Start discussion dialog
    await page.locator('cos-no-feature-yet button.btn_medium_submit').click();
    const dialog = page.locator('cos-topic-discussion-create-dialog');
    await expect(dialog).toBeVisible();

    // Tab 1 -> Tab 2
    await dialog.locator('.dialog_footer button.btn_medium_submit').click();

    // Fill question
    const testQuestion = 'Question that fails on save';
    const questionInput = dialog.locator('#discussion_question');
    await questionInput.fill(testQuestion);

    // Submit discussion while POST is configured to fail
    const submitBtn = dialog.locator('.dialog_footer button.btn_medium_submit');
    await expect(submitBtn).toBeEnabled();
    await submitBtn.click();

    // Wait a moment for network call and verify dialog stays open
    await page.waitForTimeout(500);
    await expect(dialog).toBeVisible();

    // Question input still holds value and submit button is re-enabled
    await expect(questionInput).toHaveValue(testQuestion);
    await expect(submitBtn).toBeEnabled();

    // If server becomes available and user retries, it succeeds
    routeController.setPostShouldFail(false);
    await submitBtn.click();

    // Dialog closes and question is shown
    await expect(dialog).not.toBeVisible({ timeout: 10000 });
    await expect(page.locator('.arguments_wrap')).toBeVisible();
    await expect(page.locator('.arguments_header .question')).toContainText(testQuestion);
  });
});

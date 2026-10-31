import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Topic Ideation & Add Idea Flow', () => {
  const topicId = 'topic-ideation-e2e-test-1';
  const ideationId = 'ideation-e2e-test-1';

  const mockIdeationTopic = {
    id: topicId,
    title: 'Community Green Energy Initiative',
    description: 'Propose and discuss ideas for sustainable civic projects in our community.',
    visibility: 'public',
    status: 'ideation',
    ideationId,
    permission: { level: 'admin' },
    canEdit: true,
    canDelete: true,
    canUpdate: true,
    creator: { id: 'user-admin', name: 'Admin Coordinator' },
    categories: ['environment', 'governance'],
    members: { users: { count: 1, rows: [] }, groups: { count: 0, rows: [] } },
    attachments: [],
  };

  const mockIdeation = {
    id: ideationId,
    topicId,
    question: 'What sustainable energy ideas should our municipality implement?',
    template: 'Please describe the impact, budget estimate, and execution steps.',
    allowAnonymous: false,
    deadline: null,
  };

  let ideasList: Array<{
    id: string;
    topicId: string;
    ideationId: string;
    statement: string;
    description: string;
    status: string;
    author: { id: string; name: string };
    votes: { up: { count: number; selected: boolean }; down: { count: number; selected: boolean }; count: number };
    createdAt: string;
    updatedAt: string;
  }> = [];

  test.beforeEach(async ({ page }) => {
    ideasList = [
      {
        id: 'idea-init-1',
        topicId,
        ideationId,
        statement: 'Existing Solar Rooftop Project',
        description: 'Initial community idea for municipal solar power.',
        status: 'published',
        author: { id: 'user-admin', name: 'Admin Coordinator' },
        votes: { up: { count: 4, selected: false }, down: { count: 1, selected: false }, count: 3 },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      },
    ];

    await page.addInitScript(() => {
      localStorage.setItem('show-topic-tour', 'true');
    });

    // Intercept auth status for logged in session
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

    // Intercept topic endpoints
    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeationTopic }),
      });
    });

    // Intercept ideation endpoints
    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeation }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [mockIdeation], count: 1 } }),
      });
    });

    // Intercept ideas collection endpoints (GET and POST)
    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/ideas(\\?.*)?$`), async (routeHandler) => {
      if (routeHandler.request().method() === 'POST') {
        const postData = routeHandler.request().postDataJSON() || {};
        const newIdea = {
          id: `idea-${Date.now()}`,
          topicId,
          ideationId,
          statement: postData.statement || '',
          description: postData.description || '',
          status: postData.status || 'published',
          author: { id: 'user-admin', name: 'Admin Coordinator' },
          votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 },
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        ideasList.unshift(newIdea);
        await routeHandler.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: newIdea }),
        });
      } else {
        await routeHandler.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            status: { code: 20000, message: 'Success' },
            data: { rows: ideasList, count: ideasList.length },
          }),
        });
      }
    });

    // Stub other auxiliary topic calls
    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/votes(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/arguments(\\?.*)?$`), async (routeHandler) => {
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

    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/events(\\?.*)?$`), async (routeHandler) => {
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

    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/participants(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/folders(\\?.*)?$`), async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.goto(route(`topics/${topicId}#ideation`));
    await waitForApp(page);
  });

  test('should render ideation question and initial idea list', async ({ page }) => {
    // Verify question header is rendered
    const ideationHeader = page.locator('app-topic-ideation .ideation_header');
    await expect(ideationHeader).toBeVisible();
    await expect(ideationHeader).toContainText('What sustainable energy ideas should our municipality implement?');

    // Verify existing idea card is displayed
    const existingIdea = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Existing Solar Rooftop Project' });
    await expect(existingIdea).toBeVisible();
    await expect(existingIdea.locator('.statement')).toContainText('Existing Solar Rooftop Project');
  });

  test('should open add idea form from header button, submit published idea, close form and display new idea in list', async ({ page }) => {
    // 1. Locate header "Add your idea" button and click it
    const headerAddBtn = page.locator('app-topic-ideation .header_actions cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await expect(headerAddBtn).toBeVisible();
    await headerAddBtn.click();

    // 2. Add idea form wrapper should open
    const addIdeaWrap = page.locator('#create_idea_footer');
    await expect(addIdeaWrap).toBeVisible();
    await expect(addIdeaWrap).toHaveClass(/open/);

    // 3. Fill in statement and description
    const statementInput = page.locator('#idea_statement');
    await expect(statementInput).toBeVisible();
    await statementInput.fill('Solar Panels on Public Library');

    const descTextarea = page.locator('#idea_description');
    await expect(descTextarea).toBeVisible();
    await descTextarea.fill('Equip the central municipal library with rooftop photovoltaic panels to power civic facilities.');

    // 4. Capture POST /ideas request
    const postRequestPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${topicId}/ideations/${ideationId}/ideas`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    // 5. Click the submit button inside the form
    const postIdeaBtn = page.locator('#buttons_row .buttons_right_group cos-button').filter({ hasText: /Post idea|Idea post/i });
    await expect(postIdeaBtn).toBeVisible();
    await postIdeaBtn.click();

    // 6. Assert that POST payload has status 'published' and entered content
    const postRequest = await postRequestPromise;
    const postPayload = postRequest.postDataJSON();
    expect(postPayload.status).toBe('published');
    expect(postPayload.statement).toBe('Solar Panels on Public Library');
    expect(postPayload.description).toBe('Equip the central municipal library with rooftop photovoltaic panels to power civic facilities.');

    // 7. Verify add idea form closes (#create_idea_footer is closed / not open)
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);

    // 8. Verify the new idea appears in the ideas list
    const newIdeaCard = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Solar Panels on Public Library' });
    await expect(newIdeaCard).toBeVisible();
    await expect(newIdeaCard.locator('.statement')).toContainText('Solar Panels on Public Library');
  });

  test('should open add idea form from bottom bar, submit published idea, close form and display new idea in list', async ({ page }) => {
    // 1. Locate bottom bar "Add your idea" button and click it
    const bottomAddBtn = page.locator('app-topic-ideation .bottom_actions cos-button, #create_idea_footer_menu cos-button').filter({ hasText: /Add your idea|Add idea/i }).first();
    await expect(bottomAddBtn).toBeVisible();
    await bottomAddBtn.click();

    // 2. Add idea form wrapper should open
    const addIdeaWrap = page.locator('#create_idea_footer');
    await expect(addIdeaWrap).toBeVisible();
    await expect(addIdeaWrap).toHaveClass(/open/);

    // 3. Fill in statement and description
    const statementInput = page.locator('#idea_statement');
    await statementInput.fill('Municipal Wind Turbine Installation');

    const descTextarea = page.locator('#idea_description');
    await descTextarea.fill('Install community-owned wind turbines along coastal ridges for clean municipal power.');

    // 4. Capture POST /ideas request
    const postRequestPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${topicId}/ideations/${ideationId}/ideas`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    // 5. Submit idea
    const postIdeaBtn = page.locator('#buttons_row .buttons_right_group cos-button').filter({ hasText: /Post idea|Idea post/i });
    await postIdeaBtn.click();

    // 6. Assert request sent with status published
    const postRequest = await postRequestPromise;
    const postPayload = postRequest.postDataJSON();
    expect(postPayload.status).toBe('published');
    expect(postPayload.statement).toBe('Municipal Wind Turbine Installation');

    // 7. Form closes
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);

    // 8. New idea appears in ideas list
    const newIdeaCard = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Municipal Wind Turbine Installation' });
    await expect(newIdeaCard).toBeVisible();
    await expect(newIdeaCard.locator('.statement')).toContainText('Municipal Wind Turbine Installation');
  });

  test('should close add idea form without saving when close button is clicked', async ({ page }) => {
    // Open from header
    const headerAddBtn = page.locator('app-topic-ideation .header_actions cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await headerAddBtn.click();

    const addIdeaWrap = page.locator('#create_idea_footer');
    await expect(addIdeaWrap).toHaveClass(/open/);

    // Click close button
    const closeBtn = page.locator('#buttons_row .btn_close_circle');
    await expect(closeBtn).toBeVisible();
    await closeBtn.click();

    // Verify form closes
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);

    // Footer menu should be visible again
    await expect(page.locator('#create_idea_footer_menu')).toHaveClass(/open/);
  });
});

import { test, expect } from '@playwright/test';
import type { Page } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

const topicId = 'topic-ideation-e2e-test-1';
const ideationId = 'ideation-e2e-test-1';

const defaultMockTopic = {
  id: topicId,
  title: 'Community Green Energy Initiative',
  description: 'Propose and discuss ideas for sustainable civic projects in our community.',
  visibility: 'public',
  status: 'ideation',
  country: 'EE',
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

const defaultMockIdeation = {
  id: ideationId,
  topicId,
  question: 'What sustainable energy ideas should our municipality implement?',
  template: 'Please describe the impact, budget estimate, and execution steps.',
  allowAnonymous: false,
  deadline: null as string | null,
  demographicsConfig: null as any,
};

const defaultInitialIdeas = [
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

interface SetupMocksOptions {
  topic?: Record<string, any>;
  ideation?: Record<string, any>;
  initialIdeas?: any[];
  initialFolders?: any[];
}

async function setupTopicIdeationRoutes(page: Page, options: SetupMocksOptions = {}) {
  const currentTopic = { ...defaultMockTopic, ...options.topic };
  const currentIdeation = { ...defaultMockIdeation, ...options.ideation };
  const ideasList = options.initialIdeas ? [...options.initialIdeas] : [...defaultInitialIdeas];
  const foldersList = options.initialFolders ? [...options.initialFolders] : [];

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
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentTopic }),
    });
  });

  // Intercept ideation endpoints
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: currentIdeation }),
    });
  });

  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [currentIdeation], count: 1 } }),
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
        demographics: postData.demographics,
        author: currentIdeation.allowAnonymous ? { id: 'anonymous', name: 'Anonymous' } : { id: 'user-admin', name: 'Admin Coordinator' },
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
      const url = new URL(routeHandler.request().url());
      const reqFolderId = url.searchParams.get('folderId');
      let resultIdeas = ideasList;
      if (reqFolderId) {
        resultIdeas = ideasList.filter(
          (idea) => idea.folderId === reqFolderId || idea.folderIds?.includes(reqFolderId)
        );
      }
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 20000, message: 'Success' },
          data: { rows: resultIdeas, count: resultIdeas.length },
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

  // Intercept folders endpoints (GET and POST)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/folders(\\?.*)?$`), async (routeHandler) => {
    if (routeHandler.request().method() === 'POST') {
      const postData = routeHandler.request().postDataJSON() || {};
      const newFolder = {
        id: `folder-${Date.now()}`,
        name: postData.name || '',
        description: postData.description || null,
        ideationId,
        topicId,
        ideas: { count: 0, rows: [] },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      foldersList.push(newFolder);
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: newFolder }),
      });
    } else {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: foldersList, count: foldersList.length } }),
      });
    }
  });

  // Intercept ideas in folder endpoint (GET and POST)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/folders/([^/?#]+)/ideas(\\?.*)?$`), async (routeHandler) => {
    const url = routeHandler.request().url();
    const match = url.match(new RegExp(`/folders/([^/?#]+)/ideas`));
    const targetFolderId = match ? match[1] : '';

    if (routeHandler.request().method() === 'POST') {
      const postData = routeHandler.request().postDataJSON() || [];
      const idsToAdd: string[] = Array.isArray(postData) ? postData.map((item: any) => item.id || item) : [postData.id || postData];
      ideasList.forEach((idea) => {
        if (idsToAdd.includes(idea.id)) {
          idea.folderId = targetFolderId;
          if (!idea.folderIds) idea.folderIds = [];
          if (!idea.folderIds.includes(targetFolderId)) idea.folderIds.push(targetFolderId);
        }
      });
      const targetFolder = foldersList.find((f) => f.id === targetFolderId);
      if (targetFolder) {
        const matchingIdeasCount = ideasList.filter(
          (i) => i.folderId === targetFolderId || i.folderIds?.includes(targetFolderId)
        ).length;
        targetFolder.ideas = { count: matchingIdeasCount, rows: [] };
      }
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: {} }),
      });
    } else {
      const folderIdeas = ideasList.filter(
        (idea) => idea.folderId === targetFolderId || idea.folderIds?.includes(targetFolderId)
      );
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          status: { code: 20000, message: 'Success' },
          data: { rows: folderIdeas, count: folderIdeas.length },
        }),
      });
    }
  });

  // Intercept single folder details endpoint (GET)
  await page.route(new RegExp(`/api/(users/self/)?topics/${topicId}/ideations/${ideationId}/folders/([^/?#]+)(\\?.*)?$`), async (routeHandler) => {
    const url = routeHandler.request().url();
    const match = url.match(new RegExp(`/folders/([^/?#]+)($|\\?)`));
    const targetFolderId = match ? match[1] : '';
    const folder = foldersList.find((f) => f.id === targetFolderId);
    if (folder) {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: folder }),
      });
    } else {
      await routeHandler.fulfill({
        status: 404,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 40401, message: 'Folder not found' } }),
      });
    }
  });

  await page.goto(route(`topics/${topicId}#ideation`));
  await waitForApp(page);
}

test.describe('Topic Ideation & Add Idea Flow', () => {
  test.beforeEach(async ({ page }) => {
    await setupTopicIdeationRoutes(page);
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

test.describe('Topic Ideation - Anonymous Demographics & Confirmation', () => {
  test.beforeEach(async ({ page }) => {
    await setupTopicIdeationRoutes(page, {
      topic: { country: 'EE' },
      ideation: {
        allowAnonymous: true,
        demographicsConfig: {
          age: { required: true },
          gender: { required: true },
          residence: { required: true },
        },
      },
    });
  });

  test('should render demographic fields with borders and placeholders, handle "other" custom input, confirm via AnonymousDialog, and close form', async ({ page }) => {
    // 1. Locate header "Add your idea" button and click it
    const headerAddBtn = page.locator('app-topic-ideation .header_actions cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await expect(headerAddBtn).toBeVisible();
    await headerAddBtn.click();

    // 2. Add idea form wrapper should open
    const addIdeaWrap = page.locator('#create_idea_footer');
    await expect(addIdeaWrap).toBeVisible();
    await expect(addIdeaWrap).toHaveClass(/open/);

    // 3. Verify demographic fields render inside .demographics_section
    const demographicsSection = page.locator('.demographics_section');
    await expect(demographicsSection).toBeVisible();

    // Age input: has placeholder and gray_borders class
    const ageInput = demographicsSection.locator('#demographics_age');
    await expect(ageInput).toBeVisible();
    await expect(ageInput).toHaveAttribute('placeholder', /Age/i);
    await expect(ageInput).toHaveClass(/gray_borders/);

    // Gender dropdown: has selection with border and placeholder
    const genderDropdown = demographicsSection.locator('.dropdown').filter({ hasText: /Gender/i });
    await expect(genderDropdown).toBeVisible();
    const genderSelection = genderDropdown.locator('.selection');
    await expect(genderSelection).toBeVisible();
    await expect(genderSelection).toHaveCSS('border-top-width', '1px');
    await expect(genderSelection).toContainText(/Gender/i);

    // Residence dropdown: has selection with border and placeholder
    const residenceDropdown = demographicsSection.locator('.dropdown').filter({ hasText: /Municipality/i });
    await expect(residenceDropdown).toBeVisible();
    const residenceSelection = residenceDropdown.locator('.selection');
    await expect(residenceSelection).toBeVisible();
    await expect(residenceSelection).toHaveCSS('border-top-width', '1px');
    await expect(residenceSelection).toContainText(/Municipality/i);

    // 4. Select "other" for gender and verify free-text input appears without pre-filled "other"
    await genderSelection.click();
    await expect(genderDropdown).toHaveClass(/dropdown_active/);
    await genderDropdown.locator('.option').filter({ hasText: /Other/i }).click();

    const genderCustomInput = page.locator('#demographics_gender');
    await expect(genderCustomInput).toBeVisible();
    await expect(genderCustomInput).toHaveValue('');
    await expect(genderCustomInput).toHaveAttribute('placeholder', /Your gender/i);
    await expect(genderCustomInput).toHaveClass(/gray_borders/);
    await genderCustomInput.fill('Non-binary');

    // 5. Select "other" for residence and verify free-text input appears without pre-filled "other"
    await residenceSelection.click();
    await expect(residenceDropdown).toHaveClass(/dropdown_active/);
    await residenceDropdown.locator('.option').filter({ hasText: /Other/i }).click();

    const residenceCustomInput = page.locator('#demographics_residence');
    await expect(residenceCustomInput).toBeVisible();
    await expect(residenceCustomInput).toHaveValue('');
    await expect(residenceCustomInput).toHaveAttribute('placeholder', /Your municipality/i);
    await expect(residenceCustomInput).toHaveClass(/gray_borders/);
    await residenceCustomInput.fill('Tartu suburb');

    // 6. Fill statement, description, and age
    await page.locator('#idea_statement').fill('Solar-Powered Electric Public Transport Fleet');
    await page.locator('#idea_description').fill('Transition municipal buses to electric with solar-assisted charging hubs.');
    await ageInput.fill('38');

    // 7. Intercept POST /ideas and click post button
    const postRequestPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${topicId}/ideations/${ideationId}/ideas`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    const postIdeaBtn = page.locator('#buttons_row .buttons_right_group cos-button').filter({ hasText: /Post idea|Idea post/i });
    await expect(postIdeaBtn).toBeVisible();
    await postIdeaBtn.click();

    // 8. AnonymousDialogComponent confirmation
    const anonymousDialog = page.locator('#anonymous_dialog');
    await expect(anonymousDialog).toBeVisible();
    await expect(anonymousDialog.locator('.modal-header')).toContainText(/Posting idea anonymously|anonymously/i);

    // Click primary submit button inside AnonymousDialogComponent (.btn_big_submit)
    const dialogSubmitBtn = anonymousDialog.locator('button.btn_big_submit');
    await expect(dialogSubmitBtn).toBeVisible();
    await dialogSubmitBtn.click();

    // 9. Assert POST payload format with "other: <tekst>"
    const postRequest = await postRequestPromise;
    const postPayload = postRequest.postDataJSON();
    expect(postPayload.status).toBe('published');
    expect(postPayload.statement).toBe('Solar-Powered Electric Public Transport Fleet');
    expect(postPayload.demographics).toEqual({
      age: '38',
      gender: 'other: Non-binary',
      residence: 'other: Tartu suburb',
    });

    // 10. Verify AnonymousDialogComponent and Add Idea form are closed
    await expect(anonymousDialog).not.toBeVisible();
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);

    // 11. Verify new idea appears in list
    const newIdeaCard = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Solar-Powered Electric Public Transport Fleet' });
    await expect(newIdeaCard).toBeVisible();
    await expect(newIdeaCard.locator('.statement')).toContainText('Solar-Powered Electric Public Transport Fleet');
  });
});

test.describe('Topic Ideation - Expired Ideation Deadline', () => {
  test.beforeEach(async ({ page }) => {
    const pastDeadline = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    await setupTopicIdeationRoutes(page, {
      ideation: {
        deadline: pastDeadline,
      },
    });
  });

  test('should disable header, bottom actions, and footer menu "Add your idea" buttons when deadline has passed and prevent opening the form', async ({ page }) => {
    // 1. Verify deadline date is displayed in header
    const deadlineWrap = page.locator('.ideation_header .deadline_wrap');
    await expect(deadlineWrap).toBeVisible();

    // 2. Verify ideation ended banner is displayed
    const endedBanner = page.locator('.ideation_info_text_wrap');
    await expect(endedBanner).toBeVisible();
    await expect(endedBanner).toContainText(/Ideation has ended|ended/i);

    // 3. Header "Add your idea" button is disabled
    const headerAddBtn = page.locator('app-topic-ideation .header_actions cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await expect(headerAddBtn).toBeVisible();
    await expect(headerAddBtn.locator('button')).toBeDisabled();

    // 4. Bottom actions "Add your idea" button is disabled
    const bottomAddBtn = page.locator('app-topic-ideation .bottom_actions cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await expect(bottomAddBtn).toBeVisible();
    await expect(bottomAddBtn.locator('button')).toBeDisabled();

    // 5. Footer menu "Add your idea" button is disabled
    const footerMenuBtn = page.locator('#create_idea_footer_menu cos-button').filter({ hasText: /Add your idea|Add idea/i });
    await expect(footerMenuBtn).toBeVisible();
    await expect(footerMenuBtn.locator('button')).toBeDisabled();

    // 6. Tablet button is disabled
    const tabletBtn = page.locator('#create_idea_tablet_btn button');
    await expect(tabletBtn.first()).toBeDisabled();

    // 7. Verify add idea form is closed and clicking does not open it
    const addIdeaWrap = page.locator('#create_idea_footer');
    await expect(addIdeaWrap).toHaveClass(/closed/);
    await expect(addIdeaWrap).not.toHaveClass(/open/);

    await headerAddBtn.click({ force: true });
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);

    await footerMenuBtn.click({ force: true });
    await expect(addIdeaWrap).not.toHaveClass(/open/);
    await expect(addIdeaWrap).toHaveClass(/closed/);
  });
});

test.describe('Topic Ideation - Folders & Ideas in Folder Flow', () => {
  test('Ideation Folders Empty state: should show empty state when switching to Folders tab with 0 folders', async ({ page }) => {
    await setupTopicIdeationRoutes(page, {
      initialFolders: [],
    });

    // 1. Locate Folders tab item and click it
    const foldersTab = page.locator('.tabs_wrap .tab_item').filter({ hasText: /Folders/i });
    await expect(foldersTab).toBeVisible();
    await foldersTab.click();

    // 2. Folders tab should be active
    await expect(foldersTab).toHaveClass(/active/);

    // 3. .folder_row.row_header is NOT visible
    await expect(page.locator('.folder_row.row_header')).not.toBeVisible();

    // 4. cos-no-feature-yet empty state container is visible
    const emptyState = page.locator('cos-no-feature-yet');
    await expect(emptyState).toBeVisible();

    // 5. Verify empty state heading and description
    await expect(emptyState.locator('.description_heading')).toContainText(/There are no idea folders yet/i);
    await expect(emptyState.locator('.description')).toContainText(/Topic admins can create folders to group ideas/i);

    // 6. Verify 96x96 illustration SVG
    const illustrationSvg = emptyState.locator('svg[width="96"][height="96"]');
    await expect(illustrationSvg).toBeVisible();

    // 7. Verify "+ Create new folder" button
    const createFolderBtn = emptyState.locator('cos-button').filter({ hasText: /Create new folder/i });
    await expect(createFolderBtn).toBeVisible();
  });

  test('Ideation - Folders list view & Create Folder dialog: should render folders, action menu, and create new folder via dialog', async ({ page }) => {
    const existingFolder = {
      id: 'folder-e2e-1',
      name: 'Renewable Energy Initiatives',
      ideationId,
      topicId,
      ideas: { count: 3, rows: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setupTopicIdeationRoutes(page, {
      initialFolders: [existingFolder],
    });

    // 1. Switch to Folders tab
    const foldersTab = page.locator('.tabs_wrap .tab_item').filter({ hasText: /Folders/i });
    await expect(foldersTab).toBeVisible();
    await foldersTab.click();
    await expect(foldersTab).toHaveClass(/active/);

    // 2. Verify .folder_row.row_header is visible with expected column headers
    const rowHeader = page.locator('.folder_row.row_header');
    await expect(rowHeader).toBeVisible();
    await expect(rowHeader.locator('.folder_name')).toContainText(/Folder/i);
    await expect(rowHeader.locator('.ideas_cell')).toContainText(/Ideas/i);
    await expect(rowHeader.locator('.date_cell')).toContainText(/Last activity/i);
    await expect(rowHeader.locator('.actions_cell')).toContainText(/Actions/i);

    // 3. Verify .folder_row item is rendered with folder name and idea count
    const folderRow = page.locator('.folders_wrap .folder_row:not(.row_header)').filter({ hasText: 'Renewable Energy Initiatives' });
    await expect(folderRow).toBeVisible();
    await expect(folderRow.locator('.folder_name')).toContainText('Renewable Energy Initiatives');
    await expect(folderRow.locator('.ideas_cell')).toContainText('3');

    // 4. Verify 3-dot action menu (.actions_cell .dropdown.button_dropdown)
    const actionDropdown = folderRow.locator('.actions_cell .dropdown.button_dropdown');
    await expect(actionDropdown).toBeVisible();
    const actionTrigger = actionDropdown.locator('button[trigger], button.btn_small_plain');
    await expect(actionTrigger).toBeVisible();

    // 5. Click "+ Create new folder" button
    const createNewFolderBtn = page.locator('#add_folder_btn cos-button').filter({ hasText: /Create new folder/i });
    await expect(createNewFolderBtn).toBeVisible();
    await createNewFolderBtn.click();

    // 6. Verify app-create-idea-folder dialog opens
    const createDialog = page.locator('app-create-idea-folder');
    await expect(createDialog).toBeVisible();
    await expect(createDialog.locator('.title')).toContainText(/Create folder/i);

    // 7. Fill in folder name
    const folderNameInput = createDialog.locator('#name');
    await expect(folderNameInput).toBeVisible();
    await folderNameInput.fill('Civic Transportation Proposals');

    // 8. Capture POST request and click Create button
    const postFolderPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${topicId}/ideations/${ideationId}/folders`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    const submitCreateBtn = createDialog.locator('.dialog_footer cos-button').filter({ hasText: /Create folder|Create/i });
    await expect(submitCreateBtn).toBeVisible();
    await submitCreateBtn.click();

    // 9. Assert POST request payload
    const postReq = await postFolderPromise;
    expect(postReq.postDataJSON().name).toBe('Civic Transportation Proposals');

    // 10. Verify dialog closes and newly created folder is rendered in the list
    await expect(createDialog).not.toBeVisible();
    const newFolderRow = page.locator('.folders_wrap .folder_row:not(.row_header)').filter({ hasText: 'Civic Transportation Proposals' });
    await expect(newFolderRow).toBeVisible();
  });

  test('Ideas in folder view & Add Ideas to Folder dialog: should enter folder view, display header details, and add ideas to folder via dialog', async ({ page }) => {
    const targetFolder = {
      id: 'folder-solar-1',
      name: 'Municipal Solar Initiatives',
      ideationId,
      topicId,
      ideas: { count: 1, rows: [] },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ideaAlreadyInFolder = {
      id: 'idea-solar-existing',
      topicId,
      ideationId,
      folderId: 'folder-solar-1',
      statement: 'Rooftop Solar on City Hall',
      description: 'Solar panels installed on the roof of municipal administration building.',
      status: 'published',
      author: { id: 'user-admin', name: 'Admin Coordinator' },
      votes: { up: { count: 6, selected: false }, down: { count: 0, selected: false }, count: 6 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    const ideaUnassigned = {
      id: 'idea-unassigned-2',
      topicId,
      ideationId,
      statement: 'Battery Storage Facility at Port',
      description: 'Large-scale battery facility to balance peak renewable grid load.',
      status: 'published',
      author: { id: 'user-admin', name: 'Admin Coordinator' },
      votes: { up: { count: 3, selected: false }, down: { count: 0, selected: false }, count: 3 },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    await setupTopicIdeationRoutes(page, {
      initialFolders: [targetFolder],
      initialIdeas: [ideaAlreadyInFolder, ideaUnassigned],
    });

    // 1. Switch to Folders tab
    const foldersTab = page.locator('.tabs_wrap .tab_item').filter({ hasText: /Folders/i });
    await expect(foldersTab).toBeVisible();
    await foldersTab.click();

    // 2. Click folder row to enter "Ideas in folder" view
    const folderRow = page.locator('.folders_wrap .folder_row:not(.row_header)').filter({ hasText: 'Municipal Solar Initiatives' });
    await expect(folderRow).toBeVisible();
    await folderRow.click();

    // 3. Verify .folder_data_wrap is visible
    const folderDataWrap = page.locator('.folder_data_wrap');
    await expect(folderDataWrap).toBeVisible();

    // 4. Verify back button is visible
    const backBtn = folderDataWrap.locator('button.btn_medium_close');
    await expect(backBtn).toBeVisible();

    // 5. Verify yellow folder icon SVG (28x24)
    const folderIconSvg = folderDataWrap.locator('svg[width="28"][height="24"]');
    await expect(folderIconSvg).toBeVisible();

    // 6. Verify folder name and count (Municipal Solar Initiatives (1))
    const folderNameElem = folderDataWrap.locator('.folder_name');
    await expect(folderNameElem).toBeVisible();
    await expect(folderNameElem).toContainText('Municipal Solar Initiatives');
    await expect(folderNameElem).toContainText('(1)');

    // 7. Verify ideas belonging to the folder are rendered, and unassigned idea is NOT rendered
    const assignedIdeaCard = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Rooftop Solar on City Hall' });
    await expect(assignedIdeaCard).toBeVisible();
    const unassignedIdeaCard = page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Battery Storage Facility at Port' });
    await expect(unassignedIdeaCard).not.toBeVisible();

    // 8. Click "Add ideas to folder" header action button
    const addIdeasToFolderBtn = page.locator('.header_actions cos-button').filter({ hasText: /Add ideas to folder/i });
    await expect(addIdeasToFolderBtn).toBeVisible();
    await addIdeasToFolderBtn.click();

    // 9. Verify app-add-ideas-to-folder dialog opens
    const addIdeasDialog = page.locator('app-add-ideas-to-folder');
    await expect(addIdeasDialog).toBeVisible();
    await expect(addIdeasDialog.locator('.title')).toContainText(/Add ideas to folder/i);

    // 10. Select the unassigned idea by clicking its checkbox
    const unassignedRow = addIdeasDialog.locator('.idea_row').filter({ hasText: 'Battery Storage Facility at Port' });
    await expect(unassignedRow).toBeVisible();
    await unassignedRow.locator('.checkbox_wrap').click();
    await expect(unassignedRow.locator('.checkbox')).toHaveClass(/selected/);

    // 11. Capture POST request for adding ideas to folder
    const postIdeasPromise = page.waitForRequest(
      (req) => req.url().includes(`/topics/${topicId}/ideations/${ideationId}/folders/${targetFolder.id}/ideas`) && req.method() === 'POST',
      { timeout: 15000 }
    );

    // 12. Click submit button (.btn_big_submit)
    const submitBtn = addIdeasDialog.locator('button.btn_big_submit');
    await expect(submitBtn).toBeVisible();
    await submitBtn.click();

    // 13. Verify POST request payload has selected idea id
    const postReq = await postIdeasPromise;
    const postPayload = postReq.postDataJSON();
    expect(postPayload).toEqual([{ id: 'idea-unassigned-2' }]);

    // 14. Dialog closes
    await expect(addIdeasDialog).not.toBeVisible();

    // 15. Reloads folder ideas and count: both ideas are now displayed in folder view
    await expect(page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Rooftop Solar on City Hall' })).toBeVisible();
    await expect(page.locator('.ideas_wrap app-ideabox').filter({ hasText: 'Battery Storage Facility at Port' })).toBeVisible();
    await expect(folderNameElem).toContainText('(2)');

    // 16. Verify clicking back button leaves folder view and returns to Folders list
    await backBtn.click();
    await expect(page.locator('.folder_data_wrap')).not.toBeVisible();
    await expect(page.locator('.folders_wrap .folder_row.row_header')).toBeVisible();
    await expect(page.locator('.folders_wrap .folder_row:not(.row_header)').filter({ hasText: 'Municipal Solar Initiatives' })).toBeVisible();
  });
});

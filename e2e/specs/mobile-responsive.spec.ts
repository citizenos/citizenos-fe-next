import { test, expect, type Page } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

const MOBILE_VIEWPORTS = [
  { name: 'iPhone SE (375x667)', width: 375, height: 667 },
  { name: 'iPhone 5 / Narrow (320x568)', width: 320, height: 568 },
];

const MOCK_TOPIC_ID = 'mobile-filters-test-topic';
const MOCK_IDEATION_ID = 'mobile-filters-test-ideation';
const MOCK_VOTE_ID = 'mobile-filters-test-vote';
const MOCK_DISCUSSION_ID = 'mobile-filters-test-discussion';

async function setupTopicApiMocks(page: Page) {
  await page.addInitScript(() => {
    localStorage.setItem('show-topic-tour', 'true');
  });

  const mockTopicData = {
    id: MOCK_TOPIC_ID,
    title: 'Mobile Responsive Filter Test Topic',
    description: 'A test topic for testing mobile filters in ideation, discussion, and voting.',
    visibility: 'public',
    status: 'voting',
    discussionId: MOCK_DISCUSSION_ID,
    ideationId: MOCK_IDEATION_ID,
    voteId: MOCK_VOTE_ID,
    permission: { level: 'admin' },
    canEdit: true,
    canDelete: true,
    creator: { id: 'user-admin', name: 'Admin User' },
    categories: ['environment'],
    members: { users: { count: 2, rows: [] }, groups: { count: 0, rows: [] } },
    attachments: [],
  };

  const mockIdeationData = {
    id: MOCK_IDEATION_ID,
    topicId: MOCK_TOPIC_ID,
    question: 'How to test mobile ideation filters?',
    deadline: null,
  };

  const mockIdeasData = {
    rows: [
      {
        id: 'idea-1',
        topicId: MOCK_TOPIC_ID,
        ideationId: MOCK_IDEATION_ID,
        status: 'published',
        statement: 'Idea statement for mobile test',
        author: { id: 'u1', name: 'Alice' },
        votes: { up: { count: 2, selected: false }, down: { count: 0, selected: false }, count: 2 },
      },
    ],
    count: 1,
  };

  const mockDiscussionData = {
    id: MOCK_DISCUSSION_ID,
    topicId: MOCK_TOPIC_ID,
    question: 'Mobile Discussion Question?',
    deadline: null,
    createdAt: '2026-01-01T00:00:00.000Z',
    updatedAt: '2026-01-02T00:00:00.000Z',
  };

  const mockArgumentsData = {
    rows: [
      {
        id: 'arg-1',
        topicId: MOCK_TOPIC_ID,
        type: 'pro',
        subject: 'Mobile pro argument',
        text: 'Mobile pro argument text for test',
        author: { id: 'u1', name: 'Alice' },
        votes: { up: { count: 3, selected: false }, down: { count: 0, selected: false } },
        replies: { count: 0, rows: [] },
        edits: {},
      },
      {
        id: 'arg-2',
        topicId: MOCK_TOPIC_ID,
        type: 'con',
        subject: 'Mobile con argument',
        text: 'Mobile con argument text for test',
        author: { id: 'u2', name: 'Bob' },
        votes: { up: { count: 1, selected: false }, down: { count: 0, selected: false } },
        replies: { count: 0, rows: [] },
        edits: {},
      },
    ],
    count: { total: 2, pro: 1, con: 1, poi: 0, reply: 0 },
  };

  const mockVoteData = {
    id: MOCK_VOTE_ID,
    topicId: MOCK_TOPIC_ID,
    description: 'Mobile Vote Question?',
    type: 'regular',
    authType: 'soft',
    maxChoices: 1,
    minChoices: 1,
    endsAt: null,
    options: [
      { id: 'opt-1', value: 'Option Yes', selected: false },
      { id: 'opt-2', value: 'Option No', selected: false },
    ],
    reminderSent: false,
  };

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockTopicData }),
    });
  });

  await page.route(new RegExp(`/api/users/self/topics/${MOCK_TOPIC_ID}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockTopicData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/ideations/${MOCK_IDEATION_ID}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeationData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/ideations/${MOCK_IDEATION_ID}/ideas(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockIdeasData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/discussions/${MOCK_DISCUSSION_ID}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockDiscussionData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/discussions/${MOCK_DISCUSSION_ID}/comments(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockArgumentsData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/arguments(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockArgumentsData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/votes/${MOCK_VOTE_ID}(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockVoteData }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/votes(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [mockVoteData], count: 1 } }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/attachments(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/members/users(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/members/groups(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });

  await page.route(new RegExp(`/api/topics/${MOCK_TOPIC_ID}/events(\\?.*)?$`), async (routeHandler) => {
    await routeHandler.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
    });
  });
}

test.describe('Mobile Responsive Layout & Z-Index Hierarchy', () => {
  // Use public context without saved credentials to test unauthenticated mobile elements
  test.use({ storageState: { cookies: [], origins: [] } });

  for (const vp of MOBILE_VIEWPORTS) {
    test.describe(`Viewport: ${vp.name}`, () => {
      test.beforeEach(async ({ page }) => {
        await page.setViewportSize({ width: vp.width, height: vp.height });
      });

      test('should have zero horizontal scroll overflow on home page', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('should have zero horizontal scroll overflow on public topics page', async ({ page }) => {
        await page.goto(route('public/topics'));
        await waitForApp(page);

        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('mobile nav-bar Login and Sign Up buttons should fit within screen bounds', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        const mobileLoginBar = page.locator('#mobile_login');
        await expect(mobileLoginBar).toBeVisible();

        const buttons = mobileLoginBar.locator('button');
        const count = await buttons.count();
        expect(count).toBeGreaterThanOrEqual(2);

        for (let i = 0; i < count; i++) {
          const btn = buttons.nth(i);
          await expect(btn).toBeVisible();

          const box = await btn.boundingBox();
          expect(box).not.toBeNull();
          if (box) {
            // Button must start within screen and not exceed viewport width
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1); // allow 1px rounding tolerance
          }
        }
      });

      test('login dialog and its action buttons should fit within screen width without overflow', async ({ page }) => {
        await page.goto(route(''));
        await waitForApp(page);

        // Click the Login button from mobile nav bar
        const loginBtn = page.locator('#mobile_login button').first();
        await expect(loginBtn).toBeVisible();
        await loginBtn.click();

        const loginDialog = page.locator('app-login-dialog');
        await expect(loginDialog).toBeVisible();

        // Check dialog card boundary
        const dialogCard = loginDialog.locator('.dialog-card, .auth-dialog-card').first();
        const cardBox = await dialogCard.boundingBox();
        expect(cardBox).not.toBeNull();
        if (cardBox) {
          expect(cardBox.x).toBeGreaterThanOrEqual(0);
          expect(cardBox.x + cardBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Check OAuth action buttons inside login form
        const oauthBtns = loginDialog.locator('.auth-icon-btn, .oauth-btn');
        const oauthCount = await oauthBtns.count();
        for (let i = 0; i < oauthCount; i++) {
          const obtn = oauthBtns.nth(i);
          const obox = await obtn.boundingBox();
          if (obox) {
            expect(obox.x).toBeGreaterThanOrEqual(0);
            expect(obox.x + obox.width).toBeLessThanOrEqual(vp.width + 1);
          }
        }

        // Check submit button
        const submitBtn = loginDialog.locator('button[type="submit"], cos-button button').first();
        const submitBox = await submitBtn.boundingBox();
        if (submitBox) {
          expect(submitBox.x).toBeGreaterThanOrEqual(0);
          expect(submitBox.x + submitBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Ensure no horizontal scroll is caused by open modal
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('mobile filter toolbar and dropdowns should have correct z-index and not overflow', async ({ page }) => {
        await page.goto(route('public/topics'));
        await waitForApp(page);

        const filterToolbar = page.locator('app-list-filter-toolbar');
        if (await filterToolbar.isVisible()) {
          // Check that dropdown or mobile filter section fits within screen
          const box = await filterToolbar.boundingBox();
          if (box) {
            expect(box.x).toBeGreaterThanOrEqual(0);
            expect(box.x + box.width).toBeLessThanOrEqual(vp.width + 1);
          }

          // Check cos-dropdown z-index stacking hierarchy
          const dropdowns = filterToolbar.locator('cos-dropdown');
          const ddCount = await dropdowns.count();
          if (ddCount > 0) {
            const firstDd = dropdowns.first();
            const selection = firstDd.locator('.dropdown-selection');
            if (await selection.isVisible()) {
              await selection.click();
              const options = firstDd.locator('.dropdown-options');
              if (await options.isVisible()) {
                const zIndex = await options.evaluate((el) => {
                  return window.getComputedStyle(el).zIndex;
                });
                // cos-dropdown options must have z-index >= 150
                expect(parseInt(zIndex, 10)).toBeGreaterThanOrEqual(150);

                const optBox = await options.boundingBox();
                if (optBox) {
                  expect(optBox.x).toBeGreaterThanOrEqual(0);
                  expect(optBox.x + optBox.width).toBeLessThanOrEqual(vp.width + 1);
                }
              }
            }
          }
        }
      });

      test('mobile discussion filter drawer (.mobile_filters_wrap) should stack with higher z-index than bottom tabs and footer', async ({ page }) => {
        // Evaluate the CSS stacking hierarchy defined for mobile tabs, bottom nav, and mobile filter sheet
        await page.goto(route(''));
        await waitForApp(page);

        const zIndices = await page.evaluate(() => {
          const testContainer = document.createElement('div');
          testContainer.id = 'z-index-audit-container';
          testContainer.innerHTML = `
            <div class="topic_tabs tablet"></div>
            <div class="mobile_filters_wrap active"></div>
            <div id="mobile_login"></div>
            <cos-dropdown class="open"><div class="dropdown-options"></div></cos-dropdown>
          `;
          document.body.appendChild(testContainer);

          const tabletTabs = testContainer.querySelector('.topic_tabs.tablet') as HTMLElement;
          const filterWrap = testContainer.querySelector('.mobile_filters_wrap') as HTMLElement;
          const mobileLogin = testContainer.querySelector('#mobile_login') as HTMLElement;
          const ddOptions = testContainer.querySelector('.dropdown-options') as HTMLElement;

          const getZ = (el: HTMLElement) => {
            const val = window.getComputedStyle(el).zIndex;
            return isNaN(parseInt(val, 10)) ? 0 : parseInt(val, 10);
          };

          const result = {
            tabletTabs: getZ(tabletTabs),
            filterWrap: getZ(filterWrap),
            mobileLogin: getZ(mobileLogin),
            ddOptions: getZ(ddOptions),
          };

          testContainer.remove();
          return result;
        });

        // Hierarchy rule:
        // .mobile_filters_wrap (slide-up drawer) must stack ABOVE .topic_tabs.tablet and #mobile_login
        // so drawer is never obscured by the fixed bottom bars.
        if (zIndices.filterWrap > 0 && zIndices.tabletTabs > 0) {
          expect(zIndices.filterWrap).toBeGreaterThan(zIndices.tabletTabs);
        }
        if (zIndices.filterWrap > 0 && zIndices.mobileLogin > 0) {
          expect(zIndices.filterWrap).toBeGreaterThan(zIndices.mobileLogin);
        }
      });

      test('topic ideation mobile filters, chevron-right icons, reset button and bottom sheet should render and fit screen', async ({ page }) => {
        await setupTopicApiMocks(page);
        await page.goto(route(`topics/${MOCK_TOPIC_ID}#ideation`));
        await waitForApp(page);

        // Click ideation tab if visible on tablet/mobile bottom bar
        const ideationTab = page.locator('.topic_tabs.tablet a.topic_tab.ideation');
        if (await ideationTab.isVisible()) {
          await ideationTab.click();
          await page.waitForTimeout(500);
        }

        // 1. #mobile_filters container should be visible
        const mobileFilters = page.locator('app-topic-ideation #mobile_filters');
        await expect(mobileFilters).toBeVisible();

        // Check bounds within viewport
        const filtersBox = await mobileFilters.boundingBox();
        expect(filtersBox).not.toBeNull();
        if (filtersBox) {
          expect(filtersBox.x).toBeGreaterThanOrEqual(0);
          expect(filtersBox.x + filtersBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // 2. .mobile_filters_selection trigger
        const filterSelection = mobileFilters.locator('.mobile_filters_selection');
        await expect(filterSelection).toBeVisible();

        // Expand mobile filter options
        const selectionTrigger = filterSelection.locator('.selection');
        await selectionTrigger.click();
        await expect(filterSelection).toHaveClass(/dropdown_active/);

        // 3. .filter_option elements with chevron-right icons
        const filterOptions = filterSelection.locator('.filter_option');
        const count = await filterOptions.count();
        expect(count).toBeGreaterThanOrEqual(3); // Type, Order, Participants

        const chevronIcons = filterSelection.locator('.filter_option cos-icon[name="chevron-right"]');
        const chevronCount = await chevronIcons.count();
        expect(chevronCount).toBeGreaterThanOrEqual(3);

        // 4. .reset_filters_btn
        const resetBtn = filterSelection.locator('.reset_filters_btn');
        await expect(resetBtn).toBeVisible();

        // 5. Open slide-up bottom sheet (.mobile_filters_wrap)
        await filterOptions.first().click();

        const bottomSheet = mobileFilters.locator('.mobile_filters_wrap.filters_wrap.active');
        await expect(bottomSheet).toBeVisible();

        const sheetBox = await bottomSheet.boundingBox();
        expect(sheetBox).not.toBeNull();
        if (sheetBox) {
          expect(sheetBox.x).toBeGreaterThanOrEqual(0);
          expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // 6. Apply button (.btn_medium_secondary) inside bottom sheet
        const applyBtn = bottomSheet.locator('.btn_medium_secondary');
        await expect(applyBtn).toBeVisible();

        // Clicking Apply button closes bottom sheet
        await applyBtn.click();
        await expect(bottomSheet).not.toBeVisible();

        // Ensure zero horizontal scroll overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('topic discussion mobile filters, chevron-right icons, reset button and bottom sheet should render and fit screen', async ({ page }) => {
        await setupTopicApiMocks(page);
        await page.goto(route(`topics/${MOCK_TOPIC_ID}#discussion`));
        await waitForApp(page);

        const discTab = page.locator('.topic_tabs.tablet a.topic_tab.discussion');
        if (await discTab.isVisible()) {
          await discTab.click();
          await page.waitForTimeout(500);
        }

        const discussionEl = page.locator('cos-topic-discussion');
        await expect(discussionEl).toBeVisible();

        // 1. .mobile_filters_selection
        const mobileFiltersSelection = discussionEl.locator('.mobile_filters_selection');
        await expect(mobileFiltersSelection).toBeVisible();

        const selBox = await mobileFiltersSelection.boundingBox();
        if (selBox) {
          expect(selBox.x).toBeGreaterThanOrEqual(0);
          expect(selBox.x + selBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Toggle mobile filters dropdown
        const trigger = mobileFiltersSelection.locator('.selection');
        await trigger.click();
        await expect(mobileFiltersSelection).toHaveClass(/dropdown_active/);

        // 2. .filter_option rows with chevron-right icons
        const filterOptions = mobileFiltersSelection.locator('.filter_option');
        const count = await filterOptions.count();
        expect(count).toBeGreaterThanOrEqual(2); // argumentType, sortOrder

        const chevrons = mobileFiltersSelection.locator('.filter_option cos-icon[name="chevron-right"]');
        expect(await chevrons.count()).toBeGreaterThanOrEqual(2);

        // 3. Open sortOrder or argumentType filter sheet
        await filterOptions.first().click();

        // 4. .mobile_filters_wrap bottom sheet
        const bottomSheet = discussionEl.locator('.mobile_filters_wrap.filters_wrap.active');
        await expect(bottomSheet).toBeVisible();

        const sheetBox = await bottomSheet.boundingBox();
        if (sheetBox) {
          expect(sheetBox.x).toBeGreaterThanOrEqual(0);
          expect(sheetBox.x + sheetBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Toggle checkbox to change filter state
        const checkbox = bottomSheet.locator('label.checkbox').first();
        await checkbox.click();

        // Apply button
        const applyBtn = bottomSheet.locator('.btn_medium_secondary');
        await expect(applyBtn).toBeVisible();
        await applyBtn.click();
        await expect(bottomSheet).not.toBeVisible();

        // 5. Reset filters button should be visible when filters are active
        if (!(await mobileFiltersSelection.evaluate(el => el.classList.contains('dropdown_active')))) {
          await trigger.click();
        }
        const resetBtn = mobileFiltersSelection.locator('.reset_filters_btn');
        await expect(resetBtn).toBeVisible();
        await resetBtn.click();

        // Ensure zero horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });

      test('topic voting mobile actions button (#mobile_actions) and dropdown menu should fit within screen', async ({ page }) => {
        await setupTopicApiMocks(page);
        await page.goto(route(`topics/${MOCK_TOPIC_ID}#voting`));
        await waitForApp(page);

        const voteTab = page.locator('.topic_tabs.tablet a.topic_tab.voting');
        if (await voteTab.isVisible()) {
          await voteTab.click();
          await page.waitForTimeout(500);
        }

        const voteCast = page.locator('app-topic-vote-cast');
        await expect(voteCast).toBeVisible();

        // 1. #mobile_actions button inside .mobile_show
        const mobileActionsBtn = voteCast.locator('#mobile_actions');
        await expect(mobileActionsBtn).toBeVisible();

        const btnBox = await mobileActionsBtn.boundingBox();
        expect(btnBox).not.toBeNull();
        if (btnBox) {
          expect(btnBox.x).toBeGreaterThanOrEqual(0);
          expect(btnBox.x + btnBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // 2. Click #mobile_actions to open the actions dropdown
        await mobileActionsBtn.click();

        const dropdownContainer = voteCast.locator('.setting_button.dropdown');
        await expect(dropdownContainer).toHaveClass(/dropdown_active/);

        const optionsMenu = dropdownContainer.locator('.options');
        await expect(optionsMenu).toBeVisible();

        const menuBox = await optionsMenu.boundingBox();
        expect(menuBox).not.toBeNull();
        if (menuBox) {
          expect(menuBox.x).toBeGreaterThanOrEqual(0);
          expect(menuBox.x + menuBox.width).toBeLessThanOrEqual(vp.width + 1);
        }

        // Ensure options inside are clickable and within bounds
        const options = optionsMenu.locator('.option');
        const optCount = await options.count();
        expect(optCount).toBeGreaterThanOrEqual(1);

        // Ensure zero horizontal overflow
        const hasHorizontalOverflow = await page.evaluate(() => {
          return document.documentElement.scrollWidth > document.documentElement.clientWidth;
        });
        expect(hasHorizontalOverflow).toBe(false);
      });
    });
  }
});

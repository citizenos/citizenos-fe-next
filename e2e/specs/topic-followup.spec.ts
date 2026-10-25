import { test, expect } from '@playwright/test';
import { route, waitForApp } from '../fixtures/test-fixtures';

test.describe('Topic Follow-Up & Outcome Lifecycle', () => {
  const topicId = 'topic-followup-e2e-1';

  const mockFollowUpTopic = {
    id: topicId,
    title: 'Clean Energy Municipal Initiative',
    description: 'Implementation milestones and final outcome of the municipal solar transition.',
    visibility: 'public',
    status: 'followUp',
    permission: { level: 'admin' },
    canEdit: true,
    canDelete: true,
    canUpdate: true,
    creator: { id: 'user-admin', name: 'Admin Coordinator' },
    categories: ['environment', 'energy'],
  };

  const mockVote = {
    id: 'vote-followup-1',
    topicId,
    type: 'regular',
    autoClose: [{ allMembersVoted: false }],
    options: {
      rows: [
        { id: 'opt-1', value: 'Support Solar Installation', voteCount: 42 },
        { id: 'opt-2', value: 'Against Solar Installation', voteCount: 8 },
      ],
      count: 2,
    },
    authType: 'soft',
  };

  const mockMilestoneEvent = {
    id: 'event-1',
    topicId,
    subject: 'Contractor Selection Finalized',
    text: 'Municipal procurement panel approved the tender contract.',
    editMode: false,
  };

  test.beforeEach(async ({ page }) => {
    // Intercept topic API
    await page.route(`**/api/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockFollowUpTopic }),
      });
    });

    await page.route(`**/api/users/self/topics/${topicId}`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: mockFollowUpTopic }),
      });
    });

    await page.route(`**/api/topics/${topicId}/votes`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [mockVote], count: 1 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/events*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [mockMilestoneEvent], count: 1 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/arguments*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/ideations*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/attachments*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/members/users*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.route(`**/api/topics/${topicId}/members/groups*`, async (routeHandler) => {
      await routeHandler.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } }),
      });
    });

    await page.goto(route(`topics/${topicId}`));
    await waitForApp(page);
  });

  test('should display follow-up milestones section when selecting follow-up tab', async ({ page }) => {
    // Select Follow-up tab
    const followUpTab = page.locator('a.topic_tab.follow_up, button.tab_item').filter({ hasText: /Follow-up/i }).first();
    await expect(followUpTab).toBeVisible();
    await followUpTab.click();

    // Verify milestones component is displayed
    const milestonesWrap = page.locator('.follow_up_wrap, app-topic-milestones');
    await expect(milestonesWrap).toBeVisible();

    // Check heading or milestone title
    const milestoneHeading = page.locator('.follow_up_title, .milestone');
    await expect(milestoneHeading.first()).toBeVisible();
  });

  test('should display final voting outcome and results graph in voting tab', async ({ page }) => {
    // Switch to voting tab to see final results
    const votingTab = page.locator('a.topic_tab.voting, button.tab_item').filter({ hasText: /Voting/i }).first();
    await expect(votingTab).toBeVisible();
    await votingTab.click();

    // Verify vote results / big graph is visible
    const voteSection = page.locator('app-topic-vote-cast, .vote_options');
    await expect(voteSection).toBeVisible();

    // Expect vote option texts to be present
    await expect(page.locator('text=Support Solar Installation')).toBeVisible();
    await expect(page.locator('text=Against Solar Installation')).toBeVisible();
  });
});

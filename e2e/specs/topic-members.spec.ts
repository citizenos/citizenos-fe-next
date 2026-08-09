import { test, expect } from '../fixtures/test-fixtures';
import { TopicCreatePage } from '../pages/topic-create.page';
import { TopicViewPage } from '../pages/topic-view.page';
import { InviteDialogPage } from '../pages/invite-dialog.page';
import { ParticipantsDialogPage } from '../pages/participants-dialog.page';

test.describe.configure({ mode: 'serial' });

test.describe('Member Management Flow', () => {
  let topicId: string;
  let topicViewPage: TopicViewPage;
  let inviteDialogPage: InviteDialogPage;
  let participantsDialogPage: ParticipantsDialogPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: 'e2e/.auth/user.json' });
    const topicCreatePage = new TopicCreatePage(page);
    const title = `Members Test - ${Date.now()}`;
    await topicCreatePage.goto();
    await topicCreatePage.fillInfo(title, 'Testing member management');
    
    // We expect Etherpad iframe to load
    await page.getByRole('button', { name: /Topic text/i }).click();
    await page.locator('iframe[cosEtherpad]').waitFor({ state: 'visible', timeout: 60000 });
    await page.waitForTimeout(1000);

    await topicCreatePage.proceedToNextStep(); // Settings
    await topicCreatePage.proceedToNextStep(); // Discussion
    await topicCreatePage.fillDiscussion('Members Test Question');
    await topicCreatePage.proceedToNextStep(); // Preview
    await topicCreatePage.publish();
    await expect(page).toHaveURL(/.*\/topics\/[a-f0-9-]+/);
    const urlParts = page.url().split('/');
    topicId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || urlParts.pop() || '';
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    topicViewPage = new TopicViewPage(page);
    inviteDialogPage = new InviteDialogPage(page);
    participantsDialogPage = new ParticipantsDialogPage(page);
    await topicViewPage.goto(topicId);
  });

  test('should invite a user via email', async ({ page }) => {
    // Locate the "Share" button in the participants sidebar
    await page.locator('button').filter({ hasText: /Share/i }).first().click();
    
    const inviteEmail = `test-invite-${Date.now()}@example.com`;
    await inviteDialogPage.inviteUser(inviteEmail);
    
    // Wait for the invite dialog to close
    await expect(page.locator('app-topic-invite-dialog')).toBeHidden();
    
    // Verify user is in "Invited" list
    const manageLink = page.locator('app-topic-participants-section .manage_link').first();
    await expect(manageLink).toBeVisible();
    await manageLink.click({ force: true });
    
    await participantsDialogPage.selectTab('invited');
    await expect(participantsDialogPage.inviteRows.filter({ hasText: inviteEmail })).toBeVisible();
  });
});

import { test, expect } from '../fixtures/test-fixtures';
import { TopicCreatePage } from '../pages/topic-create.page';
import { TopicViewPage } from '../pages/topic-view.page';

test.describe.configure({ mode: 'serial' });

test.describe('Topic Arguments Flow', () => {
  let topicId: string;
  let topicViewPage: TopicViewPage;

  test.beforeAll(async ({ browser }) => {
    // Create a topic to use for all argument tests
    const page = await browser.newPage({
      storageState: 'e2e/.auth/user.json'
    });
    const topicCreatePage = new TopicCreatePage(page);
    const title = `Arguments Test - ${Date.now()}`;
    await topicCreatePage.goto();
    await topicCreatePage.fillInfo(title, 'Testing arguments');
    
    // We expect Etherpad iframe to load
    await page.getByRole('button', { name: /Topic text/i }).click();
    await page.locator('iframe[cosEtherpad]').waitFor({ state: 'visible', timeout: 60000 });

    await topicCreatePage.proceedToNextStep(); // Settings
    await topicCreatePage.proceedToNextStep(); // Discussion
    await topicCreatePage.fillDiscussion('Arg Test Question');
    await topicCreatePage.proceedToNextStep(); // Preview
    await topicCreatePage.publish();

    // Wait for the invite dialog and close it
    const closeBtn = page.locator('app-topic-invite-dialog .btn_dialog_close');
    await expect(closeBtn).toBeVisible({ timeout: 15000 });
    await closeBtn.click();
    
    await expect(page).toHaveURL(/.*\/topics\/[a-f0-9-]+/);
    const urlParts = page.url().split('/');
    topicId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || urlParts.pop() || '';
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    topicViewPage = new TopicViewPage(page);
    await topicViewPage.goto(topicId);
  });

  test('should add a pro argument', async () => {
    const subject = 'Pro Subject';
    const text = 'Pro argument text body';
    await topicViewPage.addArgument(subject, text, 'pro');
    
    await expect(topicViewPage.argumentItems.filter({ hasText: subject })).toBeVisible();
    await expect(topicViewPage.argumentItems.filter({ hasText: subject }).locator('.argument_body')).toContainText(text);
  });

  test('should add a con argument', async () => {
    const subject = 'Con Subject';
    const text = 'Con argument text body';
    await topicViewPage.addArgument(subject, text, 'con');
    
    await expect(topicViewPage.argumentItems.filter({ hasText: subject })).toBeVisible();
    await expect(topicViewPage.argumentItems.filter({ hasText: subject }).locator('.argument_body')).toContainText(text);
  });

  test('should delete own argument', async () => {
    const subject = 'Delete Me';
    await topicViewPage.addArgument(subject, 'Deleting this');
    
    const arg = topicViewPage.argumentItems.filter({ hasText: subject });
    await arg.hover();
    await arg.locator('.btn_argument_actions:visible').first().click();
    await arg.locator('.option', { hasText: 'Delete' }).click();
    
    // Confirm dialog
    await topicViewPage.page.locator('button:has-text("Yes")').click();
    
    // It should show "This argument has been deleted" or disappear depending on implementation
    // Usually it shows ArgumentDeletedComponent
    await expect(topicViewPage.page.locator('app-argument-deleted')).toBeVisible();
  });
});

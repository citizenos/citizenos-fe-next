import { test, expect } from '../fixtures/test-fixtures';
import { TopicCreatePage } from '../pages/topic-create.page';
import { TopicViewPage } from '../pages/topic-view.page';
import { VoteCreatePage } from '../pages/vote-create.page';

test.describe.configure({ mode: 'serial' });

test.describe('Topic Voting Flow', () => {
  let topicId: string;
  let topicViewPage: TopicViewPage;
  let voteCreatePage: VoteCreatePage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: 'e2e/.auth/user.json' });
    const topicCreatePage = new TopicCreatePage(page);
    const title = `Voting Test - ${Date.now()}`;
    await topicCreatePage.goto();
    await topicCreatePage.fillInfo(title, 'Testing voting');
    
    // We expect Etherpad iframe to load
    await page.getByRole('button', { name: /Topic text/i }).click();
    await page.locator('iframe[cosEtherpad]').waitFor({ state: 'visible', timeout: 60000 });
    await page.waitForTimeout(1000);

    await topicCreatePage.proceedToNextStep(); // Settings
    await topicCreatePage.proceedToNextStep(); // Discussion
    await topicCreatePage.fillDiscussion('Voting Test Question');
    await topicCreatePage.proceedToNextStep(); // Preview
    await topicCreatePage.publish();
    await expect(page).toHaveURL(/.*\/topics\/[a-f0-9-]+/);
    const urlParts = page.url().split('/');
    topicId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || urlParts.pop() || '';
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    topicViewPage = new TopicViewPage(page);
    voteCreatePage = new VoteCreatePage(page);
    await topicViewPage.goto(topicId);
  });

  test('should render empty vote state block', async ({ page }) => {
    // Verify the UI shows the option to add voting to the topic
    await expect(page.locator('.state_item.vote .item_heading')).toBeVisible();
    await expect(page.locator('.state_item.vote .item_heading')).toContainText(/Voting|Vote/i);
  });
});

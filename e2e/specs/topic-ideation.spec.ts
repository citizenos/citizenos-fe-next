import { test, expect } from '../fixtures/test-fixtures';
import { IdeationCreatePage } from '../pages/ideation-create.page';
import { TopicViewPage } from '../pages/topic-view.page';

test.describe.configure({ mode: 'serial' });

test.describe('Topic Ideation Flow', () => {
  let topicId: string;
  let topicViewPage: TopicViewPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: 'e2e/.auth/user.json' });
    const ideationCreatePage = new IdeationCreatePage(page);
    const title = `Ideation Flow Test - ${Date.now()}`;
    await ideationCreatePage.goto();
    await ideationCreatePage.fillInfo(title, 'Testing ideation block');
    
    // We expect Etherpad iframe to load
    await page.getByRole('button', { name: /Topic text/i }).click();
    await page.locator('iframe[cosEtherpad]').waitFor({ state: 'visible', timeout: 60000 });
    await page.waitForTimeout(1000);

    await ideationCreatePage.proceedToNext(); // Settings
    await ideationCreatePage.proceedToNext(); // Ideation
    await page.locator('textarea#ideation-question').fill('Ideation Block Question');
    await ideationCreatePage.proceedToNext(); // Preview
    await page.locator('button').filter({ hasText: /Publish/i }).click();
    
    await expect(page).toHaveURL(/.*\/topics\/(ideation\/create\/)?[a-f0-9-]+/);
    const urlParts = page.url().split('/');
    topicId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || urlParts.pop() || '';
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    topicViewPage = new TopicViewPage(page);
    await topicViewPage.goto(topicId);
  });

  test('should render populated ideation state block', async ({ page }) => {
    // Verify the UI shows the populated ideation state block
    await expect(page.locator('.state_item.ideation .item_title_with_description')).toBeVisible();
    await expect(page.locator('.state_item.ideation .item_title_with_description')).toContainText(/Ideation|Idea/i);
  });
});

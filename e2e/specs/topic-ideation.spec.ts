import { test, expect } from '../fixtures/test-fixtures';
import { IdeationCreatePage } from '../pages/ideation-create.page';
import { TopicViewPage } from '../pages/topic-view.page';

test.describe.configure({ mode: 'serial' });

test.describe('Topic Ideation Flow', () => {
  let topicId: string;
  let topicViewPage: TopicViewPage;

  test.beforeAll(async ({ browser }) => {
    const page = await browser.newPage({ storageState: 'e2e/.auth/user.json' });
    page.on('console', msg => console.log('BROWSER CONSOLE:', msg.text()));
    page.on('response', response => {
      if (response.status() === 500) {
        console.log(`500 ERROR METHOD: ${response.request().method()} URL: ${response.url()}`);
      }
    });
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
    await expect(page.locator('cos-step-topic-preview')).toBeVisible();
    const urlParts = page.url().split('/');
    topicId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || '';
    await page.locator('#create_footer .btn_medium_submit').click({ force: true });
    
    // Wait for the invite dialog and close it
    const closeBtn = page.locator('app-topic-invite-dialog .btn_dialog_close');
    await expect(closeBtn).toBeVisible({ timeout: 15000 });
    await closeBtn.click();
    
    await expect(page).toHaveURL(new RegExp(`.*/topics/${topicId}`), { timeout: 15000 });
    await page.close();
  });

  test.beforeEach(async ({ page }) => {
    topicViewPage = new TopicViewPage(page);
    await topicViewPage.goto(topicId);
  });

  test('should render populated ideation state block', async ({ page }) => {
    // Verify the UI shows the populated ideation state block
    await expect(page.locator('.state_item.ideation .item_title_with_description')).toBeVisible({ timeout: 15000 });
    await expect(page.locator('.state_item.ideation .item_title_with_description')).toContainText(/Ideation|Idea/i);
  });
});

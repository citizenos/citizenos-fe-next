import { test, expect } from '../fixtures/test-fixtures';
import { TopicCreatePage } from '../pages/topic-create.page';
import { TopicViewPage } from '../pages/topic-view.page';

test.describe('Topic Creation Flow', () => {
  let topicCreatePage: TopicCreatePage;
  let topicViewPage: TopicViewPage;

  test.beforeEach(async ({ page }) => {
    topicCreatePage = new TopicCreatePage(page);
    topicViewPage = new TopicViewPage(page);
  });

  test('should create a new basic topic', async ({ page }) => {
    // Navigate to create page
    await topicCreatePage.goto();

    // Step 1: Info
    const testTitle = `E2E Test Topic - ${Date.now()}`;
    await topicCreatePage.fillInfo(testTitle, 'This is a test topic created by E2E automation.');
    
    // We expect Etherpad iframe to load
    await page.getByRole('button', { name: /Topic text/i }).click();
    await expect(page.locator('iframe[cosEtherpad]')).toBeVisible({ timeout: 60000 });

    await topicCreatePage.proceedToNextStep(); // Goes to Settings

    // Step 2: Settings (skip defaults)
    await topicCreatePage.proceedToNextStep(); // Goes to Discussion

    // Step 3: Discussion (add a question)
    await topicCreatePage.fillDiscussion('What do you think about E2E tests?');
    await topicCreatePage.proceedToNextStep(); // Goes to Preview

    // Step 4: Preview and Publish
    await topicCreatePage.publish();

    // Wait for navigation back to topic view
    await expect(page).toHaveURL(/.*\/topics\/[a-f0-9-]+/);
    
    // Verify title on the topic view page
    await expect(topicViewPage.topicTitle).toHaveText(testTitle);
  });
});

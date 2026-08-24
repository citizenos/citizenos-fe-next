import { test, expect } from '../fixtures/test-fixtures';
import { GroupCreatePage } from '../pages/group-create.page';
import { GroupsPage } from '../pages/groups.page';

test.describe('Group Detail Flow', () => {
  let groupId: string;
  let groupName: string;

  test.beforeAll(async ({ browser }) => {
    // Create a group for the detail tests
    const page = await browser.newPage({
      storageState: 'e2e/.auth/user.json'
    });
    
    groupName = `Detail Test Group ${Date.now()}`;
    const groupCreatePage = new GroupCreatePage(page);
    await groupCreatePage.goto();
    await groupCreatePage.fillInfo(groupName, 'Testing group details');
    await groupCreatePage.proceedToNextStep();
    await groupCreatePage.proceedToNextStep();
    await groupCreatePage.proceedToNextStep();
    await groupCreatePage.create();

    // Wait for redirect to group view page
    await expect(page).toHaveURL(/.*\/groups\/[a-f0-9-]+/);
    const urlParts = page.url().split('/');
    groupId = urlParts.find(p => /^[a-f0-9-]{36}$/.test(p)) || urlParts.pop() || '';
    await page.close();
  });

  test('should load group details and display name', async ({ page }) => {
    await page.goto(`/en/groups/${groupId}`);
    await expect(page.locator('h1', { hasText: groupName })).toBeVisible();
  });

  test('should have a working members tab', async ({ page }) => {
    await page.goto(`/en/groups/${groupId}`);
    await page.getByRole('tab', { name: /members/i }).click();
    // Assuming the test user is the creator and only member
    // Wait for the container to load the rows. There should be a header row and 1 data row.
    await expect(page.locator('.container .row:not(.header_row)')).toHaveCount(1, { timeout: 15000 });
  });
});

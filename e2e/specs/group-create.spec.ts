import { test, expect } from '../fixtures/test-fixtures';
import { GroupCreatePage } from '../pages/group-create.page';

test.describe('Group Create Flow', () => {
  test('should create a new group successfully', async ({ page }) => {
    // Authenticate using the saved state
    // We already do this globally via auth setup, so we just use the default authenticated context
    
    const groupCreatePage = new GroupCreatePage(page);
    await groupCreatePage.goto();

    const groupName = `E2E Test Group ${Date.now()}`;
    const groupDesc = 'This group is created by Playwright E2E tests';
    
    // Step 1: Info
    await groupCreatePage.fillInfo(groupName, groupDesc);
    await groupCreatePage.proceedToNextStep();

    // Step 2: Settings (skip)
    await groupCreatePage.proceedToNextStep();

    // Step 3: Add Topics (skip)
    await groupCreatePage.proceedToNextStep();

    // Step 4: Invite
    await groupCreatePage.create();

    // Should redirect to group view page
    await expect(page).toHaveURL(/.*\/groups\/[a-f0-9-]+/);
    
    // We should see the group name somewhere on the page
    // Wait for page to load completely by checking group title
    await expect(page.locator('h1', { hasText: groupName })).toBeVisible({ timeout: 15000 });
  });
});

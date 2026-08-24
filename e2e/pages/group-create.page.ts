import { expect, Locator, Page } from '@playwright/test';

export class GroupCreatePage {
  readonly page: Page;
  
  // Navigation
  readonly createGroupTab: Locator;
  
  // Info Step
  readonly groupNameInput: Locator;
  readonly groupDescriptionInput: Locator;
  readonly groupContactInput: Locator;
  readonly continueBtn: Locator;
  readonly createBtn: Locator;

  // Settings Step
  readonly privacyPrivate: Locator;
  readonly privacyPublic: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Using translation keys or generic locators is common if IDs aren't available, but we have some IDs
    this.groupNameInput = page.locator('#groupName');
    this.groupDescriptionInput = page.locator('#groupDescription');
    this.groupContactInput = page.locator('#groupContact');
    
    this.continueBtn = page.getByRole('button', { name: /Continue/i });
    this.createBtn = page.getByRole('button', { name: /Create/i });
  }

  async goto() {
    await this.page.goto('/en/my/groups/create');
    await expect(this.groupNameInput).toBeVisible({ timeout: 15000 });
  }

  async fillInfo(name: string, description: string, contact?: string) {
    await this.groupNameInput.fill(name);
    await this.groupDescriptionInput.fill(description);
    if (contact) {
      await this.groupContactInput.fill(contact);
    }
  }

  async proceedToNextStep() {
    await this.continueBtn.click();
  }

  async create() {
    await this.createBtn.click();
  }
}

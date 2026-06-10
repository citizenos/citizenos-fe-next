import { Locator, Page } from '@playwright/test';

export class InviteDialogPage {
  readonly page: Page;

  readonly userSearchInput: Locator;
  readonly inviteBtn: Locator;
  readonly cancelBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.userSearchInput = page.locator('input#user_search');
    this.inviteBtn = page.locator('.dialog_footer cos-button[variant="primary"] button');
    this.cancelBtn = page.locator('.dialog_footer cos-button[variant="secondary"] button');
  }

  async inviteUser(email: string) {
    await this.userSearchInput.fill(email);
    await this.page.keyboard.press('Enter');
    await this.inviteBtn.click();
  }
}

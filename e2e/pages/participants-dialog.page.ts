import { Locator, Page } from '@playwright/test';

export class ParticipantsDialogPage {
  readonly page: Page;

  readonly tabParticipants: Locator;
  readonly tabGroups: Locator;
  readonly tabInvited: Locator;
  
  readonly memberRows: Locator;
  readonly inviteRows: Locator;
  readonly closeBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.tabParticipants = page.locator('.dialog_tab').nth(0);
    this.tabGroups = page.locator('.dialog_tab').nth(1);
    this.tabInvited = page.locator('.dialog_tab').nth(2);
    
    this.memberRows = page.locator('app-topic-member-user');
    this.inviteRows = page.locator('app-topic-member-invite');
    this.closeBtn = page.locator('button.btn_dialog_close');
  }

  async selectTab(tab: 'participants' | 'groups' | 'invited') {
    if (tab === 'participants') await this.tabParticipants.click();
    else if (tab === 'groups') await this.tabGroups.click();
    else if (tab === 'invited') await this.tabInvited.click();
  }
}

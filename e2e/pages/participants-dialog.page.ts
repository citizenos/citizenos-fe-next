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
    this.memberRows = page.locator('app-topic-member-user');
    this.inviteRows = page.locator('app-topic-member-invite');
    this.closeBtn = page.locator('button.btn_dialog_close');
  }

  async selectTab(tab: 'participants' | 'groups' | 'invited') {
    let text = 'Participants';
    if (tab === 'groups') text = 'Groups';
    else if (tab === 'invited') text = 'Invited';
    
    await this.page.locator('app-topic-participants button.dialog_tab.mobile_hidden')
      .filter({ hasText: new RegExp(text, 'i') })
      .click();
  }
}

import { Locator, Page } from '@playwright/test';

export class TopicViewPage {
  readonly page: Page;
  readonly topicTitle: Locator;
  readonly topicSettingsBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    // Topic title is usually in an h1 with class heading or similar. 
    // The main topic title is rendered in an h1 with class main_heading
    this.topicTitle = page.locator('h1.main_heading');
    this.topicSettingsBtn = page.locator('button').filter({ hasText: 'Settings' });
  }

  async goto(topicId: string) {
    await this.page.goto(`/en/topics/${topicId}`);
  }
}

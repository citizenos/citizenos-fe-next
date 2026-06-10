import { Locator, Page } from '@playwright/test';

export class IdeationCreatePage {
  readonly page: Page;

  // Step 1: Info (shares same locators as TopicCreatePage mostly)
  readonly titleInput: Locator;
  readonly introInput: Locator;

  // Navigation
  readonly continueBtn: Locator;
  readonly publishBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.titleInput = page.locator('#title_input');
    this.introInput = page.locator('#intro_input');
    this.continueBtn = page.locator('.footer-right .btn_medium_submit');
    this.publishBtn = this.continueBtn;
  }

  async goto() {
    await this.page.goto('/en/topics/ideation/create');
  }

  async fillInfo(title: string, intro: string) {
    if (!(await this.titleInput.isVisible())) {
      await this.page.getByRole('button', { name: /Title/i }).click();
    }
    await this.titleInput.fill(title);
    
    if (!(await this.introInput.isVisible())) {
      await this.page.getByRole('button', { name: /Intro/i }).click();
    }
    await this.introInput.fill(intro);
  }

  async proceedToNext() {
    await this.continueBtn.click();
  }
}

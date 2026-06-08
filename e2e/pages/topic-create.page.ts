import { expect, Locator, Page } from '@playwright/test';

export class TopicCreatePage {
  readonly page: Page;

  // Step 1: Info
  readonly titleInput: Locator;
  readonly introInput: Locator;
  
  // Footer
  readonly saveDraftBtn: Locator;
  readonly continueBtn: Locator;
  readonly backBtn: Locator;

  // Step 3: Discussion
  readonly discussionQuestionInput: Locator;

  // Step 4: Preview
  readonly publishBtn: Locator; // This is the continueBtn when on last step

  constructor(page: Page) {
    this.page = page;

    this.titleInput = page.locator('#title_input');
    this.introInput = page.locator('#intro_input');
    
    this.saveDraftBtn = page.locator('.footer-right .btn_medium_secondary');
    this.continueBtn = page.locator('.footer-right .btn_medium_submit');
    this.backBtn = page.locator('.footer-left .btn_medium_submit_ghost');

    this.discussionQuestionInput = page.locator('#discussion_question');
    this.publishBtn = this.continueBtn;
  }

  async goto() {
    await this.page.goto('/en/topics/create');
  }

  async fillInfo(title: string, intro?: string) {
    // The inputs are inside accordion blocks that might be closed.
    if (!(await this.titleInput.isVisible())) {
      await this.page.getByRole('button', { name: /Title/i }).click();
    }
    
    await this.titleInput.waitFor({ state: 'visible' });
    await this.titleInput.fill(title);
    
    if (intro) {
      if (!(await this.introInput.isVisible())) {
        await this.page.getByRole('button', { name: /Intro/i }).click();
      }
      await this.introInput.waitFor({ state: 'visible' });
      await this.introInput.fill(intro);
    }
  }

  async fillDiscussion(question: string) {
    await this.discussionQuestionInput.waitFor({ state: 'visible' });
    await this.discussionQuestionInput.fill(question);
  }

  async proceedToNextStep() {
    await expect(this.continueBtn).not.toBeDisabled();
    await this.continueBtn.click();
  }

  async publish() {
    await expect(this.publishBtn).not.toBeDisabled();
    await this.publishBtn.click();
  }
}

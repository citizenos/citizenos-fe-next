import { Locator, Page } from '@playwright/test';

export class VoteCreatePage {
  readonly page: Page;
  
  // Step: Voting settings
  readonly voteQuestion: Locator;
  readonly voteTypeRegular: Locator;
  readonly voteTypeMultiple: Locator;
  readonly customOptions: Locator;
  readonly addOptionBtn: Locator;
  readonly authTypeSoft: Locator;
  readonly authTypeHard: Locator;
  
  // Navigation
  readonly nextBtn: Locator;
  readonly backBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    this.voteQuestion = page.locator('textarea#voteQuestion');
    this.voteTypeRegular = page.locator('input[type="radio"][value="regular"]');
    this.voteTypeMultiple = page.locator('input[type="radio"][value="multiple"]');
    this.customOptions = page.locator('.custom-options input');
    this.addOptionBtn = page.locator('button').filter({ hasText: /Add option/i });
    this.authTypeSoft = page.locator('input[type="radio"][value="soft"]');
    this.authTypeHard = page.locator('input[type="radio"][value="hard"]');
    
    this.nextBtn = page.locator('button').filter({ hasText: /Next|Continue/i });
    this.backBtn = page.locator('button').filter({ hasText: /Back/i });
  }

  async setupMultipleChoice(question: string, options: string[]) {
    await this.voteQuestion.fill(question);
    await this.voteTypeMultiple.click({ force: true });
    
    // Fill existing inputs
    const count = await this.customOptions.count();
    for (let i = 0; i < Math.min(count, options.length); i++) {
      await this.customOptions.nth(i).fill(options[i]);
    }
    
    // Add more if needed
    for (let i = count; i < options.length; i++) {
      await this.addOptionBtn.click();
      await this.customOptions.last().fill(options[i]);
    }
  }

  async proceedToNext() {
    await this.nextBtn.click();
  }
}

import { Locator, Page } from '@playwright/test';

export class TopicViewPage {
  readonly page: Page;
  readonly topicTitle: Locator;
  readonly topicSettingsBtn: Locator;

  // Tabs
  readonly tabDiscussion: Locator;
  readonly tabIdeation: Locator;
  readonly tabVoting: Locator;
  readonly tabFollowUp: Locator;

  // Arguments
  readonly addArgumentBtn: Locator;
  readonly argumentSubjectInput: Locator;
  readonly argumentTextarea: Locator;
  readonly argumentTypePro: Locator;
  readonly argumentTypeCon: Locator;
  readonly postArgumentBtn: Locator;
  readonly argumentItems: Locator;

  // Voting
  readonly voteOptions: Locator;
  readonly submitVoteBtn: Locator;

  constructor(page: Page) {
    this.page = page;
    
    this.topicTitle = page.locator('h1.main_heading');
    this.topicSettingsBtn = page.locator('button').filter({ hasText: 'Settings' });

    // Tabs
    this.tabDiscussion = page.locator('a.topic_tab.discussion');
    this.tabIdeation = page.locator('a.topic_tab.ideation');
    this.tabVoting = page.locator('a.topic_tab.voting');
    this.tabFollowUp = page.locator('a.topic_tab.follow_up');

    // Arguments
    this.addArgumentBtn = page.locator('button').filter({ hasText: /Add your argument|Start discussion/i }).first();
    this.argumentSubjectInput = page.locator('input#argument_subject');
    this.argumentTextarea = page.locator('textarea#argument_text');
    this.argumentTypePro = page.locator('label').filter({ hasText: /^Pro argument$/i });
    this.argumentTypeCon = page.locator('label').filter({ hasText: /^Con argument$/i });
    this.postArgumentBtn = page.locator('#navigate_create button');
    this.argumentItems = page.locator('cos-argument');

    // Argument interactions
    this.argumentSubject = page.locator('.argument_subject');
    this.argumentBody = page.locator('.argument_body');
    this.voteUpBtn = page.locator('.btn_vote_argument').filter({ has: page.locator('cos-icon[name*="6-legacy"]') }); // Non-selected up
    this.voteDownBtn = page.locator('.btn_vote_argument').filter({ has: page.locator('cos-icon[name*="8-legacy"]') }); // Non-selected down
    this.replyBtn = page.locator('.btn_reply_argument');
    this.argumentActionsBtn = page.locator('.btn_argument_actions');

    // Voting
    this.voteOptions = page.locator('.vote_option.voting');
    this.submitVoteBtn = page.locator('.btn_medium_submit').filter({ hasText: 'Vote' });

    // Ideation
    this.addIdeaBtn = page.locator('app-add-idea button').first();
    this.ideaStatementInput = page.locator('input#idea_statement');
    this.ideaDescriptionTextarea = page.locator('textarea#idea_description');
    this.publishIdeaBtn = page.locator('button').filter({ hasText: /Post idea/i });
    this.ideaItems = page.locator('app-ideabox');
  }

  async goto(topicId: string) {
    await this.page.goto(`/en/topics/${topicId}`);
  }

  async fillMarkdownEditor(textareaLocator: Locator, text: string) {
    // EasyMDE hides the original textarea and creates a sibling .EasyMDEContainer
    // We locate the scrollable CodeMirror area relative to the original textarea's parent.
    const cmScroll = textareaLocator.locator('..').locator('.CodeMirror-scroll').first();
    await cmScroll.click();
    
    // Select all existing text and delete it (in case there's placeholder text or old text)
    await this.page.keyboard.press('Control+A'); // Windows/Linux
    await this.page.keyboard.press('Meta+A'); // Mac
    await this.page.keyboard.press('Backspace');
    
    await this.page.keyboard.type(text);
  }

  async selectTab(tabName: 'discussion' | 'ideation' | 'voting' | 'followUp') {
    switch (tabName) {
      case 'discussion': await this.tabDiscussion.click(); break;
      case 'ideation': await this.tabIdeation.click(); break;
      case 'voting': await this.tabVoting.click(); break;
      case 'followUp': await this.tabFollowUp.click(); break;
    }
  }

  async addArgument(subject: string, text: string, type: 'pro' | 'con' = 'pro') {
    await this.addArgumentBtn.click();
    if (type === 'con') {
      await this.argumentTypeCon.click({ force: true });
    } else {
      await this.argumentTypePro.click({ force: true });
    }
    await this.argumentSubjectInput.fill(subject);
    await this.fillMarkdownEditor(this.argumentTextarea, text);
    await this.postArgumentBtn.click();
  }

  async addIdea(statement: string, description: string) {
    await this.addIdeaBtn.click();
    await this.ideaStatementInput.fill(statement);
    await this.fillMarkdownEditor(this.ideaDescriptionTextarea, description);
    await this.publishIdeaBtn.click();
  }
}


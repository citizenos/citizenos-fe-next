import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { TopicInfoSidebarComponent } from './topic-info-sidebar.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

const BASE_TOPIC: Topic = {
  id: '123', title: 'Topic', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2023-01-01T00:00:00Z', updatedAt: '',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' }, creator: { id: 'c1', name: 'Admin' }, lastActivity: null,
  country: 'EE', language: 'et',
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: '',
  imageUrl: null, authors: [], favourite: false,
};

describe('TopicInfoSidebarComponent', () => {
  let component: TopicInfoSidebarComponent;
  let fixture: ComponentFixture<TopicInfoSidebarComponent>;

  const mockUserStore = { isAuthenticated: vi.fn().mockReturnValue(true) };
  const mockTopicService = {
    STATUSES: { closed: 'closed' },
    canDelete: vi.fn().mockReturnValue(true),
    canEdit: vi.fn().mockReturnValue(true),
    canUpdate: vi.fn().mockReturnValue(true),
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUserStore.isAuthenticated.mockReturnValue(true);
    mockTopicService.canDelete.mockReturnValue(true);
    mockTopicService.canEdit.mockReturnValue(true);

    await TestBed.configureTestingModule({
      imports: [TopicInfoSidebarComponent, TranslateModule.forRoot(), NoopAnimationsModule],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService },
      ],
    })
      .overrideComponent(TopicInfoSidebarComponent, {
        remove: { imports: [IconComponent] },
        add: { imports: [MockIconComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicInfoSidebarComponent);
    component = fixture.componentInstance;

    component.topic.set({ ...BASE_TOPIC });
    component.attachments.set([]);
    component.groups.set([]);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should display creator name', () => {
    const items = fixture.nativeElement.querySelectorAll('.info_item span');
    const texts = Array.from(items).map((el) => (el as HTMLElement).textContent?.trim());
    expect(texts).toContain('Admin');
  });

  it('should display country when set', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('EE');
  });

  it('should display language when set', () => {
    const text = fixture.nativeElement.textContent;
    expect(text).toContain('et');
  });

  it('should show public-topic icon when visibility is public', () => {
    const icons = fixture.nativeElement.querySelectorAll('cos-icon');
    const names = Array.from(icons).map((el) => (el as HTMLElement).getAttribute('name'));
    expect(names).toContain('public-topic');
    expect(names).not.toContain('lock-legacy');
  });

  it('should show lock-legacy icon when visibility is private', () => {
    component.topic.set({ ...BASE_TOPIC, visibility: 'private' });
    fixture.detectChanges();
    const icons = fixture.nativeElement.querySelectorAll('cos-icon');
    const names = Array.from(icons).map((el) => (el as HTMLElement).getAttribute('name'));
    expect(names).toContain('lock-legacy');
    expect(names).not.toContain('public-topic');
  });

  it('should show leave button when user has a permission level and is logged in', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('VIEWS.TOPICS_TOPICID.BTN_LEAVE'))).toBe(true);
  });

  it('should hide leave button when permission level is none', () => {
    component.topic.set({ ...BASE_TOPIC, permission: { level: 'none' } });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('VIEWS.TOPICS_TOPICID.BTN_LEAVE'))).toBe(false);
  });

  it('should show favourite button when logged in', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('VIEWS.TOPICS_TOPICID.OPTION_FAVOURITE'))).toBe(true);
  });

  it('should show favourite-filled icon when topic.favourite is true', () => {
    component.topic.set({ ...BASE_TOPIC, favourite: true });
    fixture.detectChanges();
    const icons = fixture.nativeElement.querySelectorAll('cos-icon');
    const names = Array.from(icons).map((el) => (el as HTMLElement).getAttribute('name'));
    expect(names).toContain('favourite-filled');
    expect(names).not.toContain('favourite');
  });

  it('should show invite co-editor button when user canDelete and topic not closed', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('OPTION_INVITE_CO_EDITOR'))).toBe(true);
  });

  it('should hide invite co-editor button when topic is closed', () => {
    component.topic.set({ ...BASE_TOPIC, status: 'closed' });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('OPTION_INVITE_CO_EDITOR'))).toBe(false);
  });

  it('should show duplicate topic button when user canDelete', () => {
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const labels = Array.from(buttons).map((b) => (b as HTMLElement).textContent);
    expect(labels.some((t: string) => t.includes('OPTION_DUPLICATE_TOPIC'))).toBe(true);
  });

  it('should emit leaveTopic when leave button is clicked', () => {
    const spy = vi.fn();
    component.leaveTopic.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const leaveBtn = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('BTN_LEAVE')) as HTMLElement;
    leaveBtn.click();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
  });

  it('should emit toggleFavourite when favourite button is clicked', () => {
    const spy = vi.fn();
    component.toggleFavourite.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const favBtn = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('OPTION_FAVOURITE')) as HTMLElement;
    favBtn.click();
    expect(spy).toHaveBeenCalledWith(expect.objectContaining({ id: '123' }));
  });

  it('should emit duplicateTopic when duplicate button is clicked', () => {
    const spy = vi.fn();
    component.duplicateTopic.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const btn = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('OPTION_DUPLICATE_TOPIC')) as HTMLElement;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should emit deleteTopic when delete button is clicked', () => {
    const spy = vi.fn();
    component.deleteTopic.subscribe(spy);
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    const btn = Array.from(buttons).find((b) => (b as HTMLElement).textContent?.includes('OPTION_DELETE_TOPIC')) as HTMLElement;
    btn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should toggle showAttachments when attachments header is clicked', () => {
    expect(component.showAttachments).toBe(false);
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const attachmentHeader = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_ATTACHMENTS')) as HTMLElement;
    attachmentHeader.click();
    expect(component.showAttachments).toBe(true);
  });

  it('should show attachments list when attachments section is opened', () => {
    component.attachments.set([{ id: 'att-1', name: 'doc.pdf' }]);
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const header = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_ATTACHMENTS')) as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('doc.pdf');
  });

  it('should show no-attachments message when attachments are empty and section is opened', () => {
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const header = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_ATTACHMENTS')) as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SECTION_INFO_NO_ATTACHMENTS');
  });

  it('should emit downloadAttachment when attachment link is clicked', () => {
    const spy = vi.fn();
    component.downloadAttachment.subscribe(spy);
    const attachment = { id: 'att-1', name: 'doc.pdf' };
    component.attachments.set([attachment]);
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const header = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_ATTACHMENTS')) as HTMLElement;
    header.click();
    fixture.detectChanges();
    const link = fixture.nativeElement.querySelector('a.info_item') as HTMLElement;
    link.click();
    expect(spy).toHaveBeenCalledWith(attachment);
  });

  it('should toggle showGroups when groups header is clicked', () => {
    expect(component.showGroups).toBe(false);
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const groupsHeader = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_GROUPS')) as HTMLElement;
    groupsHeader.click();
    expect(component.showGroups).toBe(true);
  });

  it('should show groups list when groups section is opened', () => {
    component.groups.set([{ id: 'g1', name: 'Test Group' }]);
    fixture.detectChanges();
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const header = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_GROUPS')) as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Test Group');
  });

  it('should show no-groups message when groups are empty and section is opened', () => {
    const headers = fixture.nativeElement.querySelectorAll('.info_title');
    const header = Array.from(headers).find((h) => (h as HTMLElement).textContent?.includes('TITLE_GROUPS')) as HTMLElement;
    header.click();
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('SECTION_INFO_NO_GROUPS');
  });

  it('should hide action buttons when user is not logged in', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);
    component.topic.set({ ...BASE_TOPIC });
    fixture.detectChanges();
    const buttons = fixture.nativeElement.querySelectorAll('button.option');
    expect(buttons.length).toBe(0);
  });
});

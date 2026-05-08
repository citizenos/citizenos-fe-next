import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TopicNotificationSettingsComponent } from './topic-notification-settings.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { TopicNotificationService } from '../../../../../core/services/topic-notification.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { Topic } from '../../../../../core/interfaces/topic';

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'read' },
  creator: {}, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
};

const MOCK_SETTINGS = {
  allowNotifications: true,
  preferences: { Topic: true, Discussion: false, DiscussionComment: false, TopicDiscussion: false,
    CommentVote: false, TopicReport: false, TopicVoteList: false, TopicEvent: false,
    Ideation: false, Idea: false, IdeaVote: false, TopicIdeation: false,
    IdeaComment: false, IdeaReport: false, CommentReport: false }
};

describe('TopicNotificationSettingsComponent', () => {
  let component: TopicNotificationSettingsComponent;
  let fixture: ComponentFixture<TopicNotificationSettingsComponent>;
  const mockTopicNotificationService = {
    get: vi.fn().mockReturnValue(of(MOCK_SETTINGS)),
    update: vi.fn().mockReturnValue(of({})),
    delete: vi.fn().mockReturnValue(of({})),
  };
  const mockTopicService = { get: vi.fn().mockReturnValue(of(MOCK_TOPIC)) };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };
  const mockDialogService = { closeAll: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicNotificationSettingsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topicId: 'topic-1' } },
        { provide: TopicNotificationService, useValue: mockTopicNotificationService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: DialogService, useValue: mockDialogService },
      ],
    })
      .overrideComponent(TopicNotificationSettingsComponent, {
        set: { schemas: [NO_ERRORS_SCHEMA] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicNotificationSettingsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load topic and notification settings on init', () => {
    expect(mockTopicService.get).toHaveBeenCalledWith('topic-1');
    expect(mockTopicNotificationService.get).toHaveBeenCalledWith('topic-1');
  });

  it('should set allowNotifications from loaded settings', () => {
    expect(component.allowNotifications()).toBe(true);
  });

  it('should set preferences from loaded settings', () => {
    expect(component.preferences().Topic).toBe(true);
    expect(component.preferences().Discussion).toBe(false);
  });

  it('allChecked() returns true only when all preferences are true', () => {
    component.preferences.set(Object.fromEntries(Object.keys(component.preferences()).map(k => [k, true])) as any);
    expect(component.allChecked()).toBe(true);
  });

  it('allChecked() returns false when any preference is false', () => {
    expect(component.allChecked()).toBe(false); // Discussion is false
  });

  it('toggleAllNotifications() sets all preferences to true when currently false', () => {
    component.preferences.set(Object.fromEntries(Object.keys(component.preferences()).map(k => [k, false])) as any);
    component.toggleAllNotifications();
    expect(component.allChecked()).toBe(true);
    expect(component.allowNotifications()).toBe(true);
  });

  it('toggleAllNotifications() sets all preferences to false when all are true', () => {
    component.preferences.set(Object.fromEntries(Object.keys(component.preferences()).map(k => [k, true])) as any);
    component.toggleAllNotifications();
    expect(component.allChecked()).toBe(false);
  });

  it('selectOption() toggles a single preference', () => {
    const before = component.preferences().Discussion;
    component.selectOption('Discussion');
    expect(component.preferences().Discussion).toBe(!before);
  });

  it('doSaveSettings() calls delete when allowNotifications is false', () => {
    component.allowNotifications.set(false);
    component.doSaveSettings();
    expect(mockTopicNotificationService.delete).toHaveBeenCalledWith('topic-1');
    expect(mockDialogService.closeAll).toHaveBeenCalled();
  });

  it('doSaveSettings() calls update when allowNotifications is true', () => {
    component.allowNotifications.set(true);
    component.doSaveSettings();
    expect(mockTopicNotificationService.update).toHaveBeenCalledWith('topic-1', expect.objectContaining({
      allowNotifications: true,
      preferences: component.preferences(),
    }));
    expect(mockDialogService.closeAll).toHaveBeenCalled();
  });
});

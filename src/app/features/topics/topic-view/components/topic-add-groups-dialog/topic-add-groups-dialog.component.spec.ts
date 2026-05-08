import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TopicAddGroupsDialogComponent } from './topic-add-groups-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }
@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; @Input() isDisabled = false; }
@Component({ selector: 'cos-dropdown', standalone: true, template: '' })
class MockDropdownComponent {}
@Component({ selector: 'cos-tooltip', standalone: true, template: '' })
class MockTooltipComponent {}

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' },
  creator: {}, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
};

const MOCK_GROUPS = [
  { id: 'g1', name: 'Group 1', visibility: 'public', join: { token: '', level: '' }, description: '', createdAt: '', updatedAt: '', sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' }, creator: {}, lastActivity: null, members: {}, userLevel: 'admin', imageUrl: null, language: null, country: null, categories: null, rules: [], contact: null, inviteMessage: null },
];

describe('TopicAddGroupsDialogComponent', () => {
  let component: TopicAddGroupsDialogComponent;
  let fixture: ComponentFixture<TopicAddGroupsDialogComponent>;
  const mockDialogRef = { close: vi.fn() };
  const mockTopicService = { get: vi.fn().mockReturnValue(of(MOCK_TOPIC)) };
  const mockTopicMemberGroupService = {
    LEVELS: { read: 1, admin: 2 },
    save: vi.fn().mockReturnValue(of({})),
  };
  const mockSearchService = {
    search: vi.fn().mockReturnValue(of({ results: { my: { groups: { rows: MOCK_GROUPS } } } })),
  };
  const mockNotificationService = { success: vi.fn(), error: vi.fn() };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicAddGroupsDialogComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: MOCK_TOPIC } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicMemberGroupService, useValue: mockTopicMemberGroupService },
        { provide: SearchService, useValue: mockSearchService },
        { provide: NotificationService, useValue: mockNotificationService },
      ],
    })
      .overrideComponent(TopicAddGroupsDialogComponent, {
        set: { imports: [TranslateModule, FormsModule, UpperCasePipe, MockIconComponent, MockButtonComponent, MockDropdownComponent, MockTooltipComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicAddGroupsDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should initialise topic from dialog data', () => {
    expect(component.topic().id).toBe('topic-1');
  });

  it('should expose LEVELS from service', () => {
    expect(component.LEVELS).toEqual(['read', 'admin']);
  });

  it('should initialise with empty search results', () => {
    expect(component.searchResults()).toEqual([]);
  });

  it('should initialise with empty selected groups', () => {
    expect(component.selectedGroups()).toEqual([]);
  });

  it('onSearchChange() should not call search for strings shorter than 2 chars', () => {
    component.onSearchChange('a');
    expect(mockSearchService.search).not.toHaveBeenCalled();
    expect(component.searchResults()).toEqual([]);
  });

  it('onSearchChange() should call search and populate results for 2+ char strings', () => {
    component.onSearchChange('te');
    expect(mockSearchService.search).toHaveBeenCalledWith('te', { include: 'my.group', 'my.group.level': 'admin' });
    expect(component.searchResults()).toEqual(MOCK_GROUPS);
  });

  it('onSearchChange() with empty string should clear results', () => {
    component.searchResults.set(MOCK_GROUPS as any);
    component.onSearchChange('');
    expect(component.searchResults()).toEqual([]);
  });
});

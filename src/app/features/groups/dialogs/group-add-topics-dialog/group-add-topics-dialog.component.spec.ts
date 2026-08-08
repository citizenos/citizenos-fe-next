import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupAddTopicsDialogComponent } from './group-add-topics-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { GroupMemberTopicService } from '../../../../core/services/group-member-topic.service';
import { SearchService } from '../../../../core/services/search.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../core/interfaces/topic';

const mockGroup = { id: 'g1', name: 'Test Group', visibility: 'private' };
const mockDialogRef = { close: vi.fn() };
const mockGroupMemberTopicService = { addTopic: vi.fn().mockReturnValue(of({})) };
const mockSearchService = { search: vi.fn().mockReturnValue(of({ results: { my: { topics: { rows: [] } } } })) };

const makeTopic = (overrides: Partial<Topic> = {}): Topic => ({
  id: 't1',
  title: 'T1',
  intro: null,
  description: '',
  status: 'inProgress',
  visibility: 'public',
  hashtag: null,
  join: { token: '', level: 'read' },
  categories: [],
  endsAt: null,
  createdAt: '',
  updatedAt: '',
  sourcePartnerId: null,
  sourcePartnerObjectId: null,
  permission: { level: 'read' },
  creator: { id: 'u1', name: 'User' },
  lastActivity: null,
  country: null,
  language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null,
  discussionId: null,
  comments: null,
  padUrl: null,
  imageUrl: null,
  authors: [],
  ...overrides
});

describe('GroupAddTopicsDialogComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { group: mockGroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: GroupMemberTopicService, useValue: mockGroupMemberTopicService },
        { provide: SearchService, useValue: mockSearchService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => new GroupAddTopicsDialogComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('topicsToAdd starts empty', () => {
    expect(makeComp().topicsToAdd()).toEqual([]);
  });

  it('addTopic adds to topicsToAdd with default level', () => {
    const comp = makeComp();
    comp.addTopic(makeTopic({ id: 't1', title: 'T1' }));
    expect(comp.topicsToAdd().length).toBe(1);
    expect(comp.topicsToAdd()[0].selectedLevel).toBe('read');
  });

  it('addTopic prevents duplicates', () => {
    const comp = makeComp();
    comp.addTopic(makeTopic({ id: 't1', title: 'T1' }));
    comp.addTopic(makeTopic({ id: 't1', title: 'T1' }));
    expect(comp.topicsToAdd().length).toBe(1);
  });

  it('removeTopic removes from topicsToAdd', () => {
    const comp = makeComp();
    const topic = makeTopic({ id: 't1', title: 'T1' });
    comp.addTopic(topic);
    comp.removeTopic({ ...topic, selectedLevel: 'read' } as unknown as Parameters<typeof comp.removeTopic>[0]);
    expect(comp.topicsToAdd()).toEqual([]);
  });

  it('updateLevel changes topic level', () => {
    const comp = makeComp();
    comp.addTopic(makeTopic({ id: 't1', title: 'T1' }));
    const added = comp.topicsToAdd()[0];
    comp.updateLevel(added, 'admin');
    expect(comp.topicsToAdd()[0].selectedLevel).toBe('admin');
  });

  it('save with no topics sets noTopicsSelected', () => {
    const comp = makeComp();
    comp.save();
    expect(comp.noTopicsSelected()).toBe(true);
    expect(mockGroupMemberTopicService.addTopic).not.toHaveBeenCalled();
  });

  it('save with topics calls addTopic and closes dialog', () => {
    const comp = makeComp();
    comp.addTopic(makeTopic({ id: 't1', title: 'T1' }));
    comp.save();
    expect(mockGroupMemberTopicService.addTopic).toHaveBeenCalledWith('g1', 't1', 'read');
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
  });
});

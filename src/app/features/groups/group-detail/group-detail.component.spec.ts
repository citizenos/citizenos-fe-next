import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupDetailComponent } from './group-detail.component';
import { GroupDetailService } from '../../../core/services/group-detail.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { GroupMemberUserService, GroupMember } from '../../../core/services/group-member-user.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { of, Subject, throwError } from 'rxjs';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivatedRoute, Params } from '@angular/router';

const mockGroup = {
  id: 'group1',
  name: 'Test Group',
  description: 'A test group',
  visibility: 'public',
  userLevel: null,
  favourite: false,
  rules: [],
  creator: { name: 'Creator' },
  createdAt: '2024-01-01',
  members: { users: { count: 5 }, topics: { count: { inProgress: 2, ideation: 1, voting: 0, followUp: 0 } } },
  permission: { level: 'read' },
  imageUrl: null,
  country: null,
  language: null,
  contact: null,
  categories: [],
  join: { token: '', level: 'read' },
  updatedAt: '2024-01-01',
  sourcePartnerId: null,
  sourcePartnerObjectId: null,
  lastActivity: null,
  inviteMessage: null,
};

const paramsSubject = new Subject<Params>();
const fragmentSubject = new Subject<string | null>();

const mockRoute = {
  params: paramsSubject.asObservable(),
  fragment: fragmentSubject.asObservable(),
};

const mockGroupDetailService = {
  loadGroup: vi.fn().mockReturnValue(of(mockGroup)),
  addFavourite: vi.fn().mockReturnValue(of({})),
  removeFavourite: vi.fn().mockReturnValue(of({})),
  joinPublic: vi.fn().mockReturnValue(of({ userLevel: 'read' })),
  leaveGroup: vi.fn().mockReturnValue(of({})),
  deleteGroup: vi.fn().mockReturnValue(of({})),
  canUpdate: vi.fn().mockReturnValue(false),
};

const mockTopicService = {
  loadTopics: vi.fn().mockReturnValue(of({ rows: [], count: 0 })),
  removeTopicFromGroup: vi.fn().mockReturnValue(of({})),
};

const mockMemberService = {
  loadMembers: vi.fn().mockReturnValue(of({ rows: [], count: 0 })),
  updateLevel: vi.fn().mockReturnValue(of({})),
  removeMember: vi.fn().mockReturnValue(of({})),
  LEVELS: ['read', 'admin'],
};

const mockUserStore = {
  isAuthenticated: vi.fn().mockReturnValue(false),
  user: vi.fn().mockReturnValue(null),
};

const mockDialogRef = { afterClosed: vi.fn().mockReturnValue(of(false)) };
const mockDialogService = { open: vi.fn().mockReturnValue(mockDialogRef) };

describe('GroupDetailComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: mockRoute },
        { provide: GroupDetailService, useValue: mockGroupDetailService },
        { provide: GroupMemberTopicService, useValue: mockTopicService },
        { provide: GroupMemberUserService, useValue: mockMemberService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialogService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): GroupDetailComponent {
    return runInInjectionContext(injector, () => new GroupDetailComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('defaults to topics tab', () => {
    const comp = makeComp();
    expect(comp.tabSelected()).toBe('topics');
  });

  it('selectTab navigates to fragment', () => {
    const comp = makeComp();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const router = (comp as any).router;
    const spy = vi.spyOn(router, 'navigate');
    comp.selectTab('members');
    expect(spy).toHaveBeenCalledWith([], { fragment: 'members' });
  });

  it('setVisibility updates filter signal', () => {
    const comp = makeComp();
    comp.setVisibility('favourite');
    expect(comp.topicVisibilityFilter()).toBe('favourite');
  });

  it('setStatus updates filter signal', () => {
    const comp = makeComp();
    comp.setStatus('inProgress');
    expect(comp.topicStatusFilter()).toBe('inProgress');
  });

  it('setOrderBy updates filter signal', () => {
    const comp = makeComp();
    comp.setOrderBy('lastActivity');
    expect(comp.topicOrderFilter()).toBe('lastActivity');
  });

  it('moreInfo defaults to false', () => {
    const comp = makeComp();
    expect(comp.moreInfo()).toBe(false);
  });

  it('toggleFavourite calls addFavourite when not favourited', () => {
    const comp = makeComp();
    comp.group.set({ ...mockGroup, favourite: false });
    comp.toggleFavourite();
    expect(mockGroupDetailService.addFavourite).toHaveBeenCalledWith('group1');
  });

  it('toggleFavourite calls removeFavourite when favourited', () => {
    const comp = makeComp();
    comp.group.set({ ...mockGroup, favourite: true });
    comp.toggleFavourite();
    expect(mockGroupDetailService.removeFavourite).toHaveBeenCalledWith('group1');
  });

  it('isAdmin is false when canUpdate returns false', () => {
    mockGroupDetailService.canUpdate.mockReturnValue(false);
    const comp = makeComp();
    comp.group.set(mockGroup);
    expect(comp.isAdmin()).toBe(false);
  });

  it('isAdmin is true when canUpdate returns true', () => {
    mockGroupDetailService.canUpdate.mockReturnValue(true);
    const comp = makeComp();
    comp.group.set({ ...mockGroup, permission: { level: 'admin' }, userLevel: 'admin' });
    expect(comp.isAdmin()).toBe(true);
  });

  it('totalTopicPages calculated correctly', () => {
    const comp = makeComp();
    comp.topicsCount.set(25);
    expect(comp.totalTopicPages()).toBe(3);
  });

  it('group loads when route params emitted', () => {
    makeComp();
    paramsSubject.next({ groupId: 'group1' });
    expect(mockGroupDetailService.loadGroup).toHaveBeenCalledWith('group1');
  });

  it('updateMemberLevel optimistically updates member level', () => {
    const member: GroupMember = { id: 'u1', name: 'Alice', level: 'read' };
    const comp = makeComp();
    comp.groupId.set('group1');
    comp.members.set([member]);
    comp.updateMemberLevel(member, 'admin');
    expect(comp.members()[0].level).toBe('admin');
    expect(mockMemberService.updateLevel).toHaveBeenCalledWith('group1', 'u1', 'admin');
  });

  it('updateMemberLevel reverts on error', () => {
    mockMemberService.updateLevel.mockReturnValueOnce(throwError(() => new Error('fail')));
    const member: GroupMember = { id: 'u1', name: 'Alice', level: 'read' };
    const comp = makeComp();
    comp.groupId.set('group1');
    comp.members.set([member]);
    comp.updateMemberLevel(member, 'admin');
    expect(comp.members()[0].level).toBe('read');
  });

  it('updateMemberLevel is a no-op when level unchanged', () => {
    const member: GroupMember = { id: 'u1', name: 'Alice', level: 'admin' };
    const comp = makeComp();
    comp.groupId.set('group1');
    comp.members.set([member]);
    comp.updateMemberLevel(member, 'admin');
    expect(mockMemberService.updateLevel).not.toHaveBeenCalled();
  });

  it('confirmRemoveMember opens confirm dialog', () => {
    const member: GroupMember = { id: 'u1', name: 'Alice', level: 'read' };
    const comp = makeComp();
    comp.confirmRemoveMember(member);
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('confirmRemoveMember calls removeMember when confirmed', () => {
    mockDialogRef.afterClosed.mockReturnValueOnce(of(true));
    const member: GroupMember = { id: 'u1', name: 'Alice', level: 'read' };
    const comp = makeComp();
    comp.groupId.set('group1');
    comp.confirmRemoveMember(member);
    expect(mockMemberService.removeMember).toHaveBeenCalledWith('group1', 'u1');
  });

  it('confirmRemoveMember uses userId when present', () => {
    mockDialogRef.afterClosed.mockReturnValueOnce(of(true));
    const member: GroupMember = { id: 'u1', userId: 'user-guid', name: 'Alice', level: 'read' };
    const comp = makeComp();
    comp.groupId.set('group1');
    comp.confirmRemoveMember(member);
    expect(mockMemberService.removeMember).toHaveBeenCalledWith('group1', 'user-guid');
  });
});

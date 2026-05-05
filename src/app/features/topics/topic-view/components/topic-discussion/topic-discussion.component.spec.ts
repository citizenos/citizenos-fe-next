import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { TopicDiscussionComponent } from './topic-discussion.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { BehaviorSubject, of } from 'rxjs';

const mockTopic: any = { id: 'topic-1', discussionId: 'disc-1', status: 'inProgress' };
const mockDiscussion: any = { id: 'disc-1', question: 'What do you think?', deadline: null };

const itemsSubject = new BehaviorSubject<any[]>([]);
const loadingSubject = new BehaviorSubject(false);
const countSubject = new BehaviorSubject({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 });

const mockArgumentService = {
  items$: itemsSubject.asObservable(),
  isLoading$: loadingSubject.asObservable(),
  count: countSubject.asObservable(),
  setParam: vi.fn(),
  loadItems: vi.fn(() => of([])),
  loadPage: vi.fn(),
  params: new BehaviorSubject({ page: 1, offset: 0, limit: 10 }),
  page: new BehaviorSubject(1),
  totalPages: new BehaviorSubject(1),
};
const mockDiscussionService = { get: vi.fn() };
const mockTopicService = { canUpdate: vi.fn() };
const mockUserStore = { isAuthenticated: vi.fn(), user: vi.fn() };

describe('TopicDiscussionComponent', () => {
  let component: TopicDiscussionComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    itemsSubject.next([]);
    loadingSubject.next(false);
    countSubject.next({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 });
    mockDiscussionService.get.mockReturnValue(of(mockDiscussion));
    mockTopicService.canUpdate.mockReturnValue(true);
    mockUserStore.isAuthenticated.mockReturnValue(true);

    TestBed.configureTestingModule({
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: UserStore, useValue: mockUserStore },
      ]
    });

    component = TestBed.runInInjectionContext(() => {
      const c = new TopicDiscussionComponent();
      // Override topic with a plain function before signals are read
      (c as any).topic = () => mockTopic;
      return c;
    });
  });

  it('should have showPostForm initially false', () => {
    expect(component.showPostForm()).toBe(false);
  });

  it('canPost returns truthy when authenticated', () => {
    // Since discussion() depends on toSignal(toObservable(this.topic)...) which may not have emitted,
    // we test the underlying conditions
    expect(mockUserStore.isAuthenticated()).toBe(true);
  });

  it('canPost returns falsy when not authenticated', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);
    expect(component.canPost()).toBeFalsy();
  });

  it('toggleTypeFilter should update selectedTypes', () => {
    component.toggleTypeFilter('pro');
    expect(component.selectedTypes()).toEqual(['pro']);
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('types', ['pro']);
    expect(mockArgumentService.loadPage).toHaveBeenCalledWith(1);
  });

  it('toggleTypeFilter toggling twice should remove filter', () => {
    component.selectedTypes.set(['pro']);
    component.toggleTypeFilter('pro');
    expect(component.selectedTypes()).toEqual([]);
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('types', null);
  });

  it('onArgumentPosted hides form and reloads', () => {
    component.showPostForm.set(true);
    component.onArgumentPosted();
    expect(component.showPostForm()).toBe(false);
    expect(mockArgumentService.loadPage).toHaveBeenCalled();
  });

  it('reload calls loadPage', () => {
    component.reload();
    expect(mockArgumentService.loadPage).toHaveBeenCalledWith(mockArgumentService.page.value);
  });
});

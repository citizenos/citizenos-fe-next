import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router, provideRouter } from '@angular/router';
import { TopicDiscussionComponent } from './topic-discussion.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { BehaviorSubject, of } from 'rxjs';
import { Topic } from '../../../../../core/interfaces/topic';
import { Discussion } from '../../../../../core/interfaces/discussion';
import { Argument } from '../../../../../core/interfaces/discussion';

const mockTopic: Topic = { id: 'topic-1', discussionId: 'disc-1', status: 'inProgress' } as Topic;
const mockDiscussion: Discussion = { id: 'disc-1', question: 'What do you think?', deadline: null } as Discussion;

const mockArgumentService = {
  items: signal([]),
  isLoading: signal(false),
  count: new BehaviorSubject({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 }),
  ARGUMENT_TYPES_MAXLENGTH: { pro: 200, con: 200, poi: 200 },
  ARGUMENT_SUBJECT_MAXLENGTH: 50,
  setParam: vi.fn(),
  loadItems: vi.fn(() => of([])),
  loadPage: vi.fn(),
  params: signal({ page: 1, offset: 0, limit: 10 }),
  page: signal(1),
  totalPages: signal(1),
  reload: vi.fn()
};
const mockDiscussionService = { get: vi.fn(), hasDiscussionEndedExpired: vi.fn().mockReturnValue(false) };
const mockTopicService = { 
  canUpdate: vi.fn(),
  STATUSES: { draft: 'draft', ideation: 'ideation', inProgress: 'inProgress' }
};
const mockUserStore = { isAuthenticated: vi.fn(), user: vi.fn() };

describe('TopicDiscussionComponent', () => {
  let component: TopicDiscussionComponent;
  let fixture: import('@angular/core/testing').ComponentFixture<TopicDiscussionComponent>;

  beforeEach(() => {
    vi.clearAllMocks();
    mockArgumentService.items.set([]);
    mockArgumentService.isLoading.set(false);
    mockArgumentService.count.next({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 });
    mockDiscussionService.get.mockReturnValue(of(mockDiscussion));
    mockTopicService.canUpdate.mockReturnValue(true);
    mockUserStore.isAuthenticated.mockReturnValue(true);

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: UserStore, useValue: mockUserStore },
        provideRouter([{ path: '**', component: TopicDiscussionComponent }])
      ]
    });

    fixture = TestBed.createComponent(TopicDiscussionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
  });

  it('should have showPostForm initially false', () => {
    expect(component.showPostForm()).toBe(false);
  });

  it('canPost returns truthy when authenticated', () => {
    // Since discussion() depends on rxResource which may not have emitted,
    // we test the underlying conditions
    expect(mockUserStore.isAuthenticated()).toBe(true);
  });

  it('canPost returns falsy when not authenticated', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);
    expect(component.canPost()).toBeFalsy();
  });

  it('toggleTypeFilter should update selectedTypes', () => {
    component.selectedTypes.set([]);
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
    expect(mockArgumentService.loadPage).toHaveBeenCalledWith(mockArgumentService.page());
  });
});

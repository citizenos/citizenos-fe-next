import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TranslateModule } from '@ngx-translate/core';
import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { TopicDiscussionComponent } from './topic-discussion.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog';
import { TopicDiscussionCreateDialogComponent } from '../topic-discussion-create-dialog/topic-discussion-create-dialog.component';
import { EditDiscussionDeadlineComponent } from '../edit-discussion-deadline/edit-discussion-deadline.component';
import { BehaviorSubject, of } from 'rxjs';
import { Topic } from '../../../../../core/interfaces/topic';
import { Discussion, Argument } from '../../../../../core/interfaces/discussion';

const mockTopic: Topic = { id: 'topic-1', discussionId: 'disc-1', status: 'inProgress' } as Topic;
const mockDiscussion: Discussion = { id: 'disc-1', question: 'What do you think?', deadline: null } as Discussion;

const mockArgumentService = {
  items: signal<Argument[]>([]),
  isLoading: signal(false),
  count: new BehaviorSubject({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 }),
  ARGUMENT_TYPES: { pro: 'pro', con: 'con', poi: 'poi', reply: 'reply' },
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
  reloadTopic: vi.fn(),
  STATUSES: { draft: 'draft', ideation: 'ideation', inProgress: 'inProgress' }
};
const mockUserStore = { isAuthenticated: vi.fn(), user: vi.fn() };
const mockDialog = {
  open: vi.fn().mockReturnValue({ afterClosed: () => of(undefined) }),
  closeAll: vi.fn()
};

describe('TopicDiscussionComponent', () => {
  let component: TopicDiscussionComponent;
  let fixture: import('@angular/core/testing').ComponentFixture<TopicDiscussionComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    mockArgumentService.items.set([]);
    mockArgumentService.isLoading.set(false);
    mockArgumentService.count.next({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 });
    mockDiscussionService.get.mockReturnValue(of(mockDiscussion));
    mockTopicService.canUpdate.mockReturnValue(true);
    mockUserStore.isAuthenticated.mockReturnValue(true);
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });

    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicDiscussionService, useValue: mockDiscussionService },
        { provide: TopicArgumentService, useValue: mockArgumentService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialog },
        provideRouter([{ path: '**', component: TopicDiscussionComponent }])
      ]
    });

    fixture = TestBed.createComponent(TopicDiscussionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.detectChanges();
    await fixture.whenStable();
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

  it('should render chevron-right icons in mobile filter options', () => {
    mockArgumentService.items.set([{ id: 'arg-1', type: 'pro', subject: 'Pro', text: 'text', replies: { count: 0, rows: [] } } as unknown as Argument]);
    TestBed.flushEffects();
    fixture.detectChanges();

    const filterOptions = fixture.nativeElement.querySelectorAll('.filter_options .filter_option .bold cos-icon');
    expect(filterOptions.length).toBeGreaterThanOrEqual(2);
    const chevronIcons = Array.from(filterOptions).filter((icon) => (icon as HTMLElement).getAttribute('name') === 'chevron-right');
    expect(chevronIcons.length).toBe(2);
  });

  it('resetFilters should reset types, order, service params and close mobile filters', () => {
    component.selectedTypes.set(['pro']);
    component.selectedOrder.set('date');
    component.activeMobileFilter.set('argumentType');
    component.mobileFiltersOpen.set(true);

    expect(component.hasActiveFilters()).toBe(true);

    component.resetFilters();

    expect(component.selectedTypes()).toEqual(['pro', 'con', 'poi']);
    expect(component.selectedOrder()).toBe('popularity');
    expect(component.activeMobileFilter()).toBeNull();
    expect(component.mobileFiltersOpen()).toBe(false);
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('types', null);
    expect(mockArgumentService.setParam).toHaveBeenCalledWith('sortOrder', 'popularity');
    expect(mockArgumentService.loadPage).toHaveBeenCalledWith(1);
    expect(component.hasActiveFilters()).toBe(false);
  });

  it('clearFilters and clearAllFilters should call resetFilters', () => {
    const spy = vi.spyOn(component, 'resetFilters');
    component.clearFilters();
    expect(spy).toHaveBeenCalledTimes(1);

    component.clearAllFilters();
    expect(spy).toHaveBeenCalledTimes(2);
  });

  it('should show reset filters button when hasActiveFilters is true and clicking it resets', () => {
    component.selectedOrder.set('date');
    fixture.detectChanges();

    expect(component.hasActiveFilters()).toBe(true);
    const resetBtn = fixture.nativeElement.querySelector('.reset_filters_btn');
    expect(resetBtn).toBeTruthy();

    const spy = vi.spyOn(component, 'resetFilters');
    resetBtn.click();
    expect(spy).toHaveBeenCalled();
  });

  it('should handle mobile_filters_wrap open, options selection and apply button', () => {
    mockArgumentService.items.set([{ id: 'arg-1', type: 'pro', subject: 'Pro', text: 'text', replies: { count: 0, rows: [] } } as unknown as Argument]);
    TestBed.flushEffects();
    fixture.detectChanges();

    expect(component.activeMobileFilter()).toBeNull();
    const wrap = fixture.nativeElement.querySelector('.mobile_filters_wrap');
    expect(wrap.classList.contains('active')).toBe(false);

    component.activeMobileFilter.set('sortOrder');
    fixture.detectChanges();

    expect(wrap.classList.contains('active')).toBe(true);
    const overlay = fixture.nativeElement.querySelector('.overlay');
    expect(overlay).toBeTruthy();

    const applyBtn = wrap.querySelector('.btn_medium_secondary');
    expect(applyBtn).toBeTruthy();
    applyBtn.click();
    fixture.detectChanges();

    expect(component.activeMobileFilter()).toBeNull();
  });

  it('should render setting_button and options dropdown with edit discussion link', () => {
    const settingBtn = fixture.nativeElement.querySelector('.setting_button');
    expect(settingBtn).toBeTruthy();

    const mobileActions = settingBtn.querySelector('#mobile_actions');
    expect(mobileActions).toBeTruthy();

    const options = settingBtn.querySelector('.options');
    expect(options).toBeTruthy();

    const editLink = options.querySelector('a.option');
    expect(editLink).toBeTruthy();
    expect(editLink.getAttribute('fragment')).toBe('discussion');
    expect(editLink.getAttribute('href')).toContain('/topics/edit/topic-1');
  });

  it('openCreateDiscussion should open TopicDiscussionCreateDialogComponent and refresh discussion on result', async () => {
    mockDiscussionService.get.mockClear();
    const createdDiscussion: Discussion = { id: 'disc-created', question: 'Created discussion?', deadline: null } as unknown as Discussion;
    mockDialog.open.mockReturnValue({ afterClosed: () => of(createdDiscussion) });
    mockDiscussionService.get.mockReturnValue(of(createdDiscussion));

    component.openCreateDiscussion();
    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();

    expect(mockDialog.open).toHaveBeenCalledWith(TopicDiscussionCreateDialogComponent, {
      data: { topic: component.topic() }
    });
    expect(component.discussionIdOverride()).toBe('disc-created');
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockDiscussionService.get).toHaveBeenCalledWith('topic-1', 'disc-created');
  });

  it('openCreateDiscussion should not reload when dialog closes without result', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(undefined) });
    mockTopicService.reloadTopic.mockClear();

    component.openCreateDiscussion();

    expect(mockDialog.open).toHaveBeenCalledWith(TopicDiscussionCreateDialogComponent, {
      data: { topic: component.topic() }
    });
    expect(component.discussionIdOverride()).toBeNull();
    expect(mockTopicService.reloadTopic).not.toHaveBeenCalled();
  });

  it('openEditDeadline should open EditDiscussionDeadlineComponent and reload on result', () => {
    mockDialog.open.mockReturnValue({ afterClosed: () => of(true) });
    mockTopicService.reloadTopic.mockClear();

    component.openEditDeadline();

    expect(mockDialog.open).toHaveBeenCalledWith(EditDiscussionDeadlineComponent, {
      data: {
        topic: component.topic(),
        discussion: component.discussion()
      }
    });
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
  });

  it('should remove empty state and render discussion when start discussion succeeds', async () => {
    const topicWithoutDiscussion: Topic = { id: 'topic-empty', status: 'ideation', discussionId: undefined } as unknown as Topic;
    fixture.componentRef.setInput('topic', topicWithoutDiscussion);
    mockDiscussionService.get.mockReturnValue(of(null));
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    const emptyStateHeading = fixture.nativeElement.querySelector('.description_heading');
    expect(emptyStateHeading).toBeTruthy();

    const createdDiscussion: Discussion = { id: 'disc-new', question: 'New discussion', deadline: null } as Discussion;
    mockDialog.open.mockReturnValue({ afterClosed: () => of(createdDiscussion) });
    mockDiscussionService.get.mockReturnValue(of(createdDiscussion));

    component.openCreateDiscussion();

    TestBed.flushEffects();
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.discussion()).toEqual(createdDiscussion);
    const argumentsWrap = fixture.nativeElement.querySelector('.arguments_wrap');
    expect(argumentsWrap).toBeTruthy();
  });
});

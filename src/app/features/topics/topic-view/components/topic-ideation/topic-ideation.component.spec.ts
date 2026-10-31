import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TopicIdeationComponent } from './topic-ideation.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { AuthDialogService } from '../../../../../core/services/auth-dialog.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation, IdeaVoter } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { signal } from '@angular/core';

const mockTopic = { id: 't1', status: 'ideation' } as unknown as Topic;
const mockIdeation = { id: 'i1', question: 'What should we do?', deadline: null } as unknown as Ideation;
const mockIdea1 = { id: 'a1', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as unknown as Idea;
const mockIdea2 = { id: 'a2', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as unknown as Idea;

const mockIdeationService = {
  getIdeas: vi.fn().mockReturnValue(of({ rows: [mockIdea1, mockIdea2], count: 2 })),
  update: vi.fn().mockReturnValue(of({})),
  downloadIdeas: vi.fn().mockReturnValue('https://example.com/download'),
  hasIdeationEndedExpired: vi.fn().mockReturnValue(false),
  hasIdeationEnded: vi.fn().mockReturnValue(false),
  STATUSES: { draft: 'draft', ideation: 'ideation' },
};
const mockTopicService = {
  canUpdate: vi.fn().mockReturnValue(true),
  canEdit: vi.fn().mockReturnValue(true),
  reloadTopic: vi.fn(),
  STATUSES: { draft: 'draft', ideation: 'ideation', inProgress: 'inProgress' },
};
const mockUserStore = { user: vi.fn().mockReturnValue({ id: 'u1' }) };
const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };
const mockAuthDialogService = { openLogin: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };

describe('TopicIdeationComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterModule.forRoot([])],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialogService },
        { provide: AuthDialogService, useValue: mockAuthDialogService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(ideationOverride?: Partial<Ideation>, topicOverride?: Partial<Topic>) {
    return runInInjectionContext(injector, () => {
      const comp = new TopicIdeationComponent();
      (comp as unknown as { topic: unknown }).topic = signal({ ...mockTopic, ...topicOverride });
      (comp as unknown as { ideation: unknown }).ideation = signal({ ...mockIdeation, ...ideationOverride });
      TestBed.flushEffects();
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('loads ideas on init', () => {
    const comp = makeComp();
    expect(mockIdeationService.getIdeas).toHaveBeenCalledWith(expect.objectContaining({ topicId: 't1', ideationId: 'i1' }));
    expect(comp.ideas().length).toBe(2);
    expect(comp.ideasCount()).toBe(2);
  });

  it('canUpdate delegates to topicService', () => {
    const comp = makeComp();
    expect(comp.canUpdate()).toBe(true);
    expect(mockTopicService.canUpdate).toHaveBeenCalledWith(mockTopic);
  });

  it('canEdit delegates to topicService', () => {
    const comp = makeComp();
    expect(comp.canEdit()).toBe(true);
  });

  it('setOrder updates selectedOrder and resets page', () => {
    const comp = makeComp();
    comp.orderBy('rating');
    expect(comp.selectedOrder()).toBe('rating');
    expect(comp.currentPage()).toBe(1);
  });

  it('setType updates selectedType', () => {
    const comp = makeComp();
    comp.setType('favourite');
    expect(comp.selectedType()).toBe('favourite');
  });

  it('onPageChange updates currentPage', () => {
    const comp = makeComp();
    comp.onPageChange(3);
    expect(comp.currentPage()).toBe(3);
  });

  it('onIdeaDeleted triggers a server refresh', () => {
    const comp = makeComp();
    const callsBefore = mockIdeationService.getIdeas.mock.calls.length;
    comp.onIdeaDeleted(mockIdea1);
    TestBed.flushEffects();
    expect(mockIdeationService.getIdeas.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('onIdeaUpdated triggers a server refresh', () => {
    const comp = makeComp();
    const callsBefore = mockIdeationService.getIdeas.mock.calls.length;
    comp.onIdeaUpdated(mockIdea1);
    TestBed.flushEffects();
    expect(mockIdeationService.getIdeas.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('onIdeaAdded hides add form and reloads', () => {
    const comp = makeComp();
    comp.showAddIdea.set(true);
    comp.currentPage.set(3);
    const callsBefore = mockIdeationService.getIdeas.mock.calls.length;

    comp.onIdeaAdded({ id: 'new' } as Idea);
    TestBed.flushEffects();

    expect(comp.showAddIdea()).toBe(false);
    expect(comp.currentPage()).toBe(1);
    expect(mockIdeationService.getIdeas.mock.calls.length).toBeGreaterThan(callsBefore);
  });

  it('exportIdeas opens download URL', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const comp = makeComp();
    comp.exportIdeas();
    expect(mockIdeationService.downloadIdeas).toHaveBeenCalledWith('t1', 'i1');
    expect(openSpy).toHaveBeenCalledWith('https://example.com/download');
  });

  it('addIdea opens login dialog when unauthenticated and opens form on login', () => {
    const userStore = TestBed.inject(UserStore);
    userStore.isAuthenticated = Object.assign(() => false, { [Symbol("SIGNAL")]: {} }) as unknown as InstanceType<typeof UserStore>['isAuthenticated'];
    const comp = makeComp();
    comp.addIdea();
    expect(mockAuthDialogService.openLogin).toHaveBeenCalled();
    expect(comp.showAddIdea()).toBe(true);
  });

  it('addIdea opens form directly when authenticated', () => {
    const userStore = TestBed.inject(UserStore);
    userStore.isAuthenticated = Object.assign(() => true, { [Symbol("SIGNAL")]: {} }) as unknown as InstanceType<typeof UserStore>['isAuthenticated'];
    const comp = makeComp();
    comp.showAddIdea.set(false);
    comp.addIdea();
    expect(mockAuthDialogService.openLogin).not.toHaveBeenCalled();
    expect(comp.showAddIdea()).toBe(true);
  });

  it('addIdea does not open form when ideation has ended', () => {
    mockIdeationService.hasIdeationEnded.mockReturnValue(true);
    const comp = makeComp();
    comp.showAddIdea.set(false);
    comp.addIdea();
    expect(comp.showAddIdea()).toBe(false);
  });

  it('hasIdeationEnded and hasIdeationEndedExpired delegate to ideationService and block addIdea when deadline has passed', () => {
    mockIdeationService.hasIdeationEnded.mockReturnValue(true);
    mockIdeationService.hasIdeationEndedExpired.mockReturnValue(true);
    const pastDeadline = new Date(Date.now() - 3600000).toISOString();
    const comp = makeComp({ deadline: pastDeadline });

    expect(comp.hasIdeationEnded()).toBe(true);
    expect(comp.hasIdeationEndedExpired()).toBe(true);
    expect(mockIdeationService.hasIdeationEnded).toHaveBeenCalledWith(comp.topic(), comp.ideation());
    expect(mockIdeationService.hasIdeationEndedExpired).toHaveBeenCalledWith(comp.topic(), comp.ideation());

    comp.showAddIdea.set(false);
    comp.addIdea();
    expect(comp.showAddIdea()).toBe(false);
  });

  it('toggleMobileFilters toggles mobileFiltersOpen signal', () => {
    const comp = makeComp();
    expect(comp.mobileFiltersOpen()).toBe(false);
    comp.toggleMobileFilters();
    expect(comp.mobileFiltersOpen()).toBe(true);
    comp.toggleMobileFilters();
    expect(comp.mobileFiltersOpen()).toBe(false);
  });

  it('openMobileFilter and closeMobileFilter update activeMobileFilter', () => {
    const comp = makeComp();
    expect(comp.activeMobileFilter()).toBe(null);
    expect(comp.showMobileOverlay()).toBe(false);

    comp.openMobileFilter('type');
    expect(comp.activeMobileFilter()).toBe('type');
    expect(comp.showMobileOverlay()).toBe(true);

    comp.openMobileFilter('order');
    expect(comp.activeMobileFilter()).toBe('order');

    comp.openMobileFilter('participants');
    expect(comp.activeMobileFilter()).toBe('participants');

    comp.closeMobileFilter();
    expect(comp.activeMobileFilter()).toBe(null);
    expect(comp.showMobileOverlay()).toBe(false);
  });

  it('activeTypeLabel, activeOrderLabel, and activeParticipantLabel reflect current selection', () => {
    const comp = makeComp();
    expect(comp.activeTypeLabel).toBeTruthy();
    expect(comp.activeOrderLabel).toBeTruthy();

    comp.setType('favourite');
    expect(comp.selectedType()).toBe('favourite');
    expect(comp.activeTypeLabel).toBeTruthy();

    comp.orderBy('likes');
    expect(comp.selectedOrder()).toBe('likes');
    expect(comp.activeOrderLabel).toBeTruthy();

    comp.setParticipant({ id: 'u1', name: 'Alice' } as unknown as IdeaVoter);
    expect(comp.selectedParticipants()?.name).toBe('Alice');
    expect(comp.activeParticipantLabel).toBe('Alice');
  });

  it('clearAllFilters resets all filters and page to default', () => {
    const comp = makeComp();
    comp.setType('favourite');
    comp.orderBy('likes');
    comp.setParticipant({ id: 'u1', name: 'Alice' } as unknown as IdeaVoter);
    comp.setAge(25);
    comp.setGender('female');
    comp.setResidence('Tallinn');
    comp.setSearch('my idea');
    comp.currentPage.set(4);

    expect(comp.filtersSet()).toBe(true);

    comp.clearAllFilters();

    expect(comp.selectedType()).toBe('');
    expect(comp.selectedOrder()).toBe('');
    expect(comp.selectedParticipants()).toBe(null);
    expect(comp.selectedAge()).toEqual([]);
    expect(comp.selectedGender()).toBe('');
    expect(comp.selectedResidence()).toBe('');
    expect(comp.searchValue()).toBe('');
    expect(comp.currentPage()).toBe(1);
  });

  it('openSearch and closeSearch toggle showSearch signal', () => {
    const comp = makeComp();
    expect(comp.showSearch()).toBe(false);

    comp.openSearch();
    expect(comp.showSearch()).toBe(true);

    comp.closeSearch();
    expect(comp.showSearch()).toBe(false);
  });

  it('setSearch updates searchValue and resets page', () => {
    const comp = makeComp();
    comp.currentPage.set(3);
    comp.setSearch('sustainability');
    expect(comp.searchValue()).toBe('sustainability');
    expect(comp.currentPage()).toBe(1);
  });
});

import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TopicIdeationComponent } from './topic-ideation.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { AuthDialogService } from '../../../../../core/services/auth-dialog.service';
import { of, BehaviorSubject } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule, ActivatedRoute } from '@angular/router';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation, IdeationFolder, IdeaVoter } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { signal } from '@angular/core';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UploadService } from '../../../../../core/services/upload.service';

const mockTopic = { id: 't1', status: 'ideation' } as unknown as Topic;
const mockIdeation = { id: 'i1', question: 'What should we do?', deadline: null } as unknown as Ideation;
const mockIdea1 = { id: 'a1', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as unknown as Idea;
const mockIdea2 = { id: 'a2', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as unknown as Idea;

const mockIdeationService = {
  getIdeas: vi.fn().mockReturnValue(of({ rows: [mockIdea1, mockIdea2], count: 2 })),
  getFolders: vi.fn().mockReturnValue(of({ rows: [], count: 0 })),
  getFolder: vi.fn().mockReturnValue(of(null)),
  participants: vi.fn().mockReturnValue(of({ rows: [], count: 0 })),
  deleteFolder: vi.fn().mockReturnValue(of({})),
  createFolder: vi.fn().mockReturnValue(of({})),
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
  VISIBILITY: { public: 'public', private: 'private' },
};
const mockUserStore = { user: vi.fn().mockReturnValue({ id: 'u1' }) };
const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };
const mockAuthDialogService = { openLogin: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };
const mockNotificationService = { show: vi.fn() };
const mockUploadService = {};

const queryParamsSubject = new BehaviorSubject<Record<string, unknown>>({});
const mockActivatedRoute = {
  queryParams: queryParamsSubject.asObservable(),
  snapshot: {
    queryParams: {},
  },
};

describe('TopicIdeationComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    queryParamsSubject.next({});
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot(), RouterModule.forRoot([])],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialogService },
        { provide: AuthDialogService, useValue: mockAuthDialogService },
        { provide: NotificationService, useValue: mockNotificationService },
        { provide: UploadService, useValue: mockUploadService },
        { provide: ActivatedRoute, useValue: mockActivatedRoute },
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

  it('canEditDeadline returns true when canEdit and topic status is ideation', () => {
    const comp = makeComp({}, { status: 'ideation' });
    expect(comp.canEditDeadline()).toBe(true);
  });

  it('canEditDeadline returns false when topic status is not ideation', () => {
    const comp = makeComp({}, { status: 'inProgress' });
    expect(comp.canEditDeadline()).toBe(false);
  });

  it('editDeadline opens EditIdeationDeadlineComponent dialog', () => {
    const comp = makeComp();
    comp.editDeadline();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('canManageFolders delegates to topicService canUpdate', () => {
    const comp = makeComp();
    expect(comp.canManageFolders()).toBe(true);
    expect(mockTopicService.canUpdate).toHaveBeenCalledWith(comp.topic());
  });

  it('Ideation Folders Empty state: renders cos-no-feature-yet with NO_FOLDERS_HEADING and hides row_header when folders is empty', () => {
    mockIdeationService.getFolders.mockReturnValue(of({ rows: [], count: 0 }));
    const fixture = TestBed.createComponent(TopicIdeationComponent);
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.componentRef.setInput('ideation', mockIdeation);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.selectTab('folders');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('.folder_row.row_header')).toBeNull();
    expect(el.querySelector('cos-no-feature-yet')).toBeTruthy();
    expect(el.querySelector('.description_heading')?.textContent).toContain('COMPONENTS.TOPIC_IDEATION.NO_FOLDERS_HEADING');
    expect(el.querySelector('.description')?.textContent).toContain('COMPONENTS.TOPIC_IDEATION.NO_FOLDERS_DESC');
    expect(comp.foldersCount()).toBe(0);
  });

  it('Ideation - Folders list: renders .folder_row items and updates foldersCount on TAB_FOLDERS when folders exist', () => {
    const mockFolder1 = { id: 'f1', name: 'Folder One', ideas: { count: 3 }, updatedAt: '2026-01-01' } as unknown as IdeationFolder;
    const mockFolder2 = { id: 'f2', name: 'Folder Two', ideas: { count: 5 }, updatedAt: '2026-01-02' } as unknown as IdeationFolder;
    mockIdeationService.getFolders.mockReturnValue(of({ rows: [mockFolder1, mockFolder2], count: 2 }));

    const fixture = TestBed.createComponent(TopicIdeationComponent);
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.componentRef.setInput('ideation', mockIdeation);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    expect(comp.foldersCount()).toBe(2);
    comp.selectTab('folders');
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const rows = el.querySelectorAll('.folder_row:not(.row_header)');
    expect(rows.length).toBe(2);
    expect(el.querySelector('.folder_row.row_header')).toBeTruthy();
    expect(el.querySelector('.folders_desc')).toBeTruthy();
  });

  it('Ideas in folder: renders folder_data_wrap with yellow folder SVG, folder name and ideas count, and reloads ideas & folder count when addIdeasToFolder dialog closes with true', () => {
    const mockFolder = { id: 'f1', name: 'Special Folder', ideas: { count: 4 }, updatedAt: '2026-01-01' } as unknown as IdeationFolder;
    mockIdeationService.getFolders.mockReturnValue(of({ rows: [mockFolder], count: 1 }));
    mockIdeationService.getFolder.mockReturnValue(of(mockFolder));

    const fixture = TestBed.createComponent(TopicIdeationComponent);
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.componentRef.setInput('ideation', mockIdeation);
    fixture.detectChanges();
    const comp = fixture.componentInstance;

    comp.viewFolder(mockFolder);
    fixture.detectChanges();

    expect(comp.tabSelected()).toBe('folder');
    expect(comp.selectedFolder()).toEqual(mockFolder);

    const el = fixture.nativeElement as HTMLElement;
    const folderDataWrap = el.querySelector('.folder_data_wrap');
    expect(folderDataWrap).toBeTruthy();
    expect(folderDataWrap?.querySelector('.folder_name')?.textContent).toContain('Special Folder');
    expect(folderDataWrap?.querySelector('.folder_name')?.textContent).toContain('(4)');

    // Verify yellow folder SVG in .left div.icon
    const folderIconSvg = folderDataWrap?.querySelector('.left div.icon svg');
    expect(folderIconSvg).toBeTruthy();
    expect(folderIconSvg?.getAttribute('viewBox')).toBe('0 0 28 24');

    // Trigger addIdeasToFolder and verify reload
    const reloadSpy = vi.fn();
    (comp as unknown as { ideasResource: unknown }).ideasResource = { reload: reloadSpy, isLoading: () => false, hasValue: () => true, value: () => ({ rows: [], count: 0 }) };
    const loadFoldersSpy = vi.spyOn(comp.loadFolders$, 'next');

    comp.addIdeasToFolder(mockFolder);
    expect(mockDialogService.open).toHaveBeenCalled();
    expect(reloadSpy).toHaveBeenCalled();
    expect(loadFoldersSpy).toHaveBeenCalled();
  });

  it('reactively updates selectedFolder and tab when queryParams folderId changes and resets on removal', () => {
    const mockFolder = { id: 'f_query', name: 'Route Folder', ideas: { count: 10 } } as unknown as IdeationFolder;
    mockIdeationService.getFolders.mockReturnValue(of({ rows: [mockFolder], count: 1 }));

    const comp = makeComp();

    queryParamsSubject.next({ folderId: 'f_query' });
    TestBed.flushEffects();

    expect(comp.tabSelected()).toBe('folder');
    expect(comp.selectedFolder()?.name).toBe('Route Folder');
    expect(comp.folderId()).toBe('f_query');

    queryParamsSubject.next({});
    TestBed.flushEffects();

    expect(comp.tabSelected()).toBe('folders');
    expect(comp.selectedFolder()).toBeNull();
    expect(comp.folderId()).toBe('');
  });

  it('initializes with folderId in queryParams before inputs are bound without throwing NG0950 and only fetches ideas for that folder', () => {
    const mockFolder = { id: 'f_init', name: 'Initial Folder', ideas: { count: 2 } } as unknown as IdeationFolder;
    const folderIdeas = [
      { id: 'i1', statement: 'Folder Idea 1', status: 'published', votes: { up: { count: 1, selected: false }, down: { count: 0, selected: false }, count: 1 } },
      { id: 'i2', statement: 'Folder Idea 2', status: 'published', votes: { up: { count: 2, selected: false }, down: { count: 0, selected: false }, count: 2 } }
    ] as unknown as Idea[];
    mockIdeationService.getFolders.mockReturnValue(of({ rows: [mockFolder], count: 1 }));
    mockIdeationService.getIdeas.mockImplementation((params: Record<string, unknown>) => {
      if (params['folderId'] === 'f_init') {
        return of({ rows: folderIdeas, count: 2 });
      }
      return of({ rows: [...folderIdeas, { id: 'i3', statement: 'Unassigned Idea 3', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } }], count: 3 });
    });

    queryParamsSubject.next({ folderId: 'f_init' });
    mockActivatedRoute.snapshot.queryParams = { folderId: 'f_init' };

    const fixture = TestBed.createComponent(TopicIdeationComponent);
    fixture.componentRef.setInput('topic', mockTopic);
    fixture.componentRef.setInput('ideation', mockIdeation);
    fixture.detectChanges();
    TestBed.flushEffects();
    fixture.detectChanges();

    const comp = fixture.componentInstance;
    expect(comp.tabSelected()).toBe('folder');
    expect(comp.folderId()).toBe('f_init');
    expect(comp.selectedFolder()?.id).toBe('f_init');
    expect(comp.ideas().length).toBe(2);
    expect(comp.ideasCount()).toBe(2);

    // Cleanup snapshot for subsequent tests
    mockActivatedRoute.snapshot.queryParams = {};
  });
});

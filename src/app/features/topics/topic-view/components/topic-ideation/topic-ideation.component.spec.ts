import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TopicIdeationComponent } from './topic-ideation.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';

const mockTopic = { id: 't1', status: 'ideation' } as any;
const mockIdeation = { id: 'i1', question: 'What should we do?', deadline: null } as any;
const mockIdea1 = { id: 'a1', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as any;
const mockIdea2 = { id: 'a2', status: 'published', votes: { up: { count: 0, selected: false }, down: { count: 0, selected: false }, count: 0 } } as any;

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
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => {
      const comp = new TopicIdeationComponent();
      (comp as any).topic = vi.fn().mockReturnValue(mockTopic);
      (comp as any).ideation = vi.fn().mockReturnValue(mockIdeation);
      comp.ngOnInit();
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
    comp.setOrder('rating');
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

  it('onIdeaDeleted removes idea from list', () => {
    const comp = makeComp();
    comp.onIdeaDeleted(mockIdea1);
    expect(comp.ideas().find(i => i.id === 'a1')).toBeUndefined();
    expect(comp.ideasCount()).toBe(1);
  });

  it('onIdeaUpdated replaces idea in list', () => {
    const comp = makeComp();
    const updated = { ...mockIdea1, statement: 'Updated' };
    comp.onIdeaUpdated(updated);
    expect(comp.ideas()[0].statement).toBe('Updated');
  });

  it('onIdeaAdded hides add form and reloads', () => {
    const comp = makeComp();
    comp.showAddIdea.set(true);
    comp.onIdeaAdded({ id: 'new' } as any);
    expect(comp.showAddIdea()).toBe(false);
  });

  it('exportIdeas opens download URL', () => {
    const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);
    const comp = makeComp();
    comp.exportIdeas();
    expect(mockIdeationService.downloadIdeas).toHaveBeenCalledWith('t1', 'i1');
    expect(openSpy).toHaveBeenCalledWith('https://example.com/download');
  });
});

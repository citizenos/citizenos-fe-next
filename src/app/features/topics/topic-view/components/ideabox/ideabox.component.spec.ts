import { provideRouter, Router } from '@angular/router';
import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { IdeaboxComponent } from './ideabox.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { AddIdeaFolderComponent } from '../add-idea-folder/add-idea-folder.component';
import { IdeaReportComponent } from '../idea-report/idea-report.component';
import { IdeaReportReasonComponent } from '../idea-report-reason/idea-report-reason.component';

const mockTopic = { id: 't1', status: 'ideation' } as unknown as Topic;
const mockIdeation = { id: 'i1' } as unknown as Ideation;
const mockIdea = {
  id: 'idea1', ideationId: 'i1', statement: 'Test idea', description: 'Desc',
  status: IdeaStatus.published, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  authorId: 'u1', imageUrl: null, demographics: null,
  deletedAt: null, deletedReasonText: null, deletedReasonType: null,
  author: { id: 'u1', name: 'Alice', company: null, email: null, imageUrl: null },
  votes: { up: { count: 2, selected: false }, down: { count: 0, selected: false }, count: 2 },
  replies: { count: 1 }, report: { id: null }, favourite: false,
} as unknown as Idea;


const mockIdeationService = {
  voteIdea: vi.fn().mockReturnValue(of({ up: { count: 3, selected: true }, down: { count: 0, selected: false }, count: 3 })),
  addIdeaToFavourites: vi.fn().mockReturnValue(of({})),
  removeIdeaFromFavourites: vi.fn().mockReturnValue(of({})),
  deleteIdea: vi.fn().mockReturnValue(of({})),
};
const mockTopicService = {
  canEdit: vi.fn().mockReturnValue(true),
  STATUSES: { draft: 'draft', ideation: 'ideation', inProgress: 'inProgress' },
};
const mockUserStore = { 
  user: vi.fn().mockReturnValue({ id: 'u1', name: 'Alice' }),
  isAuthenticated: vi.fn().mockReturnValue(true)
};
const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };

describe('IdeaboxComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
        { provide: DialogService, useValue: mockDialogService },
        provideRouter([]),
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
    Object.defineProperty(TestBed.inject(TranslateService), 'currentLang', { value: 'en' });
  });

  function makeComp(ideaOverride?: Partial<Idea>) {
    return runInInjectionContext(injector, () => {
      const comp = new IdeaboxComponent();
      TestBed.runInInjectionContext(() => {
        (comp as unknown as { idea: unknown }).idea = vi.fn().mockReturnValue(ideaOverride ? { ...mockIdea, ...ideaOverride } : mockIdea);
        (comp as unknown as { topic: unknown }).topic = vi.fn().mockReturnValue(mockTopic);
        (comp as unknown as { ideation: unknown }).ideation = vi.fn().mockReturnValue(mockIdeation);
      });
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('isDraft returns false for published idea and true for draft idea', () => {
    const compPublished = makeComp();
    expect(compPublished.isDraft()).toBe(false);

    const compDraft = makeComp({ status: IdeaStatus.draft });
    expect(compDraft.isDraft()).toBe(true);
  });

  it('goToView calls editIdea when idea is draft', () => {
    const comp = makeComp({ status: IdeaStatus.draft });
    const editIdeaSpy = vi.spyOn(comp, 'editIdea');
    comp.goToView();
    expect(editIdeaSpy).toHaveBeenCalled();
  });

  it('goToView navigates to idea route when idea is published', () => {
    const comp = makeComp();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    comp.goToView();
    expect(navSpy).toHaveBeenCalledWith(
      expect.arrayContaining(['topics', 't1', 'ideation', 'i1', 'ideas', 'idea1']),
      expect.anything()
    );
  });

  it('canVote returns true when topic status is ideation', () => {
    const comp = makeComp();
    expect(comp.canVote()).toBe(true);
  });

  it('canEditIdea returns true for idea author when topic is in ideation', () => {
    const comp = makeComp();
    expect(comp.canEditIdea()).toBe(true);
  });

  it('vote calls voteIdea service', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.vote(1);
    expect(mockIdeationService.voteIdea).toHaveBeenCalledWith({
      topicId: 't1', ideationId: 'i1', ideaId: 'idea1', value: 1
    });
    expect(emitSpy).toHaveBeenCalled();
  });

  it('toggleFavourite adds to favourites when not favourite', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.toggleFavourite();
    expect(mockIdeationService.addIdeaToFavourites).toHaveBeenCalled();
    expect(emitSpy).toHaveBeenCalledWith(expect.objectContaining({ favourite: true }));
  });

  it('confirmDelete opens dialog and calls deleteIdea on confirm', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaDeleted, 'emit');
    comp.confirmDelete();
    expect(mockDialogService.open).toHaveBeenCalled();
    expect(mockIdeationService.deleteIdea).toHaveBeenCalledWith({
      topicId: 't1', ideationId: 'i1', ideaId: 'idea1'
    });
    expect(emitSpy).toHaveBeenCalledWith(mockIdea);
  });

  it('showReactions opens reactions dialog', () => {
    const comp = makeComp();
    comp.showReactions();
    expect(mockDialogService.open).toHaveBeenCalledWith(expect.anything(), expect.objectContaining({
      data: expect.objectContaining({ ideaId: 'idea1' })
    }));
  });

  it('addToFolder opens AddIdeaFolderComponent and emits ideaUpdated when dialog closes with truthy value', () => {
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.addToFolder();
    expect(mockDialogService.open).toHaveBeenCalledWith(AddIdeaFolderComponent, {
      data: {
        idea: mockIdea,
        topicId: 't1',
        ideationId: 'i1'
      }
    });
    expect(emitSpy).toHaveBeenCalledWith(mockIdea);
  });

  it('addToFolder does not emit ideaUpdated when dialog closes with falsy value', () => {
    mockDialogService.open.mockReturnValueOnce({ afterClosed: () => of(false) });
    const comp = makeComp();
    const emitSpy = vi.spyOn(comp.ideaUpdated, 'emit');
    comp.addToFolder();
    expect(mockDialogService.open).toHaveBeenCalled();
    expect(emitSpy).not.toHaveBeenCalled();
  });

  it('goToView(true) navigates to idea route with reply: true query param', () => {
    const comp = makeComp();
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate');
    comp.goToView(true);
    expect(navSpy).toHaveBeenCalledWith(
      expect.arrayContaining(['topics', 't1', 'ideation', 'i1', 'ideas', 'idea1']),
      expect.objectContaining({ queryParams: { reply: true } })
    );
  });

  it('doIdeaReport opens IdeaReportComponent with full idea object', () => {
    const comp = makeComp();
    comp.doIdeaReport();
    expect(mockDialogService.open).toHaveBeenCalledWith(IdeaReportComponent, {
      data: {
        idea: mockIdea,
        topicId: 't1',
        ideationId: 'i1'
      }
    });
  });

  it('reportReasonDialog opens IdeaReportReasonComponent with moderation reason', () => {
    const comp = makeComp({
      deletedReasonText: 'Violates community guidelines',
      deletedReasonType: 'spam'
    });
    comp.reportReasonDialog();
    expect(mockDialogService.open).toHaveBeenCalledWith(IdeaReportReasonComponent, {
      data: {
        report: {
          moderatedReasonText: 'Violates community guidelines',
          moderatedReasonType: 'spam'
        }
      }
    });
  });
});

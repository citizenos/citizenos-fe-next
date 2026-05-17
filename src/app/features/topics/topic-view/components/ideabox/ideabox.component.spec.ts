import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { IdeaboxComponent } from './ideabox.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { Idea } from '../../../../../core/interfaces/idea';
import { Ideation } from '../../../../../core/interfaces/ideation';

const mockTopic = { id: 't1', status: 'ideation' } as unknown as Topic;
const mockIdeation = { id: 'i1' } as unknown as Ideation;
const mockIdea = {
  id: 'idea1', ideationId: 'i1', statement: 'Test idea', description: 'Desc',
  status: 'published', createdAt: '2024-01-01', updatedAt: '2024-01-01',
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
const mockUserStore = { user: vi.fn().mockReturnValue({ id: 'u1', name: 'Alice' }) };
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
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => {
      const comp = new IdeaboxComponent();
      TestBed.runInInjectionContext(() => {
        (comp as unknown as { idea: unknown }).idea = vi.fn().mockReturnValue(mockIdea);
        (comp as unknown as { topic: unknown }).topic = vi.fn().mockReturnValue(mockTopic);
        (comp as unknown as { ideation: unknown }).ideation = vi.fn().mockReturnValue(mockIdeation);
      });
      return comp;
    });
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('isDraft returns false for published idea', () => {
    const comp = makeComp();
    expect(comp.isDraft()).toBe(false);
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
});

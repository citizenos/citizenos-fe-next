import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { IdeaDialogComponent, IdeaDialogData } from './idea-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { Topic } from '../../../../../core/interfaces/topic';

const mockIdea: Idea = {
  id: 'idea-1',
  ideationId: 'ideation-1',
  authorId: 'user-1',
  statement: 'Test statement',
  description: 'Test description',
  imageUrl: null,
  demographics: null,
  createdAt: '2024-01-01T12:00:00Z',
  status: IdeaStatus.published,
  updatedAt: '2024-01-01T12:00:00Z',
  deletedAt: null,
  deletedBy: undefined,
  deletedReasonText: null,
  deletedReasonType: null,
  author: { id: 'user-1', name: 'Alice', company: null, email: null, imageUrl: null },
  votes: { up: { count: 3, selected: false }, down: { count: 0, selected: false }, count: 3 },
  favourite: false,
};

const baseData: IdeaDialogData = {
  topicId: 'topic-1',
  ideationId: 'ideation-1',
  ideaId: 'idea-1',
  topic: { id: 'topic-1' } as unknown as Topic
};

const ideationServiceMock = {
  getIdea: vi.fn().mockReturnValue(of(mockIdea)),
  addIdeaToFavourites: vi.fn().mockReturnValue(of({})),
  removeIdeaFromFavourites: vi.fn().mockReturnValue(of({})),
  voteIdea: vi.fn().mockReturnValue(of({})),
};

const dialogRefMock = { close: vi.fn(), afterClosed: () => ({ pipe: () => ({ subscribe: vi.fn() }) }) };

function createFixture(data: Partial<IdeaDialogData> = {}): ComponentFixture<IdeaDialogComponent> {
  TestBed.configureTestingModule({
    imports: [IdeaDialogComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DIALOG_DATA, useValue: { ...baseData, ...data } },
      { provide: DialogRef, useValue: dialogRefMock },
      { provide: TopicIdeationService, useValue: ideationServiceMock },
      { provide: UserStore, useValue: { isAuthenticated: () => false, user: () => null } },
    ],
    schemas: [NO_ERRORS_SCHEMA],
  }).compileComponents();

  const fixture = TestBed.createComponent(IdeaDialogComponent);
  fixture.detectChanges();
  return fixture;
}

describe('IdeaDialogComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    ideationServiceMock.getIdea.mockReturnValue(of(mockIdea));
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls getIdea on init with correct params', () => {
    createFixture();
    expect(ideationServiceMock.getIdea).toHaveBeenCalledWith({
      topicId: 'topic-1',
      ideationId: 'ideation-1',
      ideaId: 'idea-1',
    });
  });

  it('shows loading state initially then resolves', () => {
    const fixture = createFixture();
    // After detectChanges, loading resolves
    expect(fixture.componentInstance.isLoading()).toBe(false);
    expect(fixture.componentInstance.idea()).toEqual(mockIdea);
  });

  it('shows error state when API fails', () => {
    ideationServiceMock.getIdea.mockReturnValue(throwError(() => new Error('fail')));
    const fixture = createFixture();
    expect(fixture.componentInstance.hasError()).toBe(true);
    const errorEl = fixture.nativeElement.querySelector('.error_state');
    expect(errorEl).toBeTruthy();
  });

  it('shows idea content after load', () => {
    const fixture = createFixture();
    const statement = fixture.nativeElement.querySelector('.statement');
    expect(statement).toBeTruthy();
  });

  it('shows author name when author is set', () => {
    const fixture = createFixture();
    const name = fixture.nativeElement.querySelector('.name');
    expect(name).toBeTruthy();
  });

  it('hasPrev returns false when no ideas array', () => {
    const fixture = createFixture({ ideas: undefined });
    expect(fixture.componentInstance.hasPrev()).toBe(false);
  });

  it('hasNext returns false when no ideas array', () => {
    const fixture = createFixture({ ideas: undefined });
    expect(fixture.componentInstance.hasNext()).toBe(false);
  });

  it('hasPrev and hasNext work with ideas array', () => {
    const ideas = [
      { ...mockIdea, id: 'idea-0' },
      { ...mockIdea, id: 'idea-1' },
      { ...mockIdea, id: 'idea-2' },
    ] as Idea[];
    const fixture = createFixture({ ideaId: 'idea-1', ideas });
    fixture.detectChanges();
    expect(fixture.componentInstance.hasPrev()).toBe(true);
    expect(fixture.componentInstance.hasNext()).toBe(true);
  });

  it('prevIdea loads previous idea', () => {
    const ideas = [
      { ...mockIdea, id: 'idea-0' },
      { ...mockIdea, id: 'idea-1' },
    ] as Idea[];
    const fixture = createFixture({ ideaId: 'idea-1', ideas });
    vi.clearAllMocks();
    ideationServiceMock.getIdea.mockReturnValue(of({ ...mockIdea, id: 'idea-0' }));
    fixture.componentInstance.prevIdea();
    expect(ideationServiceMock.getIdea).toHaveBeenCalledWith(
      expect.objectContaining({ ideaId: 'idea-0' })
    );
  });

  it('nextIdea loads next idea', () => {
    const ideas = [
      { ...mockIdea, id: 'idea-1' },
      { ...mockIdea, id: 'idea-2' },
    ] as Idea[];
    const fixture = createFixture({ ideaId: 'idea-1', ideas });
    vi.clearAllMocks();
    ideationServiceMock.getIdea.mockReturnValue(of({ ...mockIdea, id: 'idea-2' }));
    fixture.componentInstance.nextIdea();
    expect(ideationServiceMock.getIdea).toHaveBeenCalledWith(
      expect.objectContaining({ ideaId: 'idea-2' })
    );
  });

  it('toggleFavourite does nothing when not authenticated', () => {
    const fixture = createFixture();
    fixture.componentInstance.toggleFavourite();
    expect(ideationServiceMock.addIdeaToFavourites).not.toHaveBeenCalled();
  });

  it('close button is rendered', () => {
    const fixture = createFixture();
    const closeBtn = fixture.nativeElement.querySelector('.btn_medium_close');
    expect(closeBtn).toBeTruthy();
  });
});

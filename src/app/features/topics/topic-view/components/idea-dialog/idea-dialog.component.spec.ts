import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { IdeaDialogComponent } from './idea-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';

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

const mockTopic = { id: 'topic-1', status: 'ideation', country: 'EE' } as unknown as Topic;
const mockIdeation = { id: 'ideation-1', disableReplies: false } as Ideation;

const ideationServiceMock = {
  getIdeaFolders: vi.fn().mockReturnValue(of({ rows: [] })),
  getIdeaComments: vi.fn().mockReturnValue(of({ count: 0, rows: [] })),
  getIdeas: vi.fn().mockReturnValue(of({ rows: [mockIdea] })),
  getIdea: vi.fn().mockReturnValue(of(mockIdea)),
  voteIdea: vi.fn().mockReturnValue(of({})),
  addIdeaToFavourites: vi.fn().mockReturnValue(of({})),
  removeIdeaFromFavourites: vi.fn().mockReturnValue(of({})),
  deleteIdea: vi.fn().mockReturnValue(of({})),
};

const attachmentServiceMock = {
  getItems: vi.fn().mockReturnValue(of({ rows: [] })),
};

const topicServiceMock = {
  canEdit: vi.fn().mockReturnValue(false),
  STATUSES: { draft: 'draft', ideation: 'ideation', followUp: 'followUp', voting: 'voting', closed: 'closed' },
};

const dialogRefMock = { close: vi.fn(), afterClosed: () => of(null) };
const dialogServiceMock = { open: vi.fn().mockReturnValue({ afterClosed: () => of(null) }) };

const unauthUserStore = { isAuthenticated: () => false, user: () => null };
const authUserStore = { isAuthenticated: () => true, user: () => ({ id: 'user-1', name: 'Alice' }) };

function createFixture(
  overrides: { idea?: Partial<Idea>; userStore?: object; showReplies?: boolean } = {}
): ComponentFixture<IdeaDialogComponent> {
  const idea = overrides.idea ? { ...mockIdea, ...overrides.idea } : mockIdea;
  TestBed.configureTestingModule({
    imports: [IdeaDialogComponent, TranslateModule.forRoot()],
    providers: [
      { provide: DIALOG_DATA, useValue: { idea, topic: mockTopic, ideation: mockIdeation, showReplies: overrides.showReplies } },
      { provide: DialogRef, useValue: dialogRefMock },
      { provide: TopicIdeationService, useValue: ideationServiceMock },
      { provide: TopicService, useValue: topicServiceMock },
      { provide: IdeaAttachmentService, useValue: attachmentServiceMock },
      { provide: DialogService, useValue: dialogServiceMock },
      { provide: UserStore, useValue: overrides.userStore ?? unauthUserStore },
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
    ideationServiceMock.getIdeaFolders.mockReturnValue(of({ rows: [] }));
    ideationServiceMock.getIdeaComments.mockReturnValue(of({ count: 0, rows: [] }));
    ideationServiceMock.getIdeas.mockReturnValue(of({ rows: [mockIdea] }));
    ideationServiceMock.getIdea.mockReturnValue(of(mockIdea));
    attachmentServiceMock.getItems.mockReturnValue(of({ rows: [] }));
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('sets idea signal from DIALOG_DATA on init', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.idea()).toEqual(mockIdea);
  });

  it('isLoading is false after init', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.isLoading()).toBe(false);
  });

  it('hasError is false on successful init', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.hasError()).toBe(false);
  });

  it('loads idea folders on init', () => {
    createFixture();
    expect(ideationServiceMock.getIdeaFolders).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'topic-1', ideationId: 'ideation-1', ideaId: 'idea-1' })
    );
  });

  it('loads idea attachments on init', () => {
    createFixture();
    expect(attachmentServiceMock.getItems).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'topic-1', ideationId: 'ideation-1', ideaId: 'idea-1' })
    );
  });

  it('loads replies on init and sets replyCount', () => {
    ideationServiceMock.getIdeaComments.mockReturnValue(of({ count: 2, rows: [] }));
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance.replyCount()).toBe(2);
  });

  it('loads ideas list and sets currentIndex', () => {
    const fixture = createFixture();
    expect(ideationServiceMock.getIdeas).toHaveBeenCalled();
    expect(fixture.componentInstance.hasMoreIdeas()).toBe(false);
  });

  it('shows close button', () => {
    const fixture = createFixture();
    const closeBtn = fixture.nativeElement.querySelector('#close_button');
    expect(closeBtn).toBeTruthy();
  });

  it('shows statement in content', () => {
    const fixture = createFixture();
    const statement = fixture.nativeElement.querySelector('.statement');
    expect(statement).toBeTruthy();
  });

  it('shows author name when author is present', () => {
    const fixture = createFixture();
    const name = fixture.nativeElement.querySelector('.name');
    expect(name?.innerHTML).toContain('Alice');
  });

  it('shows ideaNumber when author is absent', () => {
    const fixture = createFixture({ idea: { author: undefined, authorId: '' } });
    const name = fixture.nativeElement.querySelector('.name');
    expect(name).toBeTruthy();
  });

  it('showReply is false initially', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.showReply()).toBe(false);
  });

  it('showReplies is false initially', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.showReplies()).toBe(false);
  });

  it('sets showReply and showReplies when showReplies data flag is true', () => {
    const fixture = createFixture({ showReplies: true });
    expect(fixture.componentInstance.showReply()).toBe(true);
    expect(fixture.componentInstance.showReplies()).toBe(true);
  });

  it('hasPrev returns false when currentIndex is 0 and only one idea', () => {
    ideationServiceMock.getIdeas.mockReturnValue(of({ rows: [mockIdea] }));
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance.hasPrev()).toBe(false);
  });

  it('hasPrev and hasNext return true when multiple ideas', () => {
    ideationServiceMock.getIdeas.mockReturnValue(of({
      rows: [{ ...mockIdea, id: 'idea-0' }, mockIdea, { ...mockIdea, id: 'idea-2' }]
    }));
    const fixture = createFixture();
    fixture.detectChanges();
    expect(fixture.componentInstance.hasPrev()).toBe(true);
    expect(fixture.componentInstance.hasNext()).toBe(true);
  });

  it('prevIdea decrements currentIndex and loads new idea data', () => {
    ideationServiceMock.getIdeas.mockReturnValue(of({
      rows: [{ ...mockIdea, id: 'idea-0' }, mockIdea]
    }));
    const fixture = createFixture();
    fixture.detectChanges();
    fixture.componentInstance.prevIdea();
    expect(fixture.componentInstance.idea().id).toBe('idea-0');
  });

  it('nextIdea increments currentIndex and loads new idea data', () => {
    ideationServiceMock.getIdeas.mockReturnValue(of({
      rows: [mockIdea, { ...mockIdea, id: 'idea-2' }]
    }));
    const fixture = createFixture();
    fixture.detectChanges();
    fixture.componentInstance.nextIdea();
    expect(fixture.componentInstance.idea().id).toBe('idea-2');
  });

  it('toggleFavourite calls removeIdeaFromFavourites when idea is already favourite', () => {
    const fixture = createFixture({ idea: { favourite: true }, userStore: authUserStore });
    fixture.componentInstance.toggleFavourite();
    expect(ideationServiceMock.removeIdeaFromFavourites).toHaveBeenCalled();
  });

  it('toggleFavourite calls addIdeaToFavourites when idea is not favourite', () => {
    const fixture = createFixture({ userStore: authUserStore });
    fixture.componentInstance.toggleFavourite();
    expect(ideationServiceMock.addIdeaToFavourites).toHaveBeenCalled();
  });

  it('voteIdea does nothing when not authenticated', () => {
    const fixture = createFixture();
    fixture.componentInstance.voteIdea(1);
    expect(ideationServiceMock.voteIdea).not.toHaveBeenCalled();
  });

  it('voteIdea calls service when authenticated and voting is allowed', () => {
    const fixture = createFixture({ userStore: authUserStore });
    fixture.componentInstance.voteIdea(1);
    expect(ideationServiceMock.voteIdea).toHaveBeenCalledWith(
      expect.objectContaining({ topicId: 'topic-1', ideationId: 'ideation-1', ideaId: 'idea-1', value: 1 })
    );
  });

  it('canVote returns true when topic status is ideation', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.canVote()).toBe(true);
  });

  it('canEditIdea returns false when user is not the author', () => {
    const fixture = createFixture({ userStore: { isAuthenticated: () => true, user: () => ({ id: 'other-user' }) } });
    expect(fixture.componentInstance.canEditIdea()).toBe(false);
  });

  it('canEditIdea returns true when user is the author and idea is not deleted', () => {
    const fixture = createFixture({ userStore: authUserStore });
    expect(fixture.componentInstance.canEditIdea()).toBe(true);
  });

  it('isImageViewed returns false before toggling', () => {
    const fixture = createFixture();
    expect(fixture.componentInstance.isImageViewed('img-1')).toBe(false);
  });

  it('toggleImageView adds then removes image from viewed set', () => {
    const fixture = createFixture();
    fixture.componentInstance.toggleImageView('img-1');
    expect(fixture.componentInstance.isImageViewed('img-1')).toBe(true);
    fixture.componentInstance.toggleImageView('img-1');
    expect(fixture.componentInstance.isImageViewed('img-1')).toBe(false);
  });

  it('onReplyAdded reloads idea data', () => {
    const fixture = createFixture();
    vi.clearAllMocks();
    fixture.componentInstance.onReplyAdded();
    expect(ideationServiceMock.getIdeaComments).toHaveBeenCalled();
  });
});

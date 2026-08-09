import { TestBed } from '@angular/core/testing';
import { IdeaReactionsComponent } from './idea-reactions.component';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import { EnvironmentInjector, runInInjectionContext } from '@angular/core';

describe('IdeaReactionsComponent', () => {
  let mockIdeationService: { getIdeaVoters: ReturnType<typeof vi.fn> };
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    mockIdeationService = {
      getIdeaVoters: vi.fn().mockReturnValue(of({ rows: [], count: 0 }))
    };

    mockDialogRef = {
      close: vi.fn()
    };

    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot(),
      ],
      providers: [
        { provide: TopicIdeationService, useValue: mockIdeationService },
        { provide: DialogRef, useValue: mockDialogRef },
        {
          provide: DIALOG_DATA,
          useValue: {
            topicId: 'topic1',
            ideationId: 'ideation1',
            ideaId: 'idea1'
          }
        }
      ]
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => {
      return new IdeaReactionsComponent();
    });
  }

  it('should create', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('should load reactions on init', () => {
    const mockData = {
      rows: [
        { name: 'User 1', vote: 'up', imageUrl: 'img1.jpg' },
        { name: 'User 2', vote: 'down', imageUrl: null }
      ],
      count: 2
    };
    mockIdeationService.getIdeaVoters.mockReturnValue(of(mockData));

    const component = makeComp();
    component.ngOnInit();

    expect(mockIdeationService.getIdeaVoters).toHaveBeenCalledWith(expect.objectContaining({
      topicId: 'topic1',
      ideaId: 'idea1',
      limit: 10,
      offset: 0
    }));
    expect(component.voteItems().length).toBe(2);
    expect(component.totalPages()).toBe(1);
  });

  it('should handle pagination', () => {
    const mockData = {
      rows: new Array(10).fill({ name: 'User', vote: 'up' }),
      count: 25
    };
    mockIdeationService.getIdeaVoters.mockReturnValue(of(mockData));

    const component = makeComp();
    component.ngOnInit();
    expect(component.totalPages()).toBe(3);

    component.loadPage(2);
    expect(component.page()).toBe(2);
    expect(mockIdeationService.getIdeaVoters).toHaveBeenCalledWith(expect.objectContaining({
      offset: 10
    }));
  });

  it('should close dialog when close is called', () => {
    const component = makeComp();
    component.close();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });
});

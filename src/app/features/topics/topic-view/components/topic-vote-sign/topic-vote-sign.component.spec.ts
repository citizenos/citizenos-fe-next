import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { of } from 'rxjs';

import { TopicVoteSignComponent } from './topic-vote-sign.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';

const mockData = { topic: { id: 't1', voteId: 'v1' }, options: [{ id: 'o1' }] };
const mockDialogRef = { close: vi.fn() };
const mockDialogService = { open: vi.fn(() => ({ afterClosed: () => of(undefined) })) };
const mockTopicVoteService = { reloadVote: vi.fn(), loadVote$: of(null) };

describe('TopicVoteSignComponent', () => {
  let component: TopicVoteSignComponent;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: mockData },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: DialogService, useValue: mockDialogService },
        { provide: TopicVoteService, useValue: mockTopicVoteService }
      ]
    });
    component = TestBed.runInInjectionContext(() => new TopicVoteSignComponent());
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('doSignEsteId should close the current dialog', () => {
    component.doSignEsteId();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('doSignEsteId should open the eID sign dialog', () => {
    component.doSignEsteId();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('doSignSmartId should close the current dialog', () => {
    component.doSignSmartId();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('doSignSmartId should open the Smart-ID sign dialog', () => {
    component.doSignSmartId();
    expect(mockDialogService.open).toHaveBeenCalled();
  });

  it('doSignEsteId should reload vote after dialog closes', () => {
    component.doSignEsteId();
    expect(mockTopicVoteService.reloadVote).toHaveBeenCalled();
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';

import { TopicVoteReminderDialogComponent } from './topic-vote-reminder-dialog.component';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { UserStore } from '../../../../../core/state/user.store';
import { Vote } from '../../../../../core/interfaces/vote';

const mockUser = { id: 'u1', name: 'Alice' };
const mockUserStore = { user: vi.fn(() => mockUser) };

describe('TopicVoteReminderDialogComponent', () => {
  const futureDate = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString();
  let component: TopicVoteReminderDialogComponent;

  function setup(vote: Partial<Vote>) {
    TestBed.configureTestingModule({
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: { id: 't1' }, vote } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: UserStore, useValue: mockUserStore }
      ]
    });
    return TestBed.runInInjectionContext(() => new TopicVoteReminderDialogComponent());
  }

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should create', () => {
    component = setup({ endsAt: null });
    expect(component).toBeTruthy();
  });

  it('daysLeft should be null when vote has no endsAt', () => {
    component = setup({ endsAt: null });
    expect(component.daysLeft()).toBeNull();
  });

  it('daysLeft should return positive number when endsAt is in the future', () => {
    component = setup({ endsAt: futureDate });
    expect(component.daysLeft()).toBeGreaterThan(0);
  });

  it('user should reflect the current user from UserStore', () => {
    component = setup({ endsAt: null });
    expect(component.user()).toEqual(mockUser);
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivityFeedComponent } from './activity-feed.component';
import { ActivityFeedState } from '../../state/activity-feed.state';
import { ActivityService } from '../../services/activity.service';

const mockFeedState = {
  isOpen: signal(false),
  groupId: signal<string | undefined>(undefined),
  topicId: signal<string | undefined>(undefined),
  close: vi.fn(),
};
const mockActivityService = {
  hasMore: signal(false),
  reset: vi.fn(),
  reloadUnreadItems: vi.fn(),
  loadItems: vi.fn().mockReturnValue(of([])),
  loadMore: vi.fn(),
};

describe('ActivityFeedComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockActivityService.loadItems.mockReturnValue(of([]));
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: ActivityFeedState, useValue: mockFeedState },
        { provide: ActivityService, useValue: mockActivityService },
      ],
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    expect(component).toBeTruthy();
  });

  it('should expose feedState', () => {
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    expect(component.feedState).toBe(mockFeedState);
  });

  it('feedType should return "global" when no groupId or topicId', () => {
    mockFeedState.groupId.set(undefined);
    mockFeedState.topicId.set(undefined);
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    expect(component.feedType).toBe('global');
  });

  it('feedType should return "group" when groupId is set', () => {
    mockFeedState.groupId.set('g1');
    mockFeedState.topicId.set(undefined);
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    expect(component.feedType).toBe('group');
  });

  it('feedType should return "topic" when topicId is set', () => {
    mockFeedState.groupId.set(undefined);
    mockFeedState.topicId.set('t1');
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    expect(component.feedType).toBe('topic');
  });

  it('close() should reset activity service and close feed', () => {
    const component = TestBed.runInInjectionContext(() => new ActivityFeedComponent());
    component.close();
    expect(mockActivityService.reset).toHaveBeenCalled();
    expect(mockActivityService.reloadUnreadItems).toHaveBeenCalled();
    expect(mockFeedState.close).toHaveBeenCalled();
  });
});

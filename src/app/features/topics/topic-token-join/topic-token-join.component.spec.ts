import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { ActivatedRoute, Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { TopicTokenJoinComponent } from './topic-token-join.component';
import { TopicJoinService } from '../../../core/services/topic-join.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { Topic } from '../../../core/interfaces/topic';

const mockTopic: Partial<Topic> = {
  id: 'topic-1',
  title: 'Test Topic',
  imageUrl: null,
  intro: null,
  description: 'desc',
  visibility: 'private',
  creator: { id: 'creator-1', name: 'Creator' },
  permission: { level: 'none' },
};

const mockDialogRef = { afterClosed: () => of(true) };
const mockDialogRefFalse = { afterClosed: () => of(false) };

function buildRoute(params: Record<string, string>, queryParams: Record<string, string> = {}) {
  return { snapshot: { params, queryParams } };
}

function setup(overrides: {
  topic?: Partial<Topic>;
  topicError?: { status: { code: number } };
  joinResult?: Partial<Topic>;
  joinError?: { status: { code: number } };
  dialogResult?: boolean;
  isAuthenticated?: boolean;
  routeParams?: Record<string, string>;
  queryParams?: Record<string, string>;
} = {}) {
  const dialogResult = overrides.dialogResult ?? true;
  const topicJoinServiceMock = {
    get: vi.fn().mockReturnValue(
      overrides.topicError
        ? throwError(() => overrides.topicError)
        : of(overrides.topic ?? mockTopic)
    ),
    join: vi.fn().mockReturnValue(
      overrides.joinError
        ? throwError(() => overrides.joinError)
        : of(overrides.joinResult ?? { id: 'topic-1' })
    ),
  };
  const dialogServiceMock = {
    open: vi.fn().mockReturnValue(dialogResult ? mockDialogRef : mockDialogRefFalse),
  };
  const routerMock = { navigate: vi.fn() };
  const userStoreMock = {
    isAuthenticated: vi.fn().mockReturnValue(overrides.isAuthenticated ?? false),
  };

  const routeParams = overrides.routeParams ?? { token: 'tok-1' };
  TestBed.configureTestingModule({
    imports: [TopicTokenJoinComponent],
    providers: [
      { provide: ActivatedRoute, useValue: buildRoute(routeParams, overrides.queryParams ?? {}) },
      { provide: Router, useValue: routerMock },
      { provide: TopicJoinService, useValue: topicJoinServiceMock },
      { provide: UserStore, useValue: userStoreMock },
      { provide: DialogService, useValue: dialogServiceMock },
    ],
  }).compileComponents();

  const fixture = TestBed.createComponent(TopicTokenJoinComponent);
  fixture.detectChanges();

  return { fixture, topicJoinServiceMock, dialogServiceMock, routerMock, userStoreMock };
}

describe('TopicTokenJoinComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.resetTestingModule();
  });

  it('renders without error', () => {
    const { fixture } = setup();
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('calls TopicJoinService.get with token from route', () => {
    const { topicJoinServiceMock } = setup({ routeParams: { token: 'my-token' } });
    expect(topicJoinServiceMock.get).toHaveBeenCalledWith('my-token');
  });

  it('navigates to /topics/:id when user is already in topic', () => {
    const { routerMock } = setup({ topic: { ...mockTopic, permission: { level: 'read' } } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/topics', 'topic-1']);
  });

  it('navigates to dashboard and opens dialog when no direct join and not in topic', () => {
    const { routerMock, dialogServiceMock } = setup();
    expect(routerMock.navigate).toHaveBeenCalledWith(['dashboard']);
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('calls TopicJoinService.join with token after dialog confirm', () => {
    const { topicJoinServiceMock } = setup();
    expect(topicJoinServiceMock.join).toHaveBeenCalledWith('tok-1');
  });

  it('navigates to /topics/:id after successful join', () => {
    const { routerMock } = setup({ joinResult: { id: 'topic-1' } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/topics', 'topic-1']);
  });

  it('does not join when dialog is dismissed', () => {
    const { topicJoinServiceMock } = setup({ dialogResult: false });
    expect(topicJoinServiceMock.join).not.toHaveBeenCalled();
  });

  it('navigates to dashboard when dialog dismissed and topic is not public', () => {
    const { routerMock } = setup({ dialogResult: false, topic: { ...mockTopic, visibility: 'private' } });
    expect(routerMock.navigate).toHaveBeenCalledWith(['dashboard']);
  });

  it('navigates to login when hasDirectJoin and not logged in', () => {
    const { routerMock } = setup({
      isAuthenticated: false,
      queryParams: { join: 'true' },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/account/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ redirectSuccess: expect.any(String) }) })
    );
  });

  it('joins directly when hasDirectJoin and logged in', () => {
    const { topicJoinServiceMock } = setup({
      isAuthenticated: true,
      queryParams: { join: 'true' },
    });
    expect(topicJoinServiceMock.join).toHaveBeenCalled();
  });

  it('navigates to login on 40100 join error', () => {
    const { routerMock } = setup({
      isAuthenticated: true,
      queryParams: { join: 'true' },
      joinError: { status: { code: 40100 } },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(
      ['/account/login'],
      expect.objectContaining({ queryParams: expect.objectContaining({ redirectSuccess: expect.any(String) }) })
    );
  });

  it('navigates to dashboard on 40001 join error', () => {
    const { routerMock } = setup({
      isAuthenticated: true,
      queryParams: { join: 'true' },
      joinError: { status: { code: 40001 } },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['dashboard']);
  });

  it('navigates to /404 on other join error', () => {
    const { routerMock } = setup({
      isAuthenticated: true,
      queryParams: { join: 'true' },
      joinError: { status: { code: 50000 } },
    });
    expect(routerMock.navigate).toHaveBeenCalledWith(['/404']);
  });
});

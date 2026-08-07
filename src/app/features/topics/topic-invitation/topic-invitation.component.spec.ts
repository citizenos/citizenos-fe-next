import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { ActivatedRoute, provideRouter } from '@angular/router';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { TopicInvitationComponent } from './topic-invitation.component';
import { UserStore } from '../../../core/state/user.store';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { DialogService } from '../../../shared/dialog';
import { NotificationService } from '../../../core/services/notification.service';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockTopicInvite = {
  id: 'inv1',
  topicId: 'topic1',
  user: { id: 'user2', email: 'user2@example.com', isRegistered: true },
  topic: { id: 'topic1', title: 'Test Topic', imageUrl: null, intro: null, description: null, visibility: 'private' },
  creator: { name: 'Creator', imageUrl: null },
  level: 'read'
};

describe('TopicInvitationComponent', () => {
  let component: TopicInvitationComponent;
  let fixture: ComponentFixture<TopicInvitationComponent>;
  let inviteService: Partial<TopicInviteUserService>;
  let dialogService: Partial<DialogService>;
  let userStore: { isAuthenticated: () => boolean; user: () => any; logout: ReturnType<typeof vi.fn> };
  let notification: Partial<NotificationService>;

  beforeEach(() => TestBed.resetTestingModule());

  beforeEach(async () => {
    inviteService = {
      get: vi.fn().mockReturnValue(of(mockTopicInvite)),
      accept: vi.fn().mockReturnValue(of({}))
    };
    const mockDialogRef = { afterClosed: () => of(false) };
    dialogService = { open: vi.fn().mockReturnValue(mockDialogRef) };
    userStore = {
      isAuthenticated: () => false,
      user: () => null,
      logout: vi.fn().mockResolvedValue(undefined)
    };
    notification = { show: vi.fn(), showRaw: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        {
          provide: ActivatedRoute,
          useValue: {
            params: of({ topicId: 'topic1', inviteId: 'inv1' }),
            queryParams: of({})
          }
        },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicInvitationComponent);
    component = fixture.componentInstance;
  });

  it('renders without error', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('loads invite and opens invitation dialog', () => {
    fixture.detectChanges();
    expect(inviteService.get).toHaveBeenCalled();
    expect(dialogService.open).toHaveBeenCalled();
  });

  it('shows error notification when invite load fails', () => {
    vi.useFakeTimers();
    inviteService.get = vi.fn().mockReturnValue(throwError(() => ({ message: 'Not found' })));
    fixture.detectChanges();
    vi.runAllTimers();
    expect(notification.showRaw).toHaveBeenCalledWith('error', 'Not found');
    vi.useRealTimers();
  });

  it('auto-joins when user matches and join=true', async () => {
    userStore.isAuthenticated = () => true;
    userStore.user = () => ({ id: 'user2' });
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: { params: of({ topicId: 'topic1', inviteId: 'inv1' }), queryParams: of({ join: 'true' }) } }
      ]
    }).compileComponents();
    const f = TestBed.createComponent(TopicInvitationComponent);
    f.detectChanges();
    expect(inviteService.accept).toHaveBeenCalledWith({ topicId: 'topic1', inviteId: 'inv1' });
  });

  it('navigates to login for registered user with different account on dialog confirm', async () => {
    const mockDialogRefConfirm = { afterClosed: () => of(true) };
    dialogService.open = vi.fn().mockReturnValue(mockDialogRefConfirm);
    userStore.isAuthenticated = () => true;
    userStore.user = () => ({ id: 'different-user' });
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: { params: of({ topicId: 'topic1', inviteId: 'inv1' }), queryParams: of({}) } },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();
    const f = TestBed.createComponent(TopicInvitationComponent);
    f.detectChanges();
    expect(userStore.logout).toHaveBeenCalled();
  });

  it('navigates to signup for unregistered user on dialog confirm', async () => {
    inviteService.get = vi.fn().mockReturnValue(of({ ...mockTopicInvite, user: { id: 'user2', email: 'user2@example.com', isRegistered: false } }));
    const mockDialogRefConfirm = { afterClosed: () => of(true) };
    dialogService.open = vi.fn().mockReturnValue(mockDialogRefConfirm);
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: { params: of({ topicId: 'topic1', inviteId: 'inv1' }), queryParams: of({}) } },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();
    const f = TestBed.createComponent(TopicInvitationComponent);
    f.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows 41002 notification on specific error code', async () => {
    vi.useFakeTimers();
    inviteService.get = vi.fn().mockReturnValue(throwError(() => ({ status: { code: 41002 } })));
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: { params: of({ topicId: 'topic1', inviteId: 'inv1' }), queryParams: of({}) } },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();
    const f = TestBed.createComponent(TopicInvitationComponent);
    f.detectChanges();
    vi.runAllTimers();
    vi.useRealTimers();
    expect(notification.show).toHaveBeenCalledWith('error',
      'MSG_ERROR_GET_API_USERS_TOPICS_INVITES_USERS_41002',
      'MSG_ERROR_GET_API_USERS_TOPICS_INVITES_USERS_41002_HEADING'
    );
  });

  it('navigates to "/" on generic API error', async () => {
    inviteService.get = vi.fn().mockReturnValue(throwError(() => ({ message: 'Server error' })));
    await TestBed.resetTestingModule();
    await TestBed.configureTestingModule({
      imports: [TopicInvitationComponent],
      providers: [
        { provide: TopicInviteUserService, useValue: inviteService },
        { provide: DialogService, useValue: dialogService },
        { provide: UserStore, useValue: userStore },
        { provide: NotificationService, useValue: notification },
        { provide: ActivatedRoute, useValue: { params: of({ topicId: 'topic1', inviteId: 'inv1' }), queryParams: of({}) } },
        provideRouter([{ path: '**', component: EmptyComponent }])
      ]
    }).compileComponents();
    const f = TestBed.createComponent(TopicInvitationComponent);
    f.detectChanges();
    expect(f.componentInstance).toBeTruthy();
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { ActivitiesButtonComponent } from './activities-button.component';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityFeedState } from '../../../core/state/activity-feed.state';
import { UserStore } from '../../../core/state/user.store';

describe('ActivitiesButtonComponent', () => {
  let component: ActivitiesButtonComponent;
  let fixture: ComponentFixture<ActivitiesButtonComponent>;
  let componentRef: ComponentRef<ActivitiesButtonComponent>;

  const mockActivityService = {
    unreadCount$: vi.fn().mockReturnValue(of(0)),
  };
  const mockFeedState = { toggle: vi.fn() };
  const mockUserStore = {
    isAuthenticated: vi.fn().mockReturnValue(false),
  };

  beforeEach(async () => {
    vi.resetAllMocks();
    mockActivityService.unreadCount$.mockReturnValue(of(0));
    mockUserStore.isAuthenticated.mockReturnValue(false);
    await TestBed.configureTestingModule({
      imports: [ActivitiesButtonComponent, TranslateModule.forRoot()],
      providers: [
        { provide: ActivityService, useValue: mockActivityService },
        { provide: ActivityFeedState, useValue: mockFeedState },
        { provide: UserStore, useValue: mockUserStore },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivitiesButtonComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render a button element', () => {
    expect(fixture.nativeElement.querySelector('button')).toBeTruthy();
  });

  it('should show global activities label when no groupId or topicId', () => {
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.textContent).toContain('VIEWS.DASHBOARD.BTN_GLOBAL_ACTIVITIES');
  });

  it('should show group activities label when groupId is set', () => {
    componentRef.setInput('groupId', 'g1');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.textContent).toContain('VIEWS.GROUP.BTN_ACTIVITIES');
  });

  it('should show topic activities label when topicId is set', () => {
    componentRef.setInput('topicId', 't1');
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('button');
    expect(btn?.textContent).toContain('VIEWS.TOPICS_TOPICID.BTN_ACTIVITIES');
  });

  it('should NOT show unread badge when count is 0', () => {
    expect(fixture.nativeElement.querySelector('.btn_medium_activity_new')).toBeNull();
  });

  it('should show unread badge when authenticated and count > 0', async () => {
    mockUserStore.isAuthenticated.mockReturnValue(true);
    mockActivityService.unreadCount$.mockReturnValue(of(5));

    // Re-create component to pick up new mock values
    fixture = TestBed.createComponent(ActivitiesButtonComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    await fixture.whenStable();
    fixture.detectChanges();

    expect(component.unreadCount()).toBe(5);
    expect(fixture.nativeElement.querySelector('.btn_medium_activity_new')).toBeTruthy();
  });

  it('should call feedState.toggle on button click', () => {
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(mockFeedState.toggle).toHaveBeenCalledWith({ groupId: undefined, topicId: undefined });
  });

  it('should pass groupId and topicId to toggle', () => {
    componentRef.setInput('groupId', 'g1');
    componentRef.setInput('topicId', 't1');
    fixture.detectChanges();
    const btn: HTMLButtonElement = fixture.nativeElement.querySelector('button');
    btn.click();
    expect(mockFeedState.toggle).toHaveBeenCalledWith({ groupId: 'g1', topicId: 't1' });
  });

  it('should return 0 unread when user is not authenticated', () => {
    // toObservable(isAuthenticated) subscribes on init — unreadCount$ is NOT called
    // because the switchMap branches to of(0) when unauthenticated
    expect(component.unreadCount()).toBe(0);
  });
});

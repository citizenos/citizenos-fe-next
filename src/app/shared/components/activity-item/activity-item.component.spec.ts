import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityItemComponent } from './activity-item.component';
import { ActivityService, ActivityGroup, ActivityItem } from '../../../core/services/activity.service';
import { ActivityFeedState } from '../../../core/state/activity-feed.state';

const MOCK_ACTIVITY = {
  isNew: false,
  updatedAt: '2024-01-15T10:00:00Z',
  string: 'ACTIVITY.TOPIC_CREATED',
  values: { className: 'discussion', topicTitle: 'My Topic' },
} as unknown as ActivityItem;

const SINGLE_GROUP: ActivityGroup = {
  referer: 'ACTIVITY.TOPIC_CREATED',
  values: [MOCK_ACTIVITY],
};

const MULTI_GROUP: ActivityGroup = {
  referer: 'USERACTIVITYGROUP:ACTIVITY.TOPIC_CREATED',
  values: [MOCK_ACTIVITY, { ...MOCK_ACTIVITY }],
};

describe('ActivityItemComponent', () => {
  let component: ActivityItemComponent;
  let fixture: ComponentFixture<ActivityItemComponent>;
  let componentRef: ComponentRef<ActivityItemComponent>;

  const mockActivityService = {
    handleActivityRedirect: vi.fn(),
    showActivityUpdateVersions: vi.fn().mockReturnValue(false),
  };
  const mockFeedState = { close: vi.fn() };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ActivityItemComponent, TranslateModule.forRoot()],
      providers: [
        provideHttpClient(),
        provideRouter([]),
        { provide: ActivityService, useValue: mockActivityService },
        { provide: ActivityFeedState, useValue: mockFeedState },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(ActivityItemComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('activityGroup', SINGLE_GROUP);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render activity link', () => {
    expect(fixture.nativeElement.querySelector('.activity_wrap')).toBeTruthy();
  });

  it('should show the rendered date', () => {
    const dateEl = fixture.nativeElement.querySelector('.date');
    expect(dateEl?.textContent?.trim()).toContain('2024-01-15');
  });

  it('should NOT show new-activity indicator when isNew is false', () => {
    expect(fixture.nativeElement.querySelector('#new_activity')).toBeNull();
  });

  it('should show new-activity indicator when isNew is true', () => {
    componentRef.setInput('activityGroup', {
      ...SINGLE_GROUP,
      values: [{ ...MOCK_ACTIVITY, isNew: true }],
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#new_activity')).toBeTruthy();
  });

  it('should render single activity translation for a group with one value', () => {
    // TranslateModule returns the key when no translations are loaded
    const content = fixture.nativeElement.querySelector('.activity_content');
    expect(content).toBeTruthy();
  });

  it('should render group translation when group has multiple values', () => {
    componentRef.setInput('activityGroup', MULTI_GROUP);
    fixture.detectChanges();
    const content = fixture.nativeElement.querySelector('.activity_content');
    expect(content).toBeTruthy();
  });

  it('should show version diffs when showActivityUpdateVersions returns true', () => {
    mockActivityService.showActivityUpdateVersions.mockReturnValue(true);
    // Re-set the input to trigger OnPush change detection
    componentRef.setInput('activityGroup', { ...SINGLE_GROUP });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.activity_content i')).toBeTruthy();
  });

  it('should call redirect and close feed when activity link is clicked', () => {
    const link: HTMLElement = fixture.nativeElement.querySelector('.activity_wrap');
    link.click();
    expect(mockActivityService.handleActivityRedirect).toHaveBeenCalledWith(MOCK_ACTIVITY);
    expect(mockFeedState.close).toHaveBeenCalled();
  });

  it('count getter returns number of values in group', () => {
    componentRef.setInput('activityGroup', MULTI_GROUP);
    fixture.detectChanges();
    expect(component.count).toBe(2);
  });

  it('activity getter returns first value in group', () => {
    expect(component.activity).toBe(MOCK_ACTIVITY);
  });

  it('should render icon for discussion className', () => {
    // The template renders SVG icon based on className
    const iconArea = fixture.nativeElement.querySelector('.activity_icon');
    expect(iconArea).toBeTruthy();
    expect(iconArea.querySelector('svg')).toBeTruthy();
  });
});

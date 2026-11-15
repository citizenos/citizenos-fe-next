import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService, ActivityItem } from './activity.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('ActivityService', () => {
  let service: ActivityService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        ActivityService,
        ConfigStore,
        UserStore,
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(ActivityService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should filter out USER_VIEW_ACTIVITY and use it to determine isNew on other activities', () => {
    const mockActivities: ActivityItem[] = [
      {
        id: 'act-new-1',
        updatedAt: '2026-11-15T12:00:00.000Z',
        data: {
          type: 'Create',
          actor: { type: 'User', name: 'Alice' },
          object: { '@type': 'Topic', title: 'New Topic' }
        }
      },
      {
        id: 'view-act',
        updatedAt: '2026-11-15T10:00:00.000Z',
        data: {
          type: 'View',
          actor: { type: 'User' },
          object: { '@type': 'Activity' }
        }
      },
      {
        id: 'act-old-1',
        updatedAt: '2026-11-15T08:00:00.000Z',
        data: {
          type: 'Create',
          actor: { type: 'User', name: 'Bob' },
          object: { '@type': 'Topic', title: 'Old Topic' }
        }
      }
    ];

    let resultGroups: unknown[] = [];
    service.loadItems({ topicId: 't1' }).subscribe(groups => {
      resultGroups = groups;
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/topics/t1/activities'));
    req.flush({ status: { code: 200, message: 'OK' }, data: mockActivities });

    // USER_VIEW_ACTIVITY must NOT be included in the displayed groups
    expect(resultGroups.length).toBe(2);

    const ids = (resultGroups as { values: ActivityItem[] }[]).map(g => g.values[0].id);
    expect(ids).not.toContain('view-act');
    expect(ids).toContain('act-new-1');
    expect(ids).toContain('act-old-1');

    // Newer than lastViewTime (10:00:00) should be isNew: true
    const newActGroup = (resultGroups as { values: ActivityItem[] }[]).find(g => g.values[0].id === 'act-new-1');
    expect(newActGroup?.values[0].isNew).toBe(true);

    // Older than lastViewTime (10:00:00) should be isNew: false
    const oldActGroup = (resultGroups as { values: ActivityItem[] }[]).find(g => g.values[0].id === 'act-old-1');
    expect(oldActGroup?.values[0].isNew).toBe(false);
  });

  it('should sort activity groups newest first (descending)', () => {
    const items: ActivityItem[] = [
      {
        id: 'act-older',
        updatedAt: '2026-11-15T08:00:00.000Z',
        data: { type: 'Create', object: { '@type': 'Topic' } }
      },
      {
        id: 'act-newer',
        updatedAt: '2026-11-15T12:00:00.000Z',
        data: { type: 'Create', object: { '@type': 'Topic' } }
      }
    ];

    const groups = service.activitiesToGroups(items);
    expect(groups[0].values[0].id).toBe('act-newer');
    expect(groups[1].values[0].id).toBe('act-older');
  });
});

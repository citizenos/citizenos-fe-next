import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { TopicMemberGroupService, TopicMemberGroup } from './topic-member-group.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';

describe('TopicMemberGroupService', () => {
  let service: TopicMemberGroupService;
  let httpMock: HttpTestingController;

  const mockConfigStore = {
    api: {
      baseUrl: vi.fn().mockReturnValue('http://localhost:3000')
    }
  };

  const mockUserStore = {
    isAuthenticated: vi.fn().mockReturnValue(true)
  };

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        TopicMemberGroupService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: UserStore, useValue: mockUserStore }
      ]
    });

    service = TestBed.inject(TopicMemberGroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should unwrap rows array when API returns { countTotal, count, rows }', () => {
    const mockGroups: TopicMemberGroup[] = [
      { id: 'g1', name: 'Group 1', level: 'read', visibility: 'public' }
    ];

    service.loadItems('topic-123').subscribe((groups) => {
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe('g1');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/self/topics/topic-123/members/groups');
    expect(req.request.method).toBe('GET');
    req.flush({
      status: { code: 200, message: 'OK' },
      data: {
        countTotal: 1,
        count: 1,
        rows: mockGroups
      }
    });
  });

  it('should handle direct array when API returns an array in data', () => {
    const mockGroups: TopicMemberGroup[] = [
      { id: 'g2', name: 'Group 2', level: 'admin' }
    ];

    service.loadItems('topic-123').subscribe((groups) => {
      expect(Array.isArray(groups)).toBe(true);
      expect(groups.length).toBe(1);
      expect(groups[0].id).toBe('g2');
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/self/topics/topic-123/members/groups');
    req.flush({
      status: { code: 200, message: 'OK' },
      data: mockGroups
    });
  });

  it('should return empty array if data or rows is missing or empty', () => {
    service.loadItems('topic-123').subscribe((groups) => {
      expect(Array.isArray(groups)).toBe(true);
      expect(groups).toEqual([]);
    });

    const req = httpMock.expectOne('http://localhost:3000/api/users/self/topics/topic-123/members/groups');
    req.flush({
      status: { code: 200, message: 'OK' },
      data: { countTotal: 0, count: 0, rows: [] }
    });
  });
});

import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { IdeaAttachmentService } from './idea-attachment.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';

describe('IdeaAttachmentService', () => {
  let service: IdeaAttachmentService;
  let httpMock: HttpTestingController;

  const mockConfigStore = {
    api: {
      baseUrl: vi.fn().mockReturnValue('http://localhost:3000')
    }
  };

  const mockUserStore = {
    isAuthenticated: vi.fn()
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockUserStore.isAuthenticated.mockReturnValue(true);

    TestBed.configureTestingModule({
      providers: [
        IdeaAttachmentService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: UserStore, useValue: mockUserStore }
      ]
    });

    service = TestBed.inject(IdeaAttachmentService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('uses /api/users/self when user is authenticated in getItems', () => {
    mockUserStore.isAuthenticated.mockReturnValue(true);

    service.getItems({
      topicId: 'topic1',
      ideationId: 'ideation1',
      ideaId: 'idea1',
      limit: 100,
      page: 1,
      offset: 0
    }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3000/api/users/self/topics/topic1/ideations/ideation1/ideas/idea1/attachments');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('limit')).toBe('100');
    expect(req.request.params.get('offset')).toBe('0');
    req.flush({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } });
  });

  it('uses /api when user is not authenticated in getItems', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);

    service.getItems({
      topicId: 'topic1',
      ideationId: 'ideation1',
      ideaId: 'idea1',
      limit: 100,
      page: 1,
      offset: 0
    }).subscribe();

    const req = httpMock.expectOne((r) => r.url === 'http://localhost:3000/api/topics/topic1/ideations/ideation1/ideas/idea1/attachments');
    expect(req.request.method).toBe('GET');
    req.flush({ status: { code: 20000, message: 'Success' }, data: { rows: [], count: 0 } });
  });
});

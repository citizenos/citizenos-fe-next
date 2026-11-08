import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

import { TopicIdeationService } from './topic-ideation.service';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';

describe('TopicIdeationService', () => {
  let service: TopicIdeationService;
  let httpMock: HttpTestingController;

  const mockConfigStore = {
    api: {
      baseUrl: vi.fn().mockReturnValue('http://localhost:3000')
    }
  };

  const mockUserStore = {
    isAuthenticated: vi.fn().mockReturnValue(true)
  };

  const mockTopicService = {};

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      providers: [
        TopicIdeationService,
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    });

    service = TestBed.inject(TopicIdeationService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('includes abuse in IDEA_REPORT_TYPES and COMMENT_REPORT_TYPES', () => {
    expect(service.IDEA_REPORT_TYPES).toEqual({
      abuse: 'abuse',
      obscene: 'obscene',
      spam: 'spam',
      hate: 'hate',
      duplicate: 'duplicate',
      other: 'other'
    });
    expect(service.COMMENT_REPORT_TYPES).toEqual(service.IDEA_REPORT_TYPES);
  });

  it('reportIdea posts report to /api/users/self/topics/:topicId/ideations/:ideationId/ideas/:ideaId/reports', () => {
    service.reportIdea({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
      type: 'spam',
      text: 'Spam idea'
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/users/self/topics/t1/ideations/i1/ideas/idea1/reports');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ type: 'spam', text: 'Spam idea' });
    req.flush({ status: { code: 20000, message: 'OK' }, data: { id: 'rep1', type: 'spam', text: 'Spam idea' } });
  });

  it('getIdeaReport calls /api/topics/:topicId/ideations/:ideationId/ideas/:ideaId/reports/:reportId with Bearer token header', () => {
    service.getIdeaReport({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
      reportId: 'rep1',
      token: 'jwt-token-123'
    }).subscribe();

    const req = httpMock.expectOne(
      r => r.url === 'http://localhost:3000/api/topics/t1/ideations/i1/ideas/idea1/reports/rep1'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-123');
    expect(req.request.params.get('token')).toBe('jwt-token-123');
    req.flush({ status: { code: 20000, message: 'OK' }, data: { id: 'rep1', type: 'spam', text: 'Spam' } });
  });

  it('moderateIdea posts { type, text } to /api/topics/:topicId/ideations/:ideationId/ideas/:ideaId/reports/:reportId/moderate with Bearer token header', () => {
    service.moderateIdea({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
      reportId: 'rep1',
      token: 'jwt-token-123',
      report: { type: 'spam', text: 'Moderated spam idea' }
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/topics/t1/ideations/i1/ideas/idea1/reports/rep1/moderate');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-123');
    expect(req.request.body).toEqual({ type: 'spam', text: 'Moderated spam idea' });
    req.flush({ status: { code: 20000, message: 'OK' }, data: {} });
  });

  it('getIdeaCommentReport calls /api/topics/:topicId/ideations/:ideationId/ideas/:ideaId/comments/:commentId/reports/:reportId with Bearer token header', () => {
    service.getIdeaCommentReport({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
      commentId: 'c1',
      reportId: 'rep2',
      token: 'jwt-token-456'
    }).subscribe();

    const req = httpMock.expectOne(
      r => r.url === 'http://localhost:3000/api/topics/t1/ideations/i1/ideas/idea1/comments/c1/reports/rep2'
    );
    expect(req.request.method).toBe('GET');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-456');
    expect(req.request.params.get('token')).toBe('jwt-token-456');
    req.flush({ status: { code: 20000, message: 'OK' }, data: { id: 'rep2', type: 'abuse', text: 'Abuse' } });
  });

  it('moderateIdeaComment posts { type, text } to /api/topics/:topicId/ideations/:ideationId/ideas/:ideaId/comments/:commentId/reports/:reportId/moderate with Bearer token header', () => {
    service.moderateIdeaComment({
      topicId: 't1',
      ideationId: 'i1',
      ideaId: 'idea1',
      commentId: 'c1',
      reportId: 'rep2',
      token: 'jwt-token-456',
      report: { type: 'abuse', text: 'Moderated abusive reply' }
    }).subscribe();

    const req = httpMock.expectOne('http://localhost:3000/api/topics/t1/ideations/i1/ideas/idea1/comments/c1/reports/rep2/moderate');
    expect(req.request.method).toBe('POST');
    expect(req.request.headers.get('Authorization')).toBe('Bearer jwt-token-456');
    expect(req.request.body).toEqual({ type: 'abuse', text: 'Moderated abusive reply' });
    req.flush({ status: { code: 20000, message: 'OK' }, data: {} });
  });
});

import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicViewComponent } from './topic-view.component';
import { TranslateModule } from '@ngx-translate/core';
import { provideRouter, ActivatedRoute } from '@angular/router';
import { of, BehaviorSubject } from 'rxjs';
import { HttpClientTestingModule } from '@angular/common/http/testing';

import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { TopicEventService } from '../../../core/services/topic-event.service';

describe('TopicViewComponent', () => {
  let component: TopicViewComponent;
  let fixture: ComponentFixture<TopicViewComponent>;
  
  const mockTopic = {
    id: '123',
    title: 'Test Topic',
    status: 'inProgress',
    permission: { level: 'admin' },
    categories: []
  };

  const mockTopicService = {
    STATUSES: {
      draft: 'draft',
      ideation: 'ideation',
      inProgress: 'inProgress',
      voting: 'voting',
      followUp: 'followUp',
      closed: 'closed'
    },
    LEVELS: {
      admin: 'admin'
    },
    VISIBILITY: {
      public: 'public'
    },
    loadTopic: vi.fn().mockReturnValue(of(mockTopic)),
    reloadTopic: () => {},
    canDelete: () => true,
    canEdit: () => true
  };

  const activatedRouteStub = {
    params: new BehaviorSubject({ topicId: '123' }),
    queryParams: new BehaviorSubject({})
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicViewComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule
      ],
      providers: [
        provideRouter([]),
        { provide: ActivatedRoute, useValue: activatedRouteStub },
        { provide: TopicService, useValue: mockTopicService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicViewComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should load topic on init', () => {
    expect(mockTopicService.loadTopic).toHaveBeenCalledWith('123');
    expect(component.topic()?.id).toEqual('123');
  });

  it('should handle tab selection correctly', () => {
    component.selectTab('discussion');
    expect(component.tabSelected()).toBe('discussion');
  });
});

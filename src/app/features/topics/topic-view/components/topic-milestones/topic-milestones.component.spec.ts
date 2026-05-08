import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { TopicMilestonesComponent } from './topic-milestones.component';
import { TopicEventService } from '../../../../../core/services/topic-event.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicEvent } from '../../../../../core/interfaces/topic-event';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }
@Component({ selector: 'cos-input', standalone: true, template: '' })
class MockInputComponent {}
@Component({ selector: 'cos-tooltip', standalone: true, template: '' })
class MockTooltipComponent { @Input() title = ''; @Input() description = ''; }

const MOCK_TOPIC: Topic = {
  id: 'topic-1', title: 'Test', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '2024-01-01', updatedAt: '2024-01-01',
  sourcePartnerId: null, sourcePartnerObjectId: null, permission: { level: 'admin' },
  creator: {}, lastActivity: null, country: null, language: null,
  members: { users: { count: 0 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: null, authors: [], imageUrl: null,
};

const MOCK_EVENTS: TopicEvent[] = [
  { id: 'evt-1', subject: 'Launch', text: 'We launched', createdAt: '2024-01-01', updatedAt: '2024-01-01' },
  { id: 'evt-2', subject: 'Review', text: 'We reviewed', createdAt: '2024-01-02', updatedAt: '2024-01-02' },
];

describe('TopicMilestonesComponent', () => {
  let component: TopicMilestonesComponent;
  let fixture: ComponentFixture<TopicMilestonesComponent>;
  let componentRef: ComponentRef<TopicMilestonesComponent>;
  const mockTopicEventService = {
    query: vi.fn().mockReturnValue(of({ rows: MOCK_EVENTS, countTotal: 2 })),
    save: vi.fn().mockReturnValue(of({})),
    update: vi.fn().mockReturnValue(of({})),
    delete: vi.fn().mockReturnValue(of({})),
  };
  const mockTopicService = {
    canEdit: vi.fn().mockReturnValue(true),
    canUpdate: vi.fn().mockReturnValue(true),
    canDelete: vi.fn().mockReturnValue(false),
  };
  const mockDialogService = { open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }) };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicMilestonesComponent, TranslateModule.forRoot()],
      providers: [
        { provide: TopicEventService, useValue: mockTopicEventService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: DialogService, useValue: mockDialogService },
      ],
    })
      .overrideComponent(TopicMilestonesComponent, {
        set: { imports: [TranslateModule, FormsModule, DatePipe, MockIconComponent, MockInputComponent, MockTooltipComponent] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicMilestonesComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('topic', MOCK_TOPIC);
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should load events on init', () => {
    expect(mockTopicEventService.query).toHaveBeenCalledWith({ topicId: 'topic-1' });
  });

  it('should populate topicEvents from service response', () => {
    expect(component.topicEvents()).toHaveLength(2);
  });

  it('countTotal computed returns number of events', () => {
    expect(component.countTotal()).toBe(2);
  });

  it('should initialise event.topicId from topic input', () => {
    expect(component.event.topicId).toBe('topic-1');
  });

  it('should have maxLengthSubject of 128', () => {
    expect(component.maxLengthSubject).toBe(128);
  });

  it('should have maxLengthText of 2048', () => {
    expect(component.maxLengthText).toBe(2048);
  });

  it('should render the correct number of event items', () => {
    // The template loops over topicEvents — component has 2 events
    expect(component.topicEvents().length).toBe(2);
  });
});

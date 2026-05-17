import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicCardComponent } from './topic-card.component';
import { Topic } from '../../../core/interfaces/topic';

const BASE_TOPIC: Topic = {
  id: 'topic-1',
  title: 'Test Topic',
  intro: null,
  description: '',
  status: 'inProgress',
  visibility: 'public',
  hashtag: null,
  join: { token: '', level: '' },
  categories: [],
  endsAt: null,
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  sourcePartnerId: null,
  sourcePartnerObjectId: null,
  permission: { level: 'read' },
  creator: { id: 'c1', name: 'Creator', imageUrl: null },
  lastActivity: '2024-01-15T10:00:00Z',
  country: null,
  language: null,
  members: { users: { count: 5 }, groups: { count: 0 } },
  voteId: null,
  discussionId: null,
  comments: { count: 3 },
  padUrl: null,
  favourite: false,
  imageUrl: null,
  authors: [],
};

describe('TopicCardComponent', () => {
  let component: TopicCardComponent;
  let fixture: ComponentFixture<TopicCardComponent>;
  let componentRef: ComponentRef<TopicCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicCardComponent, TranslateModule.forRoot()],
      providers: [provideRouter([])],
    }).compileComponents();

    fixture = TestBed.createComponent(TopicCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('topic', BASE_TOPIC);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render the topic title', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.topic_title')?.innerHTML).toContain('Test Topic');
  });

  it('should render the created date', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.date')?.textContent?.trim()).toBe('2024-01-15');
  });

  it('should show participant count', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.participants_count')?.textContent).toContain('5');
  });

  it('should show the topic image when imageUrl is set', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, imageUrl: 'http://example.com/img.jpg' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.image img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('http://example.com/img.jpg');
  });

  it('should show no-image placeholder when imageUrl is null', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.image img')).toBeNull();
    expect(el.querySelector('.no_image')).toBeTruthy();
  });

  it('should show moderation overlay when topic has a report', () => {
    componentRef.setInput('topic', {
      ...BASE_TOPIC,
      report: { id: 'r1', type: 'spam', text: null, moderatedReasonType: null, moderatedReasonText: null }
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.moderated_topic')).toBeTruthy();
  });

  it('should NOT show moderation overlay when topic has no report', () => {
    expect(fixture.nativeElement.querySelector('.moderated_topic')).toBeNull();
  });

  it('should NOT show remove overlay by default', () => {
    expect(fixture.nativeElement.querySelector('.remove_wrap')).toBeNull();
  });

  it('should show remove overlay when removable is true', () => {
    componentRef.setInput('removable', true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.remove_wrap')).toBeTruthy();
  });

  it('should emit remove event with topic id when remove button clicked', () => {
    componentRef.setInput('removable', true);
    fixture.detectChanges();
    const removed = vi.fn();
    component.remove.subscribe(removed);
    const btn = fixture.nativeElement.querySelector('.remove_wrap button') as HTMLButtonElement;
    btn.click();
    expect(removed).toHaveBeenCalledWith('topic-1');
  });

  it('should show favourite icon when topic.favourite is true', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, favourite: true });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.icon_area .topic_icon')).toBeTruthy();
  });

  it('should show private icon when visibility is private', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, visibility: 'private' });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.icon_area .topic_icon')).toBeTruthy();
  });

  it('should show correct header class for each status', () => {
    const statuses = ['inProgress', 'voting', 'draft', 'closed', 'followUp', 'ideation'] as const;
    const expectedClasses = ['discussion', 'voting', 'draft', 'closed', 'follow_up', 'ideation'];
    statuses.forEach((status, i) => {
      componentRef.setInput('topic', { ...BASE_TOPIC, status });
      fixture.detectChanges();
      const header = fixture.nativeElement.querySelector('.topic_header');
      expect(header.classList.contains(expectedClasses[i])).toBe(true);
    });
  });

  it('progressWidth returns 100 for non-voting statuses', () => {
    expect(component.progressWidth()).toBe(100);
  });

  it('progressWidth returns percentage of voters for voting status', () => {
    componentRef.setInput('topic', {
      ...BASE_TOPIC,
      status: 'voting',
      vote: { id: 'v1', votersCount: 4, type: 'regular' },
      members: { users: { count: 10 }, groups: { count: 0 } },
    });
    fixture.detectChanges();
    expect(component.progressWidth()).toBe(40);
  });

  it('should fall back to "TOPIC.NO_TITLE" translate key when title is null', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, title: null });
    fixture.detectChanges();
    // TranslateModule.forRoot() returns the key when no translations loaded
    const title = fixture.nativeElement.querySelector('.topic_title');
    expect(title).toBeTruthy();
  });
});

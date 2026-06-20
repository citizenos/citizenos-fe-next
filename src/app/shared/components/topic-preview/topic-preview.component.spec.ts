import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { TopicPreviewComponent } from './topic-preview.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Topic } from '../../../core/interfaces/topic';

describe('TopicPreviewComponent', () => {
  let component: TopicPreviewComponent;
  let fixture: ComponentFixture<TopicPreviewComponent>;

  const mockTopic: Topic = {
    id: 'topic-1', title: 'Preview Topic', intro: 'Introduction text',
    description: '<html></html>', status: 'draft', visibility: 'public',
    hashtag: null, join: { token: '', level: '' },
    categories: ['education', 'science'], endsAt: null, createdAt: '', updatedAt: '',
    sourcePartnerId: null, sourcePartnerObjectId: null,
    permission: { level: 'admin' }, creator: { id: '', name: '' }, lastActivity: null,
    country: 'Estonia', language: 'Estonian',
    members: { users: { count: 1 }, groups: { count: 0 } },
    voteId: null, discussionId: null, comments: null, padUrl: '',
    imageUrl: 'https://example.com/image.jpg', authors: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicPreviewComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicPreviewComponent);
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display topic title', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.main_heading');
    expect(title.textContent).toContain('Preview Topic');
  });

  it('should display intro', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    const intro = fixture.nativeElement.querySelector('.topic_intro');
    expect(intro.textContent).toContain('Introduction text');
  });

  it('should display image when imageUrl is set', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.topic_image img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('example.com/image.jpg');
  });


});

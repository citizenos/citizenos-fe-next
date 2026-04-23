import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { TopicPreviewComponent } from './topic-preview.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Topic } from '../../../core/interfaces/topic';

describe('TopicPreviewComponent', () => {
  let component: TopicPreviewComponent;
  let fixture: ComponentFixture<TopicPreviewComponent>;
  let ref: ComponentRef<TopicPreviewComponent>;

  const mockTopic: Topic = {
    id: 'topic-1', title: 'Preview Topic', intro: 'Introduction text',
    description: '<html></html>', status: 'draft', visibility: 'public',
    hashtag: null, join: { token: '', level: '' },
    categories: ['education', 'science'], endsAt: null, createdAt: '', updatedAt: '',
    sourcePartnerId: null, sourcePartnerObjectId: null,
    permission: { level: 'admin' }, creator: {}, lastActivity: null,
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
    ref = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should display topic title', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.preview-title');
    expect(title.textContent).toContain('Preview Topic');
  });

  it('should display intro', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    const intro = fixture.nativeElement.querySelector('.preview-intro');
    expect(intro.textContent).toContain('Introduction text');
  });

  it('should display image when imageUrl is set', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.preview-image img');
    expect(img).toBeTruthy();
    expect(img.src).toContain('example.com/image.jpg');
  });

  it('should display categories', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    const tags = fixture.nativeElement.querySelectorAll('.category-tag');
    expect(tags.length).toBe(2);
  });

  it('should display country and language', () => {
    ref.setInput('topic', mockTopic);
    fixture.detectChanges();
    const metaValues = fixture.nativeElement.querySelectorAll('.meta-value');
    const texts = Array.from(metaValues).map((el: any) => el.textContent.trim());
    expect(texts).toContain('public');
    expect(texts).toContain('Estonia');
    expect(texts).toContain('Estonian');
  });

  it('should display groups when provided', () => {
    ref.setInput('topic', mockTopic);
    ref.setInput('topicGroups', [{ id: 'g1', name: 'Test Group' }]);
    fixture.detectChanges();
    const chips = fixture.nativeElement.querySelectorAll('.group-chip');
    expect(chips.length).toBe(1);
    expect(chips[0].textContent.trim()).toBe('Test Group');
  });
});

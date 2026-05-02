import { vi, describe, it, expect, beforeEach } from 'vitest';
(globalThis as any).ResizeObserver = class {
  observe() {}
  unobserve() {}
  disconnect() {}
};
(globalThis as any).HTMLElement.prototype.scrollIntoView = vi.fn();
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicContentComponent } from './topic-content.component';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { Topic } from '../../../../../core/interfaces/topic';

describe('TopicContentComponent', () => {
  let component: TopicContentComponent;
  let fixture: ComponentFixture<TopicContentComponent>;
  let componentRef: ComponentRef<TopicContentComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicContentComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicContentComponent);
    component = fixture.componentInstance; componentRef = fixture.componentRef;
    componentRef = fixture.componentRef;
    
    component.topic.set({
      id: '123', title: 'Topic Title', intro: 'Short intro',
      description: '<p>Long description here...</p>', imageUrl: 'http://example.com/img.jpg',
      updatedAt: '2023', permission: { level: 'admin' }, status: 'inProgress',
      visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
      endsAt: null, createdAt: '', sourcePartnerId: null, sourcePartnerObjectId: null,
      creator: {}, lastActivity: null, country: null, language: null,
      members: { users: { count: 1 }, groups: { count: 0 } },
      voteId: null, discussionId: null, comments: null, padUrl: '', authors: []
    } as Topic);
    
    component.tabTablet.set('');
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display topic title', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    const titleElement = compiled.querySelector('.main_heading');
    expect(titleElement?.textContent).toContain('Topic Title');
  });

  it('should hide intro and content if tabTablet is set', () => {
    component.tabTablet.set('discussion');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const introElement = compiled.querySelector('.topic_intro');
    const contentElement = compiled.querySelector('.topic_content');
    
    expect(introElement).toBeFalsy();
    expect(contentElement).toBeFalsy();
  });

  it('should toggle readMore state when toggleReadMore is called', () => {
    expect(component.readMore()).toBeFalsy();
    component.toggleReadMore();
    expect(component.readMore()).toBeTruthy();
    component.toggleReadMore();
    expect(component.readMore()).toBeFalsy();
  });
});

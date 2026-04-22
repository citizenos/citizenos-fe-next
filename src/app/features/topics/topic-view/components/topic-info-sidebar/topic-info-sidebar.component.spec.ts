import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicInfoSidebarComponent } from './topic-info-sidebar.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';

describe('TopicInfoSidebarComponent', () => {
  let component: TopicInfoSidebarComponent;
  let fixture: ComponentFixture<TopicInfoSidebarComponent>;
  let componentRef: ComponentRef<TopicInfoSidebarComponent>;

  const mockUserStore = {
    isAuthenticated: () => true
  };

  const mockTopicService = {
    STATUSES: { closed: 'closed' },
    VISIBILITY: { public: 'public' },
    canDelete: vi.fn().mockReturnValue(true),
    canEdit: vi.fn().mockReturnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicInfoSidebarComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule
      ],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicInfoSidebarComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('topic', {
      id: '123',
      title: 'Topic',
      visibility: 'public',
      creator: { name: 'Admin' },
      createdAt: '2023-01-01T00:00:00Z',
      country: 'EE',
      language: 'et',
      categories: ['environment'],
      permission: { level: 'admin' },
      favourite: false
    });
    
    componentRef.setInput('attachments', []);
    componentRef.setInput('groups', []);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display creator name', () => {
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('Admin');
  });

  it('should toggle options', () => {
    expect(component.showAttachments).toBeFalsy();
    component.showAttachments = true;
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.textContent).toContain('VIEWS.TOPICS_TOPICID.SECTION_INFO_NO_ATTACHMENTS');
  });
});

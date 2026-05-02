import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicInfoSidebarComponent } from './topic-info-sidebar.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { provideRouter } from '@angular/router';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, Input } from '@angular/core';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

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
    canEdit: vi.fn().mockReturnValue(true),
    canUpdate: vi.fn().mockReturnValue(true)
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicInfoSidebarComponent,
        TranslateModule.forRoot(),
        NoopAnimationsModule,
        MockIconComponent
      ],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    })
    .overrideComponent(TopicInfoSidebarComponent, {
      remove: { imports: [IconComponent] },
      add: { imports: [MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicInfoSidebarComponent);
    component = fixture.componentInstance; componentRef = fixture.componentRef;
    componentRef = fixture.componentRef;
    
    component.topic.set({
      id: '123', title: 'Topic', intro: null, description: '', status: 'inProgress',
      visibility: 'public', hashtag: null, join: { token: '', level: '' },
      categories: ['environment'], endsAt: null, createdAt: '2023-01-01T00:00:00Z',
      updatedAt: '', sourcePartnerId: null, sourcePartnerObjectId: null,
      permission: { level: 'admin' }, creator: { name: 'Admin' }, lastActivity: null,
      country: 'EE', language: 'et',
      members: { users: { count: 0 }, groups: { count: 0 } },
      voteId: null, discussionId: null, comments: null, padUrl: '',
      imageUrl: null, authors: [], favourite: false
    });
    
    component.attachments.set([]);
    component.groups.set([]);
    component.members.set([]);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});

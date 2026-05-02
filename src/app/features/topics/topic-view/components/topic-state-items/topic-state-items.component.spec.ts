import { vi } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicStateItemsComponent } from './topic-state-items.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { UserStore } from '../../../../../core/state/user.store';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { DomainIconComponent } from '../../../../../shared/components/domain-icon/domain-icon.component';
import { Component, Input } from '@angular/core';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

@Component({ selector: 'cos-domain-icon', standalone: true, template: '' })
class MockDomainIconComponent {
  @Input() type = '';
  @Input() size = 40;
}

describe('TopicStateItemsComponent', () => {
  let component: TopicStateItemsComponent;
  let fixture: ComponentFixture<TopicStateItemsComponent>;
  let componentRef: ComponentRef<TopicStateItemsComponent>;

  const mockUserStore = {
    isAuthenticated: () => true
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
    canUpdate: () => true
  };

  const mockTopicIdeationService = {
    hasIdeationEndedExpired: () => false
  };

  const mockTopicVoteService = {
    hasVoteEndedExpired: () => false
  };

  const mockTopicArgumentService = {
    count: {
      value: {
        total: 10,
        pro: 4,
        con: 3,
        poi: 2,
        reply: 1
      }
    }
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [
        TopicStateItemsComponent,
        TranslateModule.forRoot(),
        HttpClientTestingModule,
        MockIconComponent,
        MockDomainIconComponent
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicIdeationService, useValue: mockTopicIdeationService },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: TopicArgumentService, useValue: mockTopicArgumentService }
      ]
    })
    .overrideComponent(TopicStateItemsComponent, {
      remove: { imports: [IconComponent, DomainIconComponent] },
      add: { imports: [MockIconComponent, MockDomainIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicStateItemsComponent);
    component = fixture.componentInstance; componentRef = fixture.componentRef;
    componentRef = fixture.componentRef;
    
    component.topic.set({
      id: '123', status: 'inProgress', permission: { level: 'admin' },
      discussionId: '456', voteId: '789',
      title: null, intro: null, description: '', visibility: 'public', hashtag: null,
      join: { token: '', level: '' }, categories: [], endsAt: null, createdAt: '',
      updatedAt: '', sourcePartnerId: null, sourcePartnerObjectId: null, creator: {},
      lastActivity: null, country: null, language: null,
      members: { users: { count: 1 }, groups: { count: 0 } },
      comments: null, padUrl: '', imageUrl: null, authors: []
    } as Topic);
    
    component.ideation.set(null);
    component.vote.set({
      votersCount: 42
    });
    component.eventCount.set(5);
    
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should emit navigateTab on state item click', () => {
    vi.spyOn(component.navigateTab, 'emit');
    const compiled = fixture.nativeElement as HTMLElement;
    const voteItem = compiled.querySelector('.state_item.vote') as HTMLElement;
    
    expect(voteItem).toBeTruthy();
    voteItem.click();
    
    expect(component.navigateTab.emit).toHaveBeenCalledWith('voting');
  });

  it('should calculate argument percentages correctly', () => {
    // 4 pro out of 10 total = 40%
    expect(component.getArgumentPercentage(4)).toEqual(40);
  });
});

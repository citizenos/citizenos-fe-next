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
        HttpClientTestingModule
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService },
        { provide: TopicIdeationService, useValue: mockTopicIdeationService },
        { provide: TopicVoteService, useValue: mockTopicVoteService },
        { provide: TopicArgumentService, useValue: mockTopicArgumentService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicStateItemsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    
    componentRef.setInput('topic', {
      id: '123',
      status: 'inProgress',
      permission: { level: 'admin' },
      discussionId: '456',
      voteId: '789'
    });
    
    componentRef.setInput('ideation', null);
    componentRef.setInput('vote', {
      votersCount: 42
    });
    componentRef.setInput('eventCount', 5);
    
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

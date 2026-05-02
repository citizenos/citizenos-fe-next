import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter, RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicHeaderComponent } from './topic-header.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { ActivitiesButtonComponent } from '../../../../../shared/components/activities-button/activities-button.component';
import { Component, Input, output } from '@angular/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { UpperCasePipe } from '@angular/common';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent {
  @Input() name = '';
  @Input() size = 24;
  @Input() color: any;
}

@Component({ selector: 'cos-button', standalone: true, template: '<button (click)="clicked.emit($event)"><ng-content></ng-content></button>' })
class MockButtonComponent {
  @Input() variant = 'primary';
  @Input() size = 'md';
  @Input() type = 'button';
  @Input() icon: any;
  @Input() isLoading = false;
  @Input() isDisabled = false;
  clicked = output<MouseEvent>();
}

@Component({ selector: 'cos-tooltip', standalone: true, template: '<ng-content></ng-content>' })
class MockTooltipComponent {
  @Input() text = '';
  @Input() title = '';
  @Input() noIcon = false;
}

@Component({ selector: 'cos-activities-button', standalone: true, template: '' })
class MockActivitiesButtonComponent {
  @Input() topicId = '';
}

const BASE_TOPIC: Topic = {
  id: '123', title: 'Test Topic', intro: null, description: '', status: 'inProgress',
  visibility: 'public', hashtag: null, join: { token: '', level: '' }, categories: [],
  endsAt: null, createdAt: '', updatedAt: '', sourcePartnerId: null, sourcePartnerObjectId: null,
  permission: { level: 'admin' }, creator: { name: 'Test User' }, lastActivity: null,
  country: null, language: null, members: { users: { count: 1 }, groups: { count: 0 } },
  voteId: null, discussionId: null, comments: null, padUrl: '', imageUrl: null, authors: [],
  favourite: false
};

describe('TopicHeaderComponent', () => {
  let component: TopicHeaderComponent;
  let fixture: ComponentFixture<TopicHeaderComponent>;
  let componentRef: ComponentRef<TopicHeaderComponent>;

  const mockUserStore = { isAuthenticated: () => true };

  const mockTopicService = {
    STATUSES: { closed: 'closed', draft: 'draft', ideation: 'ideation', followUp: 'followUp', voting: 'voting' },
    VISIBILITY: { public: 'public' },
    canDelete: vi.fn().mockReturnValue(true),
    canEdit: vi.fn().mockReturnValue(true),
    canModerate: vi.fn().mockReturnValue(false),
    canReview: vi.fn().mockReturnValue(false),
    canResolve: vi.fn().mockReturnValue(false)
  };

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [TopicHeaderComponent, TranslateModule.forRoot(), MockIconComponent, MockButtonComponent, MockTooltipComponent, MockActivitiesButtonComponent],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    })
    .overrideComponent(TopicHeaderComponent, {
      set: {
        imports: [
          TranslateModule,
          RouterModule,
          UpperCasePipe,
          CosDropdownDirective,
          MockIconComponent,
          MockButtonComponent,
          MockTooltipComponent,
          MockActivitiesButtonComponent
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicHeaderComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    component.topic.set({ ...BASE_TOPIC });
    component.navigation.set({ title: 'Back', link: ['/'] });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Join button ---
  it('should show join button when user has no permissions', () => {
    component.topic.set({ ...BASE_TOPIC, permission: { level: 'none' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#join_button')).toBeTruthy();
  });

  it('should hide join button when user has permissions', () => {
    expect(fixture.nativeElement.querySelector('#join_button')).toBeFalsy();
  });

  it('should emit joinTopic when join button clicked', () => {
    component.topic.set({ ...BASE_TOPIC, permission: { level: 'none' } });
    fixture.detectChanges();
    vi.spyOn(component.joinTopic, 'emit');
    fixture.debugElement.query(el => el.nativeElement.id === 'join_button')
      ?.triggerEventHandler('clicked', null);
    expect(component.joinTopic.emit).toHaveBeenCalled();
  });

  // --- Permissions label ---
  it('should display permissions label when permission level is set', () => {
    expect(fixture.nativeElement.querySelector('.permissions_lable')).toBeTruthy();
  });

  it('should hide permissions label when permission level is none', () => {
    component.topic.set({ ...BASE_TOPIC, permission: { level: 'none' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.permissions_lable')).toBeFalsy();
  });

  // --- Favourite ---
  it('should emit toggleFavourite when onToggleFavourite is called', () => {
    vi.spyOn(component.toggleFavourite, 'emit');
    component.onToggleFavourite();
    expect(component.toggleFavourite.emit).toHaveBeenCalledWith(component.topic());
  });

  // --- Mobile actions panel ---
  it('should toggle mobile actions panel', () => {
    expect(component.mobileActions()).toBe(false);
    component.mobileActions.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.mobile_actions_wrap.show')).toBeTruthy();
  });

  it('should show overlay when mobile actions are open', () => {
    component.mobileActions.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.overlay')).toBeTruthy();
  });

  it('should close mobile actions when overlay is clicked', () => {
    component.mobileActions.set(true);
    fixture.detectChanges();
    fixture.nativeElement.querySelector('.overlay').click();
    fixture.detectChanges();
    expect(component.mobileActions()).toBe(false);
  });

  // --- Dropdown actions ---
  it('should show leave button when user has non-none permission', () => {
    const options = fixture.nativeElement.querySelectorAll('.options button');
    const labels = Array.from(options).map((b: any) => b.textContent?.trim());
    expect(labels.some(l => l?.includes('BTN_LEAVE'))).toBeTruthy();
  });

  it('should emit leaveTopic when leave button clicked', () => {
    vi.spyOn(component.leaveTopic, 'emit');
    const leaveBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.BTN_LEAVE"]'));
    leaveBtn?.click();
    expect(component.leaveTopic.emit).toHaveBeenCalledWith(component.topic());
  });

  it('should show delete button when canDelete is true', () => {
    const deleteBtn = fixture.nativeElement.querySelector('.options button.error_text');
    expect(deleteBtn).toBeTruthy();
  });

  it('should emit deleteTopic when delete button clicked', () => {
    vi.spyOn(component.deleteTopic, 'emit');
    const deleteBtn = fixture.nativeElement.querySelector('.options button.error_text');
    deleteBtn?.click();
    expect(component.deleteTopic.emit).toHaveBeenCalledWith(component.topic());
  });

  it('should emit openSettings when settings button clicked', () => {
    vi.spyOn(component.openSettings, 'emit');
    const settingsBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.NAV_LNK_SETTINGS"]'));
    settingsBtn?.click();
    expect(component.openSettings.emit).toHaveBeenCalledWith(component.topic());
  });

  it('should show report button only for public topics without a report', () => {
    const reportBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.OPTION_REPORT_TOPIC"]'));
    expect(reportBtn).toBeTruthy();
  });

  it('should hide report button for topics with existing report', () => {
    component.topic.set({ ...BASE_TOPIC, report: { id: 'r1', type: null, text: null, moderatedReasonType: null, moderatedReasonText: null } } as any);
    fixture.detectChanges();
    const reportBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.OPTION_REPORT_TOPIC"]'));
    expect(reportBtn).toBeFalsy();
  });

  it('should show moderate button when canModerate returns true', () => {
    mockTopicService.canModerate.mockReturnValue(true);
    // Re-set an input to trigger OnPush re-render
    component.topic.set({ ...BASE_TOPIC });
    fixture.detectChanges();
    const moderateBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.OPTION_MODERATE_TOPIC"]'));
    expect(moderateBtn).toBeTruthy();
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicHeaderComponent } from './topic-header.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';

const BASE_TOPIC = {
  id: '123',
  title: 'Test Topic',
  permission: { level: 'admin' },
  status: 'inProgress',
  visibility: 'public',
  favourite: false,
  creator: { name: 'Test User' }
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
      imports: [TopicHeaderComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: TopicService, useValue: mockTopicService }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(TopicHeaderComponent);
    componentRef = fixture.componentRef;
    componentRef.setInput('topic', { ...BASE_TOPIC });
    componentRef.setInput('navigation', { title: 'Back', link: ['/'] });
    fixture.detectChanges();
    component = fixture.componentInstance;
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  // --- Join button ---
  it('should show join button when user has no permissions', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, permission: { level: 'none' } });
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#join_button')).toBeTruthy();
  });

  it('should hide join button when user has permissions', () => {
    expect(fixture.nativeElement.querySelector('#join_button')).toBeFalsy();
  });

  it('should emit joinTopic when join button clicked', () => {
    componentRef.setInput('topic', { ...BASE_TOPIC, permission: { level: 'none' } });
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
    componentRef.setInput('topic', { ...BASE_TOPIC, permission: { level: 'none' } });
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
    componentRef.setInput('topic', { ...BASE_TOPIC, report: { id: 'r1' } });
    fixture.detectChanges();
    const reportBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.OPTION_REPORT_TOPIC"]'));
    expect(reportBtn).toBeFalsy();
  });

  it('should show moderate button when canModerate returns true', () => {
    mockTopicService.canModerate.mockReturnValue(true);
    // Re-set an input to trigger OnPush re-render
    componentRef.setInput('topic', { ...BASE_TOPIC });
    fixture.detectChanges();
    const moderateBtn = Array.from(fixture.nativeElement.querySelectorAll('.options button') as NodeListOf<HTMLElement>)
      .find(b => b.querySelector('span[translate="VIEWS.TOPICS_TOPICID.OPTION_MODERATE_TOPIC"]'));
    expect(moderateBtn).toBeTruthy();
  });
});

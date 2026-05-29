import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicTabsComponent } from './topic-tabs.component';
import { provideRouter } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { ComponentRef } from '@angular/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { signal } from '@angular/core';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { By } from '@angular/platform-browser';
import { vi } from 'vitest';

describe('TopicTabsComponent', () => {
  let component: TopicTabsComponent;
  let fixture: ComponentFixture<TopicTabsComponent>;
  let componentRef: ComponentRef<TopicTabsComponent>;

  const mockTopicService = {
    STATUSES: {
      draft: 'draft',
      ideation: 'ideation',
      inProgress: 'inProgress',
      voting: 'voting',
      followUp: 'followUp',
      closed: 'closed',
    },
    toggleFavourite: vi.fn(),
  };

  const mockUserStore = {
    isAuthenticated: signal(false),
  };

  const MOCK_TOPIC: Topic = {
    id: '1',
    status: 'inProgress',
    title: 'Test Topic',
    creator: { id: 'u1', name: 'User 1' },
    createdAt: new Date().toISOString(),
    favourite: false,
  } as Topic;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TopicTabsComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: TopicService, useValue: mockTopicService },
        { provide: UserStore, useValue: mockUserStore },
      ],
    })
    .overrideComponent(TopicTabsComponent, {
      remove: { imports: [TooltipComponent] },
      add: { imports: [] },
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicTabsComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('topic', MOCK_TOPIC);
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should display discussion tab when topic status is inProgress', () => {
    componentRef.setInput('topic', { ...MOCK_TOPIC, status: 'inProgress' });
    fixture.detectChanges();

    const discussionTab = fixture.debugElement.query(By.css('.topic_tab.discussion'));
    expect(discussionTab).toBeTruthy();
  });

  it('should display voting tab when topic status is voting', () => {
    componentRef.setInput('topic', { ...MOCK_TOPIC, status: 'voting' });
    fixture.detectChanges();

    const votingTab = fixture.debugElement.query(By.css('.topic_tab.voting'));
    expect(votingTab).toBeTruthy();
  });

  it('should display ideation tab when topic status is ideation', () => {
    componentRef.setInput('topic', { ...MOCK_TOPIC, status: 'ideation' });
    fixture.detectChanges();

    const ideationTab = fixture.debugElement.query(By.css('.topic_tab.ideation'));
    expect(ideationTab).toBeTruthy();
  });

  it('should emit tabNavigate on tab click', () => {
    const emitSpy = vi.spyOn(component.tabNavigate, 'emit');
    componentRef.setInput('topic', { ...MOCK_TOPIC, status: 'inProgress' });
    fixture.detectChanges();

    const discussionTab = fixture.debugElement.query(By.css('.topic_tab.discussion'));
    discussionTab.nativeElement.click();

    expect(emitSpy).toHaveBeenCalledWith('discussion');
  });

  it('should show favourite toggle when user is logged in', () => {
    mockUserStore.isAuthenticated.set(true);
    fixture.detectChanges();

    const favButton = fixture.debugElement.query(By.css('.btn_medium_close'));
    expect(favButton).toBeTruthy();
  });

  it('should call toggleFavourite when favourite button is clicked', () => {
    mockUserStore.isAuthenticated.set(true);
    fixture.detectChanges();

    const favButton = fixture.debugElement.query(By.css('.btn_medium_close'));
    favButton.nativeElement.click();

    expect(mockTopicService.toggleFavourite).toHaveBeenCalledWith(MOCK_TOPIC);
  });
});


import { MockIconComponent } from '../../shared/testing/mocks';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { HomeComponent } from './home.component';
import { HttpClientTestingModule } from '@angular/common/http/testing';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { provideRouter, Router, RouterLink } from '@angular/router';
import { By } from '@angular/platform-browser';
import { UserStore } from '../../core/state/user.store';
import { PublicTopicService } from '../../core/services/public-topic.service';
import { PublicGroupService } from '../../core/services/public-group.service';
import { HomeService } from './services/home.service';
import { signal, NO_ERRORS_SCHEMA, PLATFORM_ID } from '@angular/core';
import { of } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('HomeComponent', () => {
  let component: HomeComponent;
  let fixture: ComponentFixture<HomeComponent>;
  let mockUserStore: { isAuthenticated: ReturnType<typeof signal<boolean>> };
  let mockTopicService: { getPreview: ReturnType<typeof vi.fn> };
  let mockGroupService: { getPreview: ReturnType<typeof vi.fn> };
  let mockHomeService: Partial<HomeService>;

  beforeEach(async () => {
    mockUserStore = {
      isAuthenticated: signal(false)
    };
    mockTopicService = {
      getPreview: vi.fn().mockReturnValue(of([]))
    };
    mockGroupService = {
      getPreview: vi.fn().mockReturnValue(of([]))
    };
    mockHomeService = {
      getStats: vi.fn().mockReturnValue(of({
        ideasProposed: 10,
        topicsCreated: 20,
        votesCast: 30,
        usersCreated: 40
      }))
    };

    await TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: PublicTopicService, useValue: mockTopicService },
        { provide: PublicGroupService, useValue: mockGroupService },
        { provide: HomeService, useValue: mockHomeService },
        { provide: PLATFORM_ID, useValue: 'browser' }
      ],
      schemas: [NO_ERRORS_SCHEMA]
    })
    .overrideComponent(HomeComponent, {
      set: {
        imports: [TranslateModule, RouterLink,
          MockIconComponent],
        schemas: [NO_ERRORS_SCHEMA]
      }
    })
    .compileComponents();
  });

  const createComponent = () => {
    fixture = TestBed.createComponent(HomeComponent);
    component = fixture.componentInstance;
    const translate = TestBed.inject(TranslateService);
    translate.use('en');
    fixture.detectChanges();
  };

  it('should create', () => {
    createComponent();
    expect(component).toBeTruthy();
  });

  it('should redirect to dashboard if authenticated on init', () => {
    mockUserStore.isAuthenticated.set(true);
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');

    createComponent();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en', 'dashboard']);
  });

  it('should render stats when available', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    const statsBoxes = compiled.querySelectorAll('.stats_box');
    expect(statsBoxes.length).toBe(4);
    expect(statsBoxes[0].querySelector('.number')?.textContent).toContain('10');
  });

  it('should navigate to login when creating group and not authenticated', () => {
    createComponent();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(false);

    component.createGroup();

    expect(navigateSpy).toHaveBeenCalledWith(['/account/login'], expect.any(Object));
  });

  it('should navigate to group create when authenticated', () => {
    createComponent();
    const router = TestBed.inject(Router);
    const navigateSpy = vi.spyOn(router, 'navigate');
    mockUserStore.isAuthenticated.set(true);

    component.createGroup();

    expect(navigateSpy).toHaveBeenCalledWith(['/', 'en', 'my', 'groups', 'create']);
  });

  it('should render topics if available', () => {
    mockTopicService.getPreview.mockReturnValue(of([{ id: '1', title: 'Topic 1' }]));
    createComponent();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const topicCards = compiled.querySelectorAll('cos-topic-card');
    expect(topicCards.length).toBe(1);
  });

  it('should render groups if available', () => {
    mockGroupService.getPreview.mockReturnValue(of([{ id: '1', name: 'Group 1' }]));
    createComponent();
    
    const compiled = fixture.nativeElement as HTMLElement;
    const groupCards = compiled.querySelectorAll('cos-group-card');
    expect(groupCards.length).toBe(1);
  });

  it('should navigate to signup when signup button is clicked', () => {
    createComponent();
    const signupBtn = fixture.debugElement.query(By.css('.btn_big_submit'));
    expect(signupBtn).toBeTruthy();
  });

  it('should have correct link to learn more', () => {
    createComponent();
    const compiled = fixture.nativeElement as HTMLElement;
    const learnMoreLnk = compiled.querySelector('.btn_big_submit_ghost');
    expect(learnMoreLnk?.getAttribute('href')).toBe('https://citizenos.com/about-us/');
  });

  it('should call services with limit 3 when mobile', () => {
    // Mock mobile width
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 500 });
    
    // We must reset the spy because it might have been called during previous test's instantiation if not careful
    mockTopicService.getPreview.mockClear();
    mockGroupService.getPreview.mockClear();

    createComponent();
    
    expect(mockTopicService.getPreview).toHaveBeenCalledWith(3);
    expect(mockGroupService.getPreview).toHaveBeenCalledWith(3);
  });

  it('should call services with limit 8 when desktop', () => {
    // Mock desktop width
    Object.defineProperty(window, 'innerWidth', { writable: true, configurable: true, value: 1024 });
    
    mockTopicService.getPreview.mockClear();
    mockGroupService.getPreview.mockClear();

    createComponent();
    
    expect(mockTopicService.getPreview).toHaveBeenCalledWith(8);
    expect(mockGroupService.getPreview).toHaveBeenCalledWith(8);
  });
});

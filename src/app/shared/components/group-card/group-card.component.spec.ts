import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ComponentRef, Component, Input } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { DatePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { GroupCardComponent } from './group-card.component';
import { Group } from '../../../core/interfaces/group';
import { UserStore } from '../../../core/state/user.store';
import { GroupDetailService } from '../../../core/services/group-detail.service';

@Component({ selector: 'cos-initials', standalone: true, template: '' })
class MockInitialsComponent { @Input() name = ''; @Input() limit = 2; }

@Component({ selector: 'cos-icon', standalone: true, template: '' })
class MockIconComponent { @Input() name = ''; @Input() size = 24; }

@Component({ selector: 'cos-button', standalone: true, template: '<ng-content></ng-content>' })
class MockButtonComponent { @Input() variant = ''; @Input() size = ''; }

const BASE_GROUP: Group = {
  id: 'group-1',
  name: 'Test Group',
  description: 'A test group',
  visibility: 'public',
  join: { token: 'tok', level: 'read' },
  createdAt: '2024-01-15T10:00:00Z',
  updatedAt: '2024-01-15T10:00:00Z',
  sourcePartnerId: null,
  sourcePartnerObjectId: null,
  permission: { level: 'read' },
  creator: { id: 'c1', name: 'Admin' },
  lastActivity: null,
  members: { users: { count: 3 }, groups: { count: 0 }, topics: { count: { inProgress: 2, ideation: 1, voting: 0, followUp: 0 }, latest: null } },
  userLevel: null,
  imageUrl: null,
  language: null,
  country: null,
  categories: null,
  rules: [],
  contact: null,
  favourite: false,
  inviteMessage: null,
};

describe('GroupCardComponent', () => {
  let component: GroupCardComponent;
  let fixture: ComponentFixture<GroupCardComponent>;
  let componentRef: ComponentRef<GroupCardComponent>;
  let router: Router;

  const mockUserStore = { isAuthenticated: vi.fn().mockReturnValue(true) };
  const mockGroupDetailService = { canShare: vi.fn().mockReturnValue(false) };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GroupCardComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([]),
        { provide: UserStore, useValue: mockUserStore },
        { provide: GroupDetailService, useValue: mockGroupDetailService },
      ],
    })
      .overrideComponent(GroupCardComponent, {
        set: { imports: [TranslateModule, DatePipe, MockInitialsComponent, MockIconComponent, MockButtonComponent] },
      })
      .compileComponents();

    // Set a language so translate.currentLang is defined in navigation calls
    TestBed.inject(TranslateService).use('en');
    router = TestBed.inject(Router);
    fixture = TestBed.createComponent(GroupCardComponent);
    component = fixture.componentInstance;
    componentRef = fixture.componentRef;
    componentRef.setInput('group', BASE_GROUP);
    componentRef.setInput('mode', 'public');
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render group name in public mode', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.group_title')?.textContent).toContain('Test Group');
  });

  it('should render group description in public mode', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.group_description')?.textContent).toContain('A test group');
  });

  it('should show member count', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.members_count_text')?.textContent?.trim()).toBe('3');
  });

  it('should show image when imageUrl is set', () => {
    componentRef.setInput('group', { ...BASE_GROUP, imageUrl: 'http://example.com/group.jpg' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.group_icon img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('http://example.com/group.jpg');
  });

  it('should show initials when imageUrl is null', () => {
    expect(fixture.nativeElement.querySelector('.initial_wrap')).toBeTruthy();
    expect(fixture.nativeElement.querySelector('.group_icon img')).toBeNull();
  });

  it('should show private icon when visibility is private', () => {
    componentRef.setInput('group', { ...BASE_GROUP, visibility: 'private' });
    fixture.detectChanges();
    // mock icon is rendered, check there are 2 info_area items (private + users count)
    const items = fixture.nativeElement.querySelectorAll('.info_area .item');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('should show favourite icon when group.favourite is true', () => {
    componentRef.setInput('group', { ...BASE_GROUP, favourite: true });
    fixture.detectChanges();
    const items = fixture.nativeElement.querySelectorAll('.info_area .item');
    expect(items.length).toBeGreaterThanOrEqual(2);
  });

  it('should show join button when user has no userLevel (public mode)', () => {
    const el: HTMLElement = fixture.nativeElement;
    const buttons = el.querySelectorAll('cos-button');
    expect(buttons.length).toBe(1);
    expect(buttons[0].textContent?.trim()).toContain('VIEWS.PUBLIC_GROUPS.BTN_JOIN_GROUP');
  });

  it('should show view button when user has a userLevel (public mode)', () => {
    componentRef.setInput('group', { ...BASE_GROUP, userLevel: 'read' });
    fixture.detectChanges();
    const btn = fixture.nativeElement.querySelector('cos-button');
    expect(btn?.textContent?.trim()).toContain('VIEWS.PUBLIC_GROUPS.BTN_VIEW_GROUP');
  });

  it('should navigate to group detail on viewGroup()', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.viewGroup();
    expect(navigateSpy).toHaveBeenCalledWith(['/', component.translate.currentLang, 'groups', 'group-1']);
  });

  it('should navigate to login when unauthenticated user clicks join', () => {
    mockUserStore.isAuthenticated.mockReturnValue(false);
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.joinGroup();
    expect(navigateSpy).toHaveBeenCalledWith(
      expect.arrayContaining(['account', 'login']),
      expect.objectContaining({ queryParams: expect.objectContaining({ redirectSuccess: expect.any(String) }) })
    );
    mockUserStore.isAuthenticated.mockReturnValue(true);
  });

  it('should navigate to group join page when authenticated user clicks join', () => {
    const navigateSpy = vi.spyOn(router, 'navigate');
    component.joinGroup();
    expect(navigateSpy).toHaveBeenCalledWith(['/', component.translate.currentLang, 'groups', 'group-1', 'join']);
  });

  it('should render in member mode without join/view buttons', () => {
    componentRef.setInput('mode', 'member');
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('cos-button')).toBeNull();
  });

  it('latestTopic returns null when no topics.latest', () => {
    expect(component.latestTopic()).toBeNull();
  });

  it('latestTopic returns the latest topic object', () => {
    componentRef.setInput('group', {
      ...BASE_GROUP,
      members: { ...BASE_GROUP.members, topics: { count: {}, latest: { id: 't1', title: 'Latest' } } }
    });
    fixture.detectChanges();
    expect(component.latestTopic()).toEqual({ id: 't1', title: 'Latest' });
  });
});

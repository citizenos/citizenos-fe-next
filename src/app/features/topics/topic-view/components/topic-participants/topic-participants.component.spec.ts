import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { TopicParticipantsComponent } from './topic-participants.component';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { Component, Input } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';

@Component({ selector: 'cos-notifications', standalone: true, template: '' })
class MockNotificationsComponent {}

@Component({ selector: 'app-topic-member-user', standalone: true, template: '' })
class MockTopicMemberUserComponent {
  @Input() member: any;
  @Input() topic: any;
  @Input() withEmail = true;
}

@Component({ selector: 'app-topic-member-group', standalone: true, template: '' })
class MockTopicMemberGroupComponent {
  @Input() topic: any;
  @Input() group: any;
}

@Component({ selector: 'app-topic-member-invite', standalone: true, template: '' })
class MockTopicMemberInviteComponent {
  @Input() invite: any;
  @Input() topic: any;
}

@Component({ selector: 'cos-input', standalone: true, template: '<ng-content></ng-content>' })
class MockInputComponent { @Input() placeholder = ''; }

@Component({ selector: 'cos-pagination', standalone: true, template: '' })
class MockPaginationComponent {
  @Input() totalPages = 0;
  @Input() page = 1;
}

@Component({ selector: 'cos-tooltip', standalone: true, template: '' })
class MockTooltipComponent {
  @Input() title = '';
  @Input() description = '';
}

const MOCK_TOPIC = { id: 'topic1', permission: { level: 'admin' }, status: 'inProgress' };
const MOCK_USERS = [
  { id: 'u1', name: 'Alice', level: 'admin' },
  { id: 'u2', name: 'Bob', level: 'read' }
];
const MOCK_GROUPS = [{ id: 'g1', name: 'Group A', level: 'read' }];
const MOCK_INVITES = [{ id: 'i1', email: 'carol@example.com', level: 'read' }];

describe('TopicParticipantsComponent', () => {
  let component: TopicParticipantsComponent;
  let fixture: ComponentFixture<TopicParticipantsComponent>;

  const mockUserService = { loadItems: vi.fn().mockReturnValue(of(MOCK_USERS)) };
  const mockGroupService = { loadItems: vi.fn().mockReturnValue(of(MOCK_GROUPS)) };
  const mockInviteService = { loadItems: vi.fn().mockReturnValue(of(MOCK_INVITES)) };

  beforeEach(async () => {
    vi.clearAllMocks();
    mockUserService.loadItems.mockReturnValue(of(MOCK_USERS));
    mockGroupService.loadItems.mockReturnValue(of(MOCK_GROUPS));
    mockInviteService.loadItems.mockReturnValue(of(MOCK_INVITES));

    await TestBed.configureTestingModule({
      imports: [TopicParticipantsComponent, TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { topic: { ...MOCK_TOPIC } } },
        { provide: DialogRef, useValue: { close: vi.fn() } },
        { provide: TopicMemberUserService, useValue: mockUserService },
        { provide: TopicMemberGroupService, useValue: mockGroupService },
        { provide: TopicInviteUserService, useValue: mockInviteService }
      ]
    })
    .overrideComponent(TopicParticipantsComponent, {
      set: {
        imports: [
          FormsModule,
          UpperCasePipe,
          TranslateModule,
          MockNotificationsComponent,
          MockTopicMemberUserComponent,
          MockTopicMemberGroupComponent,
          MockTopicMemberInviteComponent,
          MockInputComponent,
          MockPaginationComponent,
          MockTooltipComponent,
        ]
      }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicParticipantsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should default to participants tab', () => {
    expect(component.activeTab()).toBe('participants');
  });

  it('should load users, groups and invites on init', () => {
    expect(mockUserService.loadItems).toHaveBeenCalledWith('topic1');
    expect(mockGroupService.loadItems).toHaveBeenCalledWith('topic1');
    expect(mockInviteService.loadItems).toHaveBeenCalledWith('topic1');
    expect(component.allUsers()).toHaveLength(2);
    expect(component.allGroups()).toHaveLength(1);
    expect(component.allInvites()).toHaveLength(1);
  });

  it('should show participant rows when on participants tab', () => {
    const el: HTMLElement = fixture.nativeElement;
    const rows = el.querySelectorAll('app-topic-member-user');
    expect(rows.length).toBe(2);
  });

  it('should switch to groups tab and show group rows', async () => {
    component.activeTab.set('groups');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-topic-member-group').length).toBe(1);
  });

  it('should switch to invited tab and show invite rows', async () => {
    component.activeTab.set('invited');
    fixture.detectChanges();
    await fixture.whenStable();
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('app-topic-member-invite').length).toBe(1);
  });

  it('should render desktop tab links', () => {
    const el: HTMLElement = fixture.nativeElement;
    const tabs = el.querySelectorAll('.dialog_tab.mobile_hidden');
    expect(tabs.length).toBe(3);
  });

  it('should render mobile dropdown', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dropdown.mobile_show')).toBeTruthy();
  });

  it('should filter users by search', () => {
    component.setUserSearch('alice');
    expect(component.filteredUsers()).toHaveLength(1);
    expect(component.filteredUsers()[0].name).toBe('Alice');
  });

  it('should reset page when search changes', () => {
    component.userPage.set(3);
    component.setUserSearch('bob');
    expect(component.userPage()).toBe(1);
  });

  it('should compute totalPages correctly', () => {
    expect(component.userTotalPages()).toBe(1);
  });

  it('doUserOrder changes sort field and direction', () => {
    component.doUserOrder('level', 'desc');
    expect(component.userOrderField()).toBe('level');
    expect(component.userOrderDir()).toBe('desc');
    expect(component.userPage()).toBe(1);
  });

  it('should render close button', () => {
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.btn_dialog_close')).toBeTruthy();
  });

  it('should render heading', () => {
    const el: HTMLElement = fixture.nativeElement;
    const heading = el.querySelector('h1.title');
    expect(heading).toBeTruthy();
  });
});

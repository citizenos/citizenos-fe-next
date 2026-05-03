import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { UpperCasePipe } from '@angular/common';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';

import { TopicMemberUserComponent } from './topic-member-user.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({ selector: 'cos-initials', standalone: true, template: '{{ name }}' })
class MockInitialsComponent {
  @Input() name = '';
}

const MOCK_TOPIC: Topic = {
  id: 'topic-1',
  title: 'Test Topic',
  intro: null,
  description: '',
  status: 'inProgress',
  visibility: 'public',
  hashtag: null,
  join: { token: '', level: 'read' },
  categories: [],
  endsAt: null,
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
  sourcePartnerId: null,
  sourcePartnerObjectId: null,
  permission: { level: 'admin' },
  creator: null,
  lastActivity: null,
  country: null,
  language: null,
  members: { users: { count: 5 }, groups: { count: 0 } },
  voteId: null,
  discussionId: null,
  comments: null,
  padUrl: null,
  imageUrl: null,
  authors: [],
};

const MOCK_MEMBER = {
  id: 'user-1',
  name: 'Test User',
  email: 'test@example.com',
  imageUrl: null,
  level: 'read',
  groups: { rows: [] },
};

describe('TopicMemberUserComponent', () => {
  let fixture: ComponentFixture<TopicMemberUserComponent>;
  let component: TopicMemberUserComponent;
  let topicServiceMock: Partial<TopicService>;
  let topicMemberUserServiceMock: Partial<TopicMemberUserService>;
  let userStoreMock: { user: ReturnType<typeof vi.fn> };
  let dialogServiceMock: Partial<DialogService>;

  beforeEach(async () => {
    topicServiceMock = {
      canUpdate: vi.fn().mockReturnValue(true),
      canDelete: vi.fn().mockReturnValue(false),
      LEVELS: { read: 'read', edit: 'edit', admin: 'admin' },
    };

    topicMemberUserServiceMock = {
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({})),
    };

    userStoreMock = {
      user: vi.fn().mockReturnValue({ id: 'other-user', name: 'Other' }),
    };

    dialogServiceMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
    };

    await TestBed.configureTestingModule({
      imports: [
        TopicMemberUserComponent,
        TranslateModule.forRoot(),
        RouterModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TopicService, useValue: topicServiceMock },
        { provide: TopicMemberUserService, useValue: topicMemberUserServiceMock },
        { provide: UserStore, useValue: userStoreMock },
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    })
      .overrideComponent(TopicMemberUserComponent, {
        set: { imports: [TranslateModule, RouterModule, UpperCasePipe, MockInitialsComponent, CosDropdownDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicMemberUserComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', MOCK_TOPIC);
    fixture.componentRef.setInput('member', MOCK_MEMBER);
    fixture.detectChanges();
  });

  it('renders without errors', () => {
    expect(component).toBeTruthy();
  });

  it('shows initials when no imageUrl', () => {
    const initials = fixture.nativeElement.querySelector('cos-initials');
    expect(initials).toBeTruthy();
  });

  it('shows image when imageUrl is present', () => {
    fixture.componentRef.setInput('member', { ...MOCK_MEMBER, imageUrl: 'http://example.com/img.png' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.profile_image');
    expect(img).toBeTruthy();
    expect(img.src).toContain('img.png');
  });

  it('shows member name', () => {
    expect(fixture.nativeElement.textContent).toContain('Test User');
  });

  it('shows email when withEmail is true', () => {
    expect(fixture.nativeElement.textContent).toContain('test@example.com');
  });

  it('hides email when withEmail is false', () => {
    fixture.componentRef.setInput('withEmail', false);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).not.toContain('test@example.com');
  });

  it('shows level dropdown', () => {
    const dropdown = fixture.nativeElement.querySelector('.dropdown:not(.button_dropdown)');
    expect(dropdown).toBeTruthy();
  });

  it('calls update service when level changes', () => {
    component.doUpdateMemberUser('admin');
    expect(topicMemberUserServiceMock.update).toHaveBeenCalledWith('topic-1', 'user-1', 'admin');
  });

  it('does not call update service when same level selected', () => {
    component.doUpdateMemberUser('read');
    expect(topicMemberUserServiceMock.update).not.toHaveBeenCalled();
  });

  it('opens confirm dialog and calls delete service on confirm for other user', () => {
    component.doDeleteMemberUser();
    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ level: 'delete' }),
      }),
    );
    expect(topicMemberUserServiceMock.delete).toHaveBeenCalledWith('topic-1', 'user-1');
  });

  it('does not call delete when dialog cancelled', () => {
    (dialogServiceMock.open as ReturnType<typeof vi.fn>).mockReturnValue({
      afterClosed: () => of(false),
    });
    component.doDeleteMemberUser();
    expect(topicMemberUserServiceMock.delete).not.toHaveBeenCalled();
  });

  it('calls doLeaveTopic when member is current user', () => {
    userStoreMock.user.mockReturnValue({ id: 'user-1', name: 'Test User' });
    const leaveSpy = vi.spyOn(component, 'doLeaveTopic').mockImplementation(() => {});
    component.doDeleteMemberUser();
    expect(leaveSpy).toHaveBeenCalled();
  });

  it('shows via groups when member has groups', () => {
    fixture.componentRef.setInput('member', {
      ...MOCK_MEMBER,
      groups: { rows: [{ id: 'g-1', name: 'Group 1', level: 'read' }] },
    });
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent).toContain('Group 1');
  });
});

import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe, DatePipe } from '@angular/common';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TopicMemberInviteComponent } from './topic-member-invite.component';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
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

const MOCK_INVITE = {
  id: 'invite-1',
  level: 'read',
  expiresAt: new Date(Date.now() + 86400000).toISOString(),
  user: {
    id: 'user-1',
    name: 'Invited User',
    email: 'invited@example.com',
    imageUrl: null,
  },
};

describe('TopicMemberInviteComponent', () => {
  let fixture: ComponentFixture<TopicMemberInviteComponent>;
  let component: TopicMemberInviteComponent;
  let topicInviteUserServiceMock: Partial<TopicInviteUserService>;
  let dialogServiceMock: Partial<DialogService>;

  beforeEach(async () => {
    topicInviteUserServiceMock = {
      delete: vi.fn().mockReturnValue(of({})),
    };

    dialogServiceMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of('1') }),
    };

    await TestBed.configureTestingModule({
      imports: [
        TopicMemberInviteComponent,
        TranslateModule.forRoot(),
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TopicInviteUserService, useValue: topicInviteUserServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    })
      .overrideComponent(TopicMemberInviteComponent, {
        set: { imports: [TranslateModule, UpperCasePipe, DatePipe, MockInitialsComponent, CosDropdownDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicMemberInviteComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', MOCK_TOPIC);
    fixture.componentRef.setInput('invite', MOCK_INVITE);
    fixture.detectChanges();
  });

  it('renders without errors', () => {
    expect(component).toBeTruthy();
  });

  it('shows user name', () => {
    expect(fixture.nativeElement.textContent).toContain('Invited User');
  });

  it('shows user email', () => {
    expect(fixture.nativeElement.textContent).toContain('invited@example.com');
  });

  it('shows initials when no imageUrl', () => {
    const initials = fixture.nativeElement.querySelector('cos-initials');
    expect(initials).toBeTruthy();
  });

  it('shows image when imageUrl is present', () => {
    fixture.componentRef.setInput('invite', {
      ...MOCK_INVITE,
      user: { ...MOCK_INVITE.user, imageUrl: 'http://example.com/img.png' },
    });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.profile_image');
    expect(img).toBeTruthy();
    expect(img.src).toContain('img.png');
  });

  it('shows expired badge when invite is expired', () => {
    const pastDate = new Date(Date.now() - 86400000).toISOString();
    fixture.componentRef.setInput('invite', { ...MOCK_INVITE, expiresAt: pastDate });
    fixture.detectChanges();
    const expiredEl = fixture.nativeElement.querySelector('.red_text');
    expect(expiredEl).toBeTruthy();
  });

  it('does not show expired badge for future invites', () => {
    const expiredEl = fixture.nativeElement.querySelector('.red_text');
    expect(expiredEl).toBeNull();
  });

  it('opens delete dialog when remove option clicked', () => {
    component.doDeleteInviteUser();
    expect(dialogServiceMock.open).toHaveBeenCalled();
  });

  it('calls delete service when dialog returns "1"', () => {
    component.doDeleteInviteUser();
    expect(topicInviteUserServiceMock.delete).toHaveBeenCalledWith('topic-1', 'invite-1');
  });

  it('emits deleteAllInvitesForUser when dialog returns "all"', () => {
    (dialogServiceMock.open as ReturnType<typeof vi.fn>).mockReturnValue({
      afterClosed: () => of('all'),
    });
    const emitted: string[] = [];
    component.deleteAllInvitesForUser.subscribe((id: string) => emitted.push(id));
    component.doDeleteInviteUser();
    expect(emitted).toContain('user-1');
    expect(topicInviteUserServiceMock.delete).not.toHaveBeenCalled();
  });
});

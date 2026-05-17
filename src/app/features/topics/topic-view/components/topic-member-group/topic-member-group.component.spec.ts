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

import { TopicMemberGroupComponent } from './topic-member-group.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
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
  creator: { id: '', name: '' },
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

const MOCK_GROUP = {
  id: 'group-1',
  name: 'Test Group',
  imageUrl: null,
  level: 'read',
  permission: { level: 'admin' },
};

describe('TopicMemberGroupComponent', () => {
  let fixture: ComponentFixture<TopicMemberGroupComponent>;
  let component: TopicMemberGroupComponent;
  let topicServiceMock: Partial<TopicService>;
  let topicMemberGroupServiceMock: Partial<TopicMemberGroupService>;
  let dialogServiceMock: Partial<DialogService>;

  beforeEach(async () => {
    topicServiceMock = {
      canUpdate: vi.fn().mockReturnValue(true),
      canDelete: vi.fn().mockReturnValue(false),
      LEVELS: { read: 'read', edit: 'edit', admin: 'admin' },
    };

    topicMemberGroupServiceMock = {
      update: vi.fn().mockReturnValue(of({})),
      delete: vi.fn().mockReturnValue(of({})),
    };

    dialogServiceMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(true) }),
    };

    await TestBed.configureTestingModule({
      imports: [
        TopicMemberGroupComponent,
        TranslateModule.forRoot(),
        RouterModule,
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        { provide: TopicService, useValue: topicServiceMock },
        { provide: TopicMemberGroupService, useValue: topicMemberGroupServiceMock },
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    })
      .overrideComponent(TopicMemberGroupComponent, {
        set: { imports: [TranslateModule, RouterModule, UpperCasePipe, MockInitialsComponent, CosDropdownDirective] },
      })
      .compileComponents();

    fixture = TestBed.createComponent(TopicMemberGroupComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', MOCK_TOPIC);
    fixture.componentRef.setInput('group', MOCK_GROUP);
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
    fixture.componentRef.setInput('group', { ...MOCK_GROUP, imageUrl: 'http://example.com/img.png' });
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('img.profile_image');
    expect(img).toBeTruthy();
    expect(img.src).toContain('img.png');
  });

  it('shows level dropdown when canUpdate returns true', () => {
    const dropdown = fixture.nativeElement.querySelector('.dropdown:not(.button_dropdown)');
    expect(dropdown).toBeTruthy();
  });

  it('does not show level dropdown when canUpdate returns false', async () => {
    (topicServiceMock.canUpdate as ReturnType<typeof vi.fn>).mockReturnValue(false);
    // trigger input signal change to force OnPush re-render
    fixture.componentRef.setInput('topic', { ...MOCK_TOPIC });
    fixture.detectChanges();
    await fixture.whenStable();
    const dropdown = fixture.nativeElement.querySelector('.dropdown:not(.button_dropdown)');
    expect(dropdown).toBeNull();
  });

  it('calls update service when level changes', () => {
    component.doUpdateMemberGroup('admin');
    expect(topicMemberGroupServiceMock.update).toHaveBeenCalledWith({
      topicId: 'topic-1',
      groupId: 'group-1',
      level: 'admin',
    });
  });

  it('does not call update service when same level selected', () => {
    // groupLevel is initialized to 'read'
    component.doUpdateMemberGroup('read');
    expect(topicMemberGroupServiceMock.update).not.toHaveBeenCalled();
  });

  it('opens confirm dialog and calls delete service on confirm', () => {
    component.doDeleteMemberGroup();
    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({
        data: expect.objectContaining({ level: 'delete' }),
      }),
    );
    expect(topicMemberGroupServiceMock.delete).toHaveBeenCalledWith({
      topicId: 'topic-1',
      groupId: 'group-1',
    });
  });

  it('does not call delete when dialog cancelled', () => {
    (dialogServiceMock.open as ReturnType<typeof vi.fn>).mockReturnValue({
      afterClosed: () => of(false),
    });
    component.doDeleteMemberGroup();
    expect(topicMemberGroupServiceMock.delete).not.toHaveBeenCalled();
  });
});

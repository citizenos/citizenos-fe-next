import { vi, describe, it, expect, beforeEach } from 'vitest';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, Input } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { of } from 'rxjs';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

import { TopicParticipantsSectionComponent } from './topic-participants-section.component';
import { TopicService } from '../../../../../core/services/topic.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
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
  authors: []
};

describe('TopicParticipantsSectionComponent', () => {
  let fixture: ComponentFixture<TopicParticipantsSectionComponent>;
  let component: TopicParticipantsSectionComponent;
  let topicServiceMock: Partial<TopicService>;
  let dialogServiceMock: Partial<DialogService>;

  beforeEach(async () => {
    topicServiceMock = {
      canUpdate: vi.fn().mockReturnValue(false),
      canDelete: vi.fn().mockReturnValue(false)
    };
    dialogServiceMock = {
      open: vi.fn().mockReturnValue({ afterClosed: () => of(null) })
    };

    await TestBed.configureTestingModule({
      imports: [
        TopicParticipantsSectionComponent,
        TranslateModule.forRoot()
      ],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: TopicService, useValue: topicServiceMock },
        { provide: DialogService, useValue: dialogServiceMock }
      ]
    })
    .overrideComponent(TopicParticipantsSectionComponent, {
      set: { imports: [TranslateModule, MockInitialsComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(TopicParticipantsSectionComponent);
    component = fixture.componentInstance;
    fixture.componentRef.setInput('topic', MOCK_TOPIC);
    fixture.componentRef.setInput('members', []);
  });

  it('renders without errors', () => {
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('shows participants heading', () => {
    fixture.detectChanges();
    const title = fixture.nativeElement.querySelector('.info_title');
    expect(title).toBeTruthy();
  });

  it('hides manage link when canUpdate returns false', () => {
    (topicServiceMock.canUpdate as ReturnType<typeof vi.fn>).mockReturnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.manage_link')).toBeNull();
  });

  it('shows manage link when canUpdate returns true', () => {
    (topicServiceMock.canUpdate as ReturnType<typeof vi.fn>).mockReturnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.manage_link')).toBeTruthy();
  });

  it('calls manageParticipants when manage link is clicked', () => {
    (topicServiceMock.canUpdate as ReturnType<typeof vi.fn>).mockReturnValue(true);
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'manageParticipants');
    fixture.nativeElement.querySelector('.manage_link').click();
    expect(spy).toHaveBeenCalled();
  });

  it('hides invite button when canDelete returns false', () => {
    (topicServiceMock.canDelete as ReturnType<typeof vi.fn>).mockReturnValue(false);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn_medium_secondary')).toBeNull();
  });

  it('shows invite button when canDelete returns true', () => {
    (topicServiceMock.canDelete as ReturnType<typeof vi.fn>).mockReturnValue(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.btn_medium_secondary')).toBeTruthy();
  });

  it('calls inviteMembers when invite button is clicked', () => {
    (topicServiceMock.canDelete as ReturnType<typeof vi.fn>).mockReturnValue(true);
    fixture.detectChanges();
    const spy = vi.spyOn(component, 'inviteMembers');
    fixture.nativeElement.querySelector('.btn_medium_secondary').click();
    expect(spy).toHaveBeenCalled();
  });

  it('opens TopicInviteDialogComponent when inviteMembers is called', () => {
    component.inviteMembers();
    expect(dialogServiceMock.open).toHaveBeenCalledWith(
      expect.anything(),
      expect.objectContaining({ data: { topic: MOCK_TOPIC } })
    );
  });

  it('shows participant count from topic', () => {
    fixture.componentRef.setInput('members', [{ name: 'Alice' }, { name: 'Bob' }]);
    fixture.detectChanges();
    const count = fixture.nativeElement.querySelector('.participants_count');
    expect(count).toBeTruthy();
    expect(count.textContent.trim()).toBe('5');
  });

  it('shows avatar images for members with imageUrl', () => {
    const members = [
      { name: 'Alice', imageUrl: 'https://example.com/a.jpg' },
      { name: 'Bob', imageUrl: null }
    ];
    fixture.componentRef.setInput('members', members);
    fixture.detectChanges();
    const img = fixture.nativeElement.querySelector('.avatar img');
    expect(img).toBeTruthy();
    expect(img.getAttribute('src')).toBe('https://example.com/a.jpg');
  });

  it('shows initials filler for members without imageUrl', () => {
    fixture.componentRef.setInput('members', [{ name: 'Bob', imageUrl: null }]);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.profile_image_filler')).toBeTruthy();
  });

  it('shows overflow count when more than 3 members', () => {
    fixture.componentRef.setInput('members', [
      { name: 'A' }, { name: 'B' }, { name: 'C' }, { name: 'D' }
    ]);
    fixture.detectChanges();
    const avatars = fixture.nativeElement.querySelectorAll('.avatar');
    expect(avatars.length).toBeGreaterThan(3);
  });

  it('shows count section with empty members', () => {
    fixture.componentRef.setInput('members', []);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('.participants_count_wrap')).toBeTruthy();
  });
});

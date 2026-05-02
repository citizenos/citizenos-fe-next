import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed, ComponentFixture } from '@angular/core/testing';
import { ComponentRef } from '@angular/core';
import { MemberEditorsPanelComponent } from './member-editors-panel.component';
import { TranslateModule } from '@ngx-translate/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { Topic } from '../../../core/interfaces/topic';

describe('MemberEditorsPanelComponent', () => {
  let component: MemberEditorsPanelComponent;
  let fixture: ComponentFixture<MemberEditorsPanelComponent>;
  let ref: ComponentRef<MemberEditorsPanelComponent>;

  const mockTopic: Topic = {
    id: 'topic-1', title: 'Test', intro: null, description: '', status: 'draft',
    visibility: 'private', hashtag: null, join: { token: '', level: '' },
    categories: [], endsAt: null, createdAt: '', updatedAt: '',
    sourcePartnerId: null, sourcePartnerObjectId: null,
    permission: { level: 'admin' }, creator: {}, lastActivity: null,
    country: null, language: null, members: { users: { count: 1 }, groups: { count: 0 } },
    voteId: null, discussionId: null, comments: null, padUrl: '',
    imageUrl: null, authors: [],
  };

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MemberEditorsPanelComponent, TranslateModule.forRoot()],
      schemas: [NO_ERRORS_SCHEMA]
    }).compileComponents();

    fixture = TestBed.createComponent(MemberEditorsPanelComponent);
    ref = fixture.componentRef;
    component = fixture.componentInstance;
  });

  it('should create', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    expect(component).toBeTruthy();
  });

  it('should show no-members message when empty', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    const noMembers = fixture.nativeElement.querySelector('.no-members');
    expect(noMembers).toBeTruthy();
  });

  it('should show members when provided', () => {
    component.topic.set(mockTopic);
    component.members.set([
      { id: 'u1', name: 'John', email: 'john@test.com', level: 'edit' },
      { id: 'u2', name: 'Jane', email: 'jane@test.com', level: 'edit' }
    ]);
    fixture.detectChanges();
    const rows = fixture.nativeElement.querySelectorAll('.topic_member');
    expect(rows.length).toBe(3); // One for "Joined" label, two for members
    expect(fixture.nativeElement.querySelector('.no-members')).toBeNull();
  });

  it('should emit inviteEditors on button click', () => {
    component.topic.set(mockTopic);
    fixture.detectChanges();
    const emitSpy = vi.spyOn(component.inviteEditors, 'emit');
    const btn = fixture.nativeElement.querySelector('.btn_medium_secondary');
    btn.click();
    expect(emitSpy).toHaveBeenCalled();
  });

  it('should show invites when provided', () => {
    component.topic.set(mockTopic);
    component.invites.set([
      { id: 'i1', email: 'invited@test.com' }
    ]);
    fixture.detectChanges();
    const inviteRows = fixture.nativeElement.querySelectorAll('.topic_member');
    expect(inviteRows.length).toBe(3); // "Joined" label, "Invited" label, one invite row
  });
});

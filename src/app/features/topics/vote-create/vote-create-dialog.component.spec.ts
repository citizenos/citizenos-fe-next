import { ComponentFixture, TestBed } from '@angular/core/testing';
import { Component, signal } from '@angular/core';
import { provideRouter, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { of, throwError } from 'rxjs';
import { vi, describe, it, expect, beforeEach } from 'vitest';

import { VoteCreateDialogComponent } from './vote-create-dialog.component';
import { DIALOG_DATA, DialogRef } from '../../../shared/dialog';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicService } from '../../../core/services/topic.service';
import { Topic } from '../../../core/interfaces/topic';
import { Idea } from '../../../core/interfaces/idea';
import { IdeationFolder } from '../../../core/interfaces/ideation';

@Component({ standalone: true, template: '' })
class EmptyComponent {}

describe('VoteCreateDialogComponent', () => {
  let component: VoteCreateDialogComponent;
  let fixture: ComponentFixture<VoteCreateDialogComponent>;
  let mockDialogRef: { close: ReturnType<typeof vi.fn> };
  let mockVoteService: { save: ReturnType<typeof vi.fn> };
  let mockTopicIdeationService: {
    getIdeas: ReturnType<typeof vi.fn>;
    getFolders: ReturnType<typeof vi.fn>;
  };
  let mockTopicService: {
    reloadTopic: ReturnType<typeof vi.fn>;
    canEditDescription: ReturnType<typeof vi.fn>;
  };
  let mockNotification: {
    notifications: ReturnType<typeof signal>;
    clear: ReturnType<typeof vi.fn>;
    error: ReturnType<typeof vi.fn>;
    success: ReturnType<typeof vi.fn>;
    showRaw: ReturnType<typeof vi.fn>;
  };

  const mockTopic: Topic = {
    id: 'topic-1',
    title: 'Test Topic',
    intro: null,
    description: 'Desc',
    status: 'inProgress',
    visibility: 'public',
    categories: [],
    endsAt: null,
    hashtag: null,
    join: { token: 'tok', level: 'read' },
    permission: { level: 'admin' },
    creator: { id: 'u1', name: 'User', company: null, imageUrl: null },
    lastActivity: null,
    members: { users: { count: 1 }, groups: { count: 0 } },
    voteId: null,
    ideationId: null,
    discussionId: 'disc-1',
    comments: { count: 0 },
    padUrl: 'https://pad',
    sourcePartnerId: null,
    sourcePartnerObjectId: null,
    country: null,
    language: null,
    contact: null,
    createdAt: '2025-01-01',
    updatedAt: '2025-01-01',
    report: undefined,
    imageUrl: null,
    favourite: false,
    authors: [],
  };

  beforeEach(async () => {
    mockDialogRef = { close: vi.fn() };
    mockVoteService = { save: vi.fn().mockReturnValue(of({ id: 'vote-1' })) };
    mockTopicIdeationService = {
      getIdeas: vi.fn().mockReturnValue(of({ count: 0, rows: [] })),
      getFolders: vi.fn().mockReturnValue(of({ count: 0, rows: [] })),
    };
    mockTopicService = {
      reloadTopic: vi.fn(),
      canEditDescription: vi.fn().mockReturnValue(true),
    };
    mockNotification = {
      notifications: signal([]),
      clear: vi.fn(),
      error: vi.fn(),
      success: vi.fn(),
      showRaw: vi.fn(),
    };

    await TestBed.configureTestingModule({
      imports: [VoteCreateDialogComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DIALOG_DATA, useValue: { topic: { ...mockTopic } } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: TopicVoteService, useValue: mockVoteService },
        { provide: TopicIdeationService, useValue: mockTopicIdeationService },
        { provide: TopicService, useValue: mockTopicService },
        { provide: NotificationService, useValue: mockNotification },
      ],
    }).compileComponents();

    fixture = TestBed.createComponent(VoteCreateDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and render Tab 1 (Introduction) by default', () => {
    expect(component).toBeTruthy();
    expect(component.tabActive()).toBe(1);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_header.voting')).toBeTruthy();
    expect(el.querySelector('.dialog_tabs_wrap.voting')).toBeTruthy();
    expect(el.querySelectorAll('.dialog_tab.success').length).toBe(4);
    expect(el.querySelector('.introduction_wrap')).toBeTruthy();
    expect(el.querySelector('.dialog_info_wrap .dialog_info.voting')).toBeTruthy();
  });

  it('should navigate from Tab 1 to Tab 2 via tabNext and render Voting System options', () => {
    component.tabNext();
    fixture.detectChanges();
    expect(component.tabActive()).toBe(2);
    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('#groupName')).toBeTruthy();
    expect(el.querySelectorAll('.radio_wrap.voting').length).toBe(2);
    expect(component.isNextDisabled()).toBe(true);

    component.vote.description = 'Should we approve this proposal?';
    expect(component.isNextDisabled()).toBe(false);
  });

  it('should disable voting system selection when TopicService.canEditDescription returns false', () => {
    mockTopicService.canEditDescription.mockReturnValue(false);
    component.setTab(2);
    fixture.detectChanges();
    const el: HTMLElement = fixture.nativeElement;
    const radioWraps = el.querySelectorAll('.radio_wrap.voting');
    expect(radioWraps[0].classList.contains('disabled')).toBe(true);
    component.setVoteType('multiple');
    expect(component.vote.type).toBe('regular');
  });

  it('should render Tab 3 (Vote Settings) for regular and multiple vote types with label.checkbox and 3 e-ID SVGs', () => {
    component.vote.description = 'Question?';
    component.setTab(3);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelectorAll('label.checkbox').length).toBeGreaterThanOrEqual(5);
    expect(el.querySelectorAll('.id_icons_wrap svg').length).toBe(3);

    // Switch to multiple vote type
    component.setVoteType('multiple');
    fixture.detectChanges();
    expect(el.querySelectorAll('.vote_options_wrap .input_area').length).toBe(3);
    expect(el.querySelectorAll('.min_max_options .btn_medium_voting_light.icon').length).toBe(4);
  });

  it('should add, remove, and update custom options and min/max choices', () => {
    component.setVoteType('multiple');
    component.customOptions[0].value = 'Option A';
    component.customOptions[1].value = 'Option B';
    component.customOptions[2].value = 'Option C';
    component.filterOptions();

    expect(component.vote.options.length).toBe(3);
    expect(component.getOptionsLimit()).toBe(3);

    component.optionsCountUp('min');
    expect(component.vote.minChoices).toBe(2);
    expect(component.vote.maxChoices).toBe(2);

    component.optionsCountUp('max');
    expect(component.vote.maxChoices).toBe(3);

    component.optionsCountDown('max');
    expect(component.vote.maxChoices).toBe(2);

    component.optionsCountDown('min');
    expect(component.vote.minChoices).toBe(1);

    component.addOption();
    expect(component.customOptions.length).toBe(4);

    component.removeOption(3);
    expect(component.customOptions.length).toBe(3);
  });

  it('should toggle predefined and extra options', () => {
    component.toggleOption('neutral');
    expect(component.extraOptions.neutral.enabled).toBe(true);
    expect(component.vote.options.some((o) => o.value === 'Neutral')).toBe(true);

    component.toggleOption('veto');
    expect(component.extraOptions.veto.enabled).toBe(true);
    expect(component.vote.options.some((o) => o.value === 'Veto')).toBe(true);

    component.toggleOption('no');
    expect(component.predefinedOptions.no.enabled).toBe(false);
  });

  it('should handle ideation folders and ideas selection when topic has ideationId', () => {
    const idea1 = { id: 'i1', statement: 'Idea 1', votes: { up: { count: 5 } } } as unknown as Idea;
    const idea2 = { id: 'i2', statement: 'Idea 2', votes: { up: { count: 2 } } } as unknown as Idea;
    const folder1 = {
      id: 'f1',
      name: 'Folder 1',
      ideas: { count: 1, rows: [idea1] },
    } as unknown as IdeationFolder;

    component.topic = { ...mockTopic, ideationId: 'ideation-1' };
    component.ideasList = [idea1, idea2];
    component.ideasCount = 2;
    component.folderList = [folder1];
    component.setVoteType('ideation');
    component.setTab(3);
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('.vote_option_ideas_wrap')).toBeTruthy();

    component.toggleFolderIdeas(folder1);
    expect(component.isShowFolderIdeas(folder1)).toBe(true);

    component.toggleFolder(folder1);
    expect(component.folderSelected(folder1)).toBe(true);
    expect(component.ideaSelected(idea1)).toBe(true);

    component.toggleAllIdeas(component.ideasList);
    expect(component.allChecked()).toBe(true);
    expect(component.vote.options.length).toBe(2);

    component.orderIdeas();
    expect(component.ideaOrder).toBe('asc');
  });

  it('should toggle deadline and configure reminder options', () => {
    component.toggleDeadline();
    expect(component.deadline).toBeTruthy();

    const future = new Date();
    future.setDate(future.getDate() + 10);
    component.endsAt.date = future;
    component.setEndsAtTime();
    expect(component.reminderOptions.length).toBeGreaterThan(0);

    component.setVoteReminder({ value: 1, unit: 'days' });
    expect(component.vote.reminderTime).toBeTruthy();

    component.toggleDeadline();
    expect(component.deadline).toBeNull();
  });

  it('should render Tab 4 (Preview) with radio_wrap and label.checkbox cards', () => {
    component.vote.description = 'Final question?';
    component.filterOptions();
    component.setTab(4);
    fixture.detectChanges();

    const el: HTMLElement = fixture.nativeElement;
    expect(el.querySelector('.dialog_info_header')).toBeTruthy();
    expect(el.querySelectorAll('.dialog_info_content .radio_wrap label.checkbox').length).toBe(2);
  });

  it('should submit createVote successfully and close dialog', () => {
    const router = TestBed.inject(Router);
    const navSpy = vi.spyOn(router, 'navigate').mockResolvedValue(true);

    component.vote.description = 'Question?';
    component.setTab(4);
    component.tabNext();

    expect(mockVoteService.save).toHaveBeenCalled();
    expect(mockTopicService.reloadTopic).toHaveBeenCalled();
    expect(mockNotification.success).toHaveBeenCalledWith('VIEWS.VOTE_CREATE.SUCCESS_VOTE_STARTED');
    expect(mockDialogRef.close).toHaveBeenCalledWith(true);
    expect(navSpy).toHaveBeenCalled();
  });

  it('should surface field errors and general API errors via NotificationService on createVote failure', () => {
    component.vote.description = 'Question?';

    mockVoteService.save.mockReturnValueOnce(
      throwError(() => ({ errors: { value: 'Invalid option' } }))
    );
    component.createVote();
    expect(mockNotification.showRaw).toHaveBeenCalledWith('error', 'Invalid option');

    mockVoteService.save.mockReturnValueOnce(
      throwError(() => ({ status: { code: 50000, message: 'Etherpad sync failed' } }))
    );
    component.createVote();
    expect(mockNotification.showRaw).toHaveBeenCalledWith('error', 'Etherpad sync failed');

    mockVoteService.save.mockReturnValueOnce(throwError(() => ({})));
    component.createVote();
    expect(mockNotification.error).toHaveBeenCalledWith('MSG_ERROR_HTTP_500');
  });
});

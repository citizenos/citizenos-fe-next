import { Component, signal, computed, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { switchMap, of, catchError, forkJoin, take, Observable } from 'rxjs';

import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { TopicDiscussionService } from '../../../core/services/topic-discussion.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { TopicMemberGroup } from '../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { TopicInviteDialogComponent } from '../topic-view/components/topic-invite-dialog/topic-invite-dialog.component';
import { Topic } from '../../../core/interfaces/topic';
import { DiscussionData } from '../../../core/interfaces/discussion';
import { Ideation } from '../../../core/interfaces/ideation';
import { VoteWithOptions } from '../../../core/interfaces/vote';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { DomainType } from '../../../shared/components/domain-icon/domain-icon.component';
import { IconName } from '../../../shared/components/icon/icon.registry';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepTopicDiscussionComponent } from '../topic-create/components/step-topic-discussion/step-topic-discussion.component';
import { StepIdeationSettingsComponent } from '../ideation-create/components/step-ideation-settings/step-ideation-settings.component';
import { StepVoteSettingsComponent } from '../vote-create/components/step-vote-settings/step-vote-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';
import { MemberEditorsPanelComponent } from '../../../shared/components/member-editors-panel/member-editors-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AnyPipe } from '../../../shared/pipes/any.pipe';
import { DialogService } from '../../../shared/dialog';
import { TopicSettingsDisabledDialogComponent } from '../topic-view/components/topic-settings-disabled-dialog/topic-settings-disabled-dialog.component';
import { TopicSettingsLockedComponent } from '../topic-view/components/topic-settings-locked/topic-settings-locked.component';
import { TopicEditDisabledDialogComponent } from '../topic-view/components/topic-edit-disabled-dialog/topic-edit-disabled-dialog.component';
import { PendingChangesComponent } from '../../../core/guards/pending-changes.guard';

@Component({
  selector: 'cos-topic-edit',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepTopicDiscussionComponent,
    StepIdeationSettingsComponent,
    StepVoteSettingsComponent,
    StepTopicPreviewComponent,
    MemberEditorsPanelComponent,
    AnyPipe,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-edit.component.html',
  styleUrl: './topic-edit.component.scss'
})
export class TopicEditComponent implements OnInit, PendingChangesComponent {
  private topicService = inject(TopicService);
  private uploadService = inject(UploadService);
  private memberUserService = inject(TopicMemberUserService);
  private inviteUserService = inject(TopicInviteUserService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private discussionService = inject(TopicDiscussionService);
  private ideationService = inject(TopicIdeationService);
  private voteService = inject(TopicVoteService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(DialogService);

  topic = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft',
    hashtag: null
  });

  domainType = computed<DomainType>(() => {
    const s = this.topic().status;
    if (s === this.topicService.STATUSES.voting) return 'vote';
    if (s === this.topicService.STATUSES.ideation) return 'ideation';
    return 'topic';
  });

  headingKey = computed<string>(() => {
    const s = this.topic().status;
    if (s === this.topicService.STATUSES.voting) return 'VIEWS.VOTE_EDIT.HEADING';
    if (s === this.topicService.STATUSES.ideation) return 'VIEWS.IDEATION_EDIT.HEADING';
    return 'VIEWS.TOPIC_EDIT.HEADING';
  });

  hasChanges = signal(false);
  discussion = signal<DiscussionData>({ question: '', deadline: null });
  ideation = signal<Partial<Ideation>>({});
  vote = signal<Partial<VoteWithOptions>>({});
  imageFile = signal<File | null>(null);
  isLoading = signal(false);
  currentStep = signal('info');

  addedGroups = signal<TopicMemberGroup[]>([]);
  groupsToRemove = signal<TopicMemberGroup[]>([]);

  private membersResource = rxResource({
    params: () => this.topic().id,
    stream: ({ params: id }) => {
      if (id) return this.memberUserService.loadItems(id);
      return of([]);
    }
  });

  members = computed(() => this.membersResource.value() || []);

  private invitesResource = rxResource({
    params: () => this.topic().id,
    stream: ({ params: id }) => {
      if (id) return this.inviteUserService.loadItems(id);
      return of([]);
    }
  });

  invites = computed(() => this.invitesResource.value() || []);

  private reloadMembers() {
    this.membersResource.reload();
    this.invitesResource.reload();
  }

  steps = signal<StepConfig[]>([
    { key: 'info', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_1', icon: 'edit' as IconName },
    { key: 'settings', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_2', icon: 'settings' as IconName },
    { key: 'discussion', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_3', icon: 'comment' as IconName },
    { key: 'preview', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_4', icon: 'eye' as IconName }
  ]);

  ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('topicId') || this.route.parent?.snapshot.paramMap.get('topicId');
    if (topicId) {
      const fragment = this.route.snapshot.fragment;
      if (fragment) {
        const step = fragment === 'ideation_system' ? 'ideation' : fragment;
        this.currentStep.set(step);
      }
      this.loadExistingTopic(topicId);
    } else {
      this.router.navigate(['/']);
    }
  }

  private loadExistingTopic(topicId: string) {
    this.isLoading.set(true);
    this.topicService.get(topicId).subscribe({
      next: (topic) => {
        if (topic.status === this.topicService.STATUSES.draft) {
          this.hasChanges.set(false);
          let redirectUrl = ['/topics', 'create', topic.id];
          if (topic.voteId) {
            redirectUrl = ['/topics', 'vote', 'create', topic.id];
          } else if (topic.ideationId) {
            redirectUrl = ['/topics', 'ideation', 'create', topic.id];
          }
          this.router.navigate(redirectUrl, { replaceUrl: true });
          return;
        }
        this.topic.set(topic);
        this.updateSteps(topic.status);

        if (topic.discussionId) {
          this.discussionService.get(topicId, topic.discussionId).subscribe({
            next: (d) => this.discussion.set({ question: d.question, deadline: d.deadline }),
            error: () => { /* intentionally empty */ }
          });
        }
        if (topic.ideationId) {
          this.ideationService.get({ topicId, ideationId: topic.ideationId }).subscribe({
            next: (i) => this.ideation.set(i),
            error: () => { /* intentionally empty */ }
          });
        }
        if (topic.voteId) {
          this.voteService.get({ topicId, voteId: topic.voteId }).subscribe({
            next: (v) => {
              const options = Array.isArray((v as VoteWithOptions).options)
                ? (v as VoteWithOptions).options
                : ((v as VoteWithOptions).options as { rows?: unknown[] } | undefined)?.rows || [];
              this.vote.set({ ...v, question: v.description || '', options } as VoteWithOptions);
            },
            error: () => { /* intentionally empty */ }
          });
        }
        this.isLoading.set(false);
        const fragment = this.route.snapshot.fragment;
        if (fragment) {
          const step = fragment === 'ideation_system' ? 'ideation' : fragment;
          this.onStepChange(step);
        } else if (!this.topicService.canEditDescription(topic) && this.currentStep() === 'info') {
          this.onStepChange('info');
        }
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_LOAD_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    const t = this.topic() as Topic;
    if (step === 'discussion' && !this.topicService.canEditDescription(t)) {
      const ref = this.dialog.open(TopicSettingsLockedComponent);
      ref.afterClosed().subscribe(() => {
        this.currentStep.set(this.topicService.canDelete(t) ? 'settings' : 'preview');
      });
      return;
    }
    if (step === 'info' && !this.topicService.canEditDescription(t)) {
      const ref = this.dialog.open(TopicEditDisabledDialogComponent);
      ref.afterClosed().subscribe(() => {
        this.currentStep.set(this.topicService.canDelete(t) ? 'settings' : 'preview');
      });
      return;
    }
    if (step === 'settings' && !this.topicService.canDelete(t)) {
      const ref = this.dialog.open(TopicSettingsDisabledDialogComponent);
      ref.afterClosed().subscribe(() => this.currentStep.set('info'));
      return;
    }
    if (this.canNavigateTo(step)) {
      this.currentStep.set(step);
      if (step === 'preview') {
        this.loadDescription();
      }
    }
  }

  private loadDescription() {
    const id = this.topic().id;
    if (!id) return;

    this.topicService.readDescription(id).pipe(take(1)).subscribe({
      next: (topic) => {
        this.topic.update(t => ({ ...t, description: topic.description }));
      }
    });
  }

  canNavigateTo(step: string): boolean {
    if (step === 'info') return true;
    return !!this.topic().title;
  }

  isFooterNextDisabled(): boolean {
    return this.currentStep() === 'info' && !this.topic().title;
  }

  handleFooterContinue() {
    switch (this.currentStep()) {
      case 'info': this.saveToSettings(); break;
      case 'settings': this.saveGroupsAndContinue(); break;
      case 'discussion': this.transitionToPreview(); break;
      case 'ideation': this.saveIdeation(); break;
      case 'voting': this.saveVote(); break;
      case 'preview': this.publishTopic(); break;
    }
  }

  private saveGroupsAndContinue() {
    const topicId = this.topic().id;
    if (!topicId) return;

    this.isLoading.set(true);
    const addOps = this.addedGroups().map(g => this.groupMemberTopicService.addTopic(g.id, topicId, g.level || 'read'));
    const removeOps = this.groupsToRemove().map(g => this.groupMemberTopicService.removeTopicFromGroup(g.id, topicId));

    forkJoin([...addOps, ...removeOps, this.topicService.patch(this.topic())]).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.isLoading.set(false);
      this.groupsToRemove.set([]);
      this.onStepChange(this.steps()[2].key);
    });
  }

  onGroupsAdded(groups: TopicMemberGroup[]) {
    this.addedGroups.set(groups);
    this.hasChanges.set(true);
  }

  onGroupRemoved(group: TopicMemberGroup) {
    this.addedGroups.update(gs => gs.filter(g => g.id !== group.id));
    this.groupsToRemove.update(gs => [...gs, group]);
    this.hasChanges.set(true);
  }

  private updateSteps(status?: string) {
    const baseSteps: StepConfig[] = [
      { key: 'info', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_1', icon: 'edit' },
      { key: 'settings', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_2', icon: 'settings' }
    ];
    const previewStep: StepConfig = { key: 'preview', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_4', icon: 'eye' };

    if (status === this.topicService.STATUSES.ideation) {
      this.steps.set([
        ...baseSteps,
        { key: 'ideation', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_3', icon: 'activity' },
        previewStep
      ]);
    } else if (status === this.topicService.STATUSES.voting) {
      this.steps.set([
        ...baseSteps,
        { key: 'voting', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_3', icon: 'check' },
        previewStep
      ]);
    } else {
      this.steps.set([
        ...baseSteps,
        { key: 'discussion', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_3', icon: 'comment' },
        previewStep
      ]);
    }
  }

  handleFooterBack() {
    const order = this.steps().map(s => s.key);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.onStepChange(order[idx - 1]);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topic.update(t => ({ ...t, ...updates }));
    this.hasChanges.set(true);
    if (updates.id) {
      this.reloadMembers();
    }
  }

  onImageFileUpdate(file: File | null) {
    this.imageFile.set(file);
    this.hasChanges.set(true);
  }

  onDiscussionChange(d: DiscussionData) {
    this.discussion.set(d);
    this.hasChanges.set(true);
  }

  onIdeationChange(i: Partial<Ideation>) {
    this.ideation.set(i);
    this.hasChanges.set(true);
  }

  onVoteChange(v: Partial<VoteWithOptions>) {
    this.vote.set(v);
    this.hasChanges.set(true);
  }

  saveToSettings() {
    const t = this.topic();
    if (!t.id) return;

    const patchAndUpload$ = this.topicService.patch(t).pipe(
      switchMap((updated) => {
        this.topic.set(updated);
        if (this.imageFile()) {
          const path = `/api/users/self/topics/${updated.id}/upload`;
          return this.uploadService.upload(path, this.imageFile()!);
        }
        return of(null);
      }),
      catchError(() => {
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
        return of(null);
      })
    );

    this.isLoading.set(true);
    patchAndUpload$.subscribe(() => {
      this.isLoading.set(false);
      this.onStepChange('settings');
    });
  }

  transitionToPreview() {
    const t = this.topic();
    const disc = this.discussion();

    if (!t.id || !disc.question) {
      this.currentStep.set('preview');
      return;
    }

    this.isLoading.set(true);
    const save$ = t.discussionId
      ? this.discussionService.update(t.id, t.discussionId, disc)
      : this.discussionService.create(t.id, disc);

    save$.pipe(catchError(() => of(null))).subscribe((d) => {
      if (d) this.topic.update(current => ({ ...current, discussionId: d.id }));
      this.isLoading.set(false);
      this.currentStep.set('preview');
    });
  }

  saveAsDraft() {
    const t = this.topic();
    if (!t.id) return;

    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: (savedTopic) => {
        this.topic.set(savedTopic);
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
        this.hasChanges.set(false);
        this.router.navigate(['/topics', savedTopic.id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  publishTopic() {
    this.isLoading.set(true);
    const t = this.topic();
    const wasDraft = t.status === this.topicService.STATUSES.draft;
    const disc = this.discussion();
    const v = this.vote();
    const idea = this.ideation();

    this.topicService.patch({ ...t }).pipe(
      switchMap((savedTopic) => {
        this.topic.set(savedTopic);
        const sideOps: Record<string, Observable<unknown>> = { topic: of(savedTopic) };

        if (savedTopic.id) {
          this.addedGroups().forEach((g, idx) => {
            sideOps[`addGroup_${idx}`] = this.groupMemberTopicService.addTopic(g.id, savedTopic.id, g.level || 'read').pipe(catchError(() => of(null)));
          });
          this.groupsToRemove().forEach((g, idx) => {
            sideOps[`removeGroup_${idx}`] = this.groupMemberTopicService.removeTopicFromGroup(g.id, savedTopic.id).pipe(catchError(() => of(null)));
          });
        }

        if (savedTopic.voteId && v && Object.keys(v).length > 0) {
          const voteData = { ...v, id: v.id || savedTopic.voteId, topicId: savedTopic.id, description: v.question };
          sideOps['vote'] = this.voteService.update(voteData).pipe(catchError(() => of(null)));
        } else if (savedTopic.ideationId && idea && Object.keys(idea).length > 0) {
          sideOps['ideation'] = this.ideationService.update({ ...idea, topicId: savedTopic.id }).pipe(catchError(() => of(null)));
        } else if (disc.question && (!savedTopic.status || [this.topicService.STATUSES.draft, this.topicService.STATUSES.inProgress].includes(savedTopic.status))) {
          const discSave$ = savedTopic.discussionId
            ? this.discussionService.update(savedTopic.id, savedTopic.discussionId, disc)
            : this.discussionService.create(savedTopic.id, disc);
          sideOps['discussion'] = discSave$.pipe(catchError(() => of(null)));
        }

        return forkJoin(sideOps);
      }),
      catchError(() => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
        return of(null);
      })
    ).subscribe((result) => {
      if (!result) return;
      const savedTopic = (result as { topic?: Topic }).topic ?? result as unknown as Topic;
      this.groupsToRemove.set([]);
      this.isLoading.set(false);
      this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
      this.hasChanges.set(false);
      if (wasDraft) {
        this.dialog.open(TopicInviteDialogComponent, {
          data: { topic: savedTopic }
        }).afterClosed().subscribe(() => {
          this.router.navigate(['/topics', savedTopic.id]);
        });
      } else {
        this.router.navigate(['/topics', savedTopic.id]);
      }
    });
  }

  saveIdeation() {
    const t = this.topic();
    const _i = this.ideation();
    if (!t.id || !t.ideationId) {
      this.currentStep.set('preview');
      return;
    }
    this.isLoading.set(true);
    this.ideationService.update({ ...this.ideation(), topicId: t.id || '' }).pipe(take(1)).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set('preview');
      },
      error: () => {
        this.isLoading.set(false);
        this.currentStep.set('preview');
      }
    });
  }

  saveVote() {
    const t = this.topic();
    const v = this.vote();
    if (!t.id || !t.voteId) {
      this.currentStep.set('preview');
      return;
    }
    this.isLoading.set(true);
    const voteData = { ...v, topicId: t.id || '', description: v.question };
    this.voteService.update(voteData).pipe(take(1)).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.currentStep.set('preview');
      },
      error: () => {
        this.isLoading.set(false);
        this.currentStep.set('preview');
      }
    });
  }

  cancelEdit() {
    const id = this.topic().id;
    if (id) {
      this.router.navigate(['/topics', id]);
    } else {
      this.router.navigate(['/my/topics']);
    }
  }

  doDeleteTopic() {
    const topicId = this.topic().id;
    if (!topicId) return;

    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_DELETE_CONFIRM_HEADING',
        title: 'MODALS.TOPIC_DELETE_CONFIRM_TXT_ARE_YOU_SURE',
        description: 'MODALS.TOPIC_DELETE_CONFIRM_TXT_NO_UNDO',
        points: [
          'MODALS.TOPIC_DELETE_CONFIRM_TXT_TOPIC_DELETED',
          'MODALS.TOPIC_DELETE_CONFIRM_TXT_DISCUSSION_DELETED',
          'MODALS.TOPIC_DELETE_CONFIRM_TXT_TOPIC_REMOVED_FROM_GROUPS'
        ],
        confirmBtn: 'MODALS.TOPIC_DELETE_CONFIRM_YES',
        closeBtn: 'MODALS.TOPIC_DELETE_CONFIRM_NO'
      }
    });

    dialogRef.afterClosed().pipe(take(1)).subscribe(result => {
      if (result === true) {
        this.isLoading.set(true);
        this.topicService.delete({ id: topicId }).pipe(take(1)).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.hasChanges.set(false);
            this.router.navigate(['/my/topics']);
          },
          error: () => {
            this.isLoading.set(false);
            this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
          }
        });
      }
    });
  }

  inviteEditors() {
    const topic = this.topic();
    if (topic.id) {
      this.dialog.open(TopicInviteDialogComponent, {
        data: { topic: topic as Topic, allowedLevels: ['edit', 'admin'] }
      }).afterClosed().subscribe(() => {
        this.reloadMembers();
      });
    }
  }

  hasUnsavedChanges(): boolean {
    return this.hasChanges();
  }

  removeChanges() {
    const t = this.topic() as Partial<Topic> & { revision?: number };
    if (t?.id && t?.revision) {
      this.topicService.revert(t.id, t.revision).pipe(take(1)).subscribe();
    }
  }
}

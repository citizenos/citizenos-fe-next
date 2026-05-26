import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { VoteWithOptions } from '../../../core/interfaces/vote';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepVoteSettingsComponent } from './components/step-vote-settings/step-vote-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';
import { switchMap, take, BehaviorSubject, of, forkJoin, catchError } from 'rxjs';
import { TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { TopicMemberGroup } from '../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TopicInviteDialogComponent } from '../topic-view/components/topic-invite-dialog/topic-invite-dialog.component';
import { MemberEditorsPanelComponent } from '../../../shared/components/member-editors-panel/member-editors-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { AnyPipe } from '../../../shared/pipes/any.pipe';
import { PendingChangesComponent } from '../../../core/guards/pending-changes.guard';

@Component({
  selector: 'cos-vote-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepVoteSettingsComponent,
    StepTopicPreviewComponent,
    MemberEditorsPanelComponent,
    AnyPipe
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './vote-create.component.html',
  styleUrl: './vote-create.component.scss'
})
export class VoteCreateComponent implements OnInit, PendingChangesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private voteService = inject(TopicVoteService);
  private notification = inject(NotificationService);
  private memberUserService = inject(TopicMemberUserService);
  private inviteUserService = inject(TopicInviteUserService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private dialog = inject(DialogService);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'voting', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_3', icon: 'check' },
    { key: 'preview', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  currentStep = signal('info');
  isLoading = signal(false);
  hasChanges = signal(true);

  topic = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft'
  });

  vote = signal<Partial<VoteWithOptions>>({
    question: '',
    type: 'regular',
    authType: 'soft',
    options: [{ value: 'Yes' }, { value: 'No' }],
    delegationIsAllowed: false,
    autoClose: [{ value: 'allMembersVoted', enabled: false }],
    endsAt: null
  });

  addedGroups = signal<TopicMemberGroup[]>([]);
  groupsToRemove = signal<TopicMemberGroup[]>([]);

  private reloadMembers$ = new BehaviorSubject<void>(void 0);

  members = toSignal(
    this.reloadMembers$.pipe(
      switchMap(() => {
        const id = this.topic().id;
        if (id) return this.memberUserService.loadItems(id);
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  invites = toSignal(
    this.reloadMembers$.pipe(
      switchMap(() => {
        const id = this.topic().id;
        if (id) return this.inviteUserService.loadItems(id);
        return of([]);
      })
    ),
    { initialValue: [] }
  );

  ngOnInit() {
    const topicId = this.route.snapshot.params['topicId'];
    if (topicId) {
      this.loadExistingTopic(topicId);
    } else {
      this.createEagerly();
    }
  }

  private loadExistingTopic(topicId: string) {
    this.isLoading.set(true);
    this.topicService.get(topicId).subscribe({
      next: (topic) => {
        this.topic.set(topic);
        this.reloadMembers$.next();
        if (topic.voteId) {
          this.voteService.get({ topicId: topic.id, voteId: topic.voteId }).subscribe({
            next: (vote: VoteWithOptions) => {
              const options = Array.isArray(vote.options) ? vote.options : (vote.options?.rows || []);
              this.vote.set({
                ...vote,
                question: vote.description ?? undefined,
                options
              });
            },
            error: () => { /* intentionally empty */ }
          });
        }
        this.isLoading.set(false);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_LOAD_FAILED');
      }
    });
  }

  private createEagerly() {
    this.isLoading.set(true);
    const initialPayload = {
      description: '<html><head></head><body></body></html>',
      status: 'draft',
      visibility: 'private'
    };
    this.topicService.save(initialPayload).pipe(
      take(1),
      switchMap((savedTopic) => {
        this.topic.set(savedTopic);
        this.reloadMembers$.next();
        const voteData = {
          ...this.vote(),
          topicId: savedTopic.id,
          description: this.vote().question || ' '
        };
        return this.voteService.save(voteData);
      })
    ).subscribe({
      next: (savedVote: VoteWithOptions) => {
        const options = Array.isArray(savedVote.options) ? savedVote.options : (savedVote.options?.rows || []);
        this.vote.set({
          ...savedVote,
          question: savedVote.description ?? undefined,
          options
        });
        this.isLoading.set(false);
        this.router.navigate([this.topic().id], {
          relativeTo: this.route,
          replaceUrl: true
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    this.currentStep.set(step);
    if (step === 'preview') {
      this.loadDescription();
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

  isFooterNextDisabled(): boolean {
    if (this.currentStep() === 'info') return !this.topic().title;
    if (this.currentStep() === 'voting') {
      const v = this.vote();
      const options = Array.isArray(v.options) ? v.options : (v.options?.rows || []);
      const validOptionsCount = options.filter(o => !!o.value).length;
      return !v.question || validOptionsCount < 2;
    }
    return false;
  }

  handleFooterContinue() {
    switch (this.currentStep()) {
      case 'info': this.saveToSettings(); break;
      case 'settings': this.saveGroupsAndContinue(); break;
      case 'voting': this.currentStep.set('preview'); break;
      case 'preview': this.onPublish(); break;
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
      this.onStepChange('voting');
    });
  }

  handleFooterBack() {
    const order = this.steps.map(s => s.key);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1]);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topic.update(t => ({ ...t, ...updates }));
    if (updates.id) {
      this.reloadMembers$.next();
    }
  }

  onVoteUpdate(updates: Partial<VoteWithOptions>) {
    this.vote.update(v => ({ ...v, ...updates }));
  }

  onGroupsAdded(groups: TopicMemberGroup[]) {
    this.addedGroups.set(groups);
  }

  onGroupRemoved(group: TopicMemberGroup) {
    this.addedGroups.update(gs => gs.filter(g => g.id !== group.id));
    this.groupsToRemove.update(gs => [...gs, group]);
  }

  inviteEditors() {
    const topic = this.topic();
    if (topic.id) {
      this.dialog.open(TopicInviteDialogComponent, {
        data: { topic: topic as Topic, allowedLevels: ['edit', 'admin'] }
      }).afterClosed().subscribe(() => {
        this.reloadMembers$.next();
      });
    } else {
      this.notification.showRaw('info', 'VIEWS.TOPIC_CREATE.SAVE_FIRST_TO_INVITE');
    }
  }

  saveToSettings() {
    const t = this.topic();
    if (!t.id) {
      this.createEagerly();
      return;
    }
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: (updated) => {
        this.topic.set(updated);
        this.isLoading.set(false);
        this.onStepChange('settings');
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  saveAsDraft() {
    const t = this.topic();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: () => {
        if (this.vote().id && t.id) {
          const voteData = { ...this.vote(), topicId: t.id, description: this.vote().question };
          this.voteService.update(voteData).pipe(take(1)).subscribe();
        }
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
        this.hasChanges.set(false);
        this.router.navigate(['/topics', t.id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onPublish() {
    const t = this.topic();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch({ ...t, status: 'voting' }).subscribe({
      next: (savedTopic) => {
        if (!t.id) return;
        const currentVote = this.vote();
        const voteData = { 
          ...currentVote, 
          topicId: t.id, 
          description: currentVote.question,
          type: currentVote.type === 'ideation' ? 'multiple' : currentVote.type
        };
        this.voteService.update(voteData).pipe(take(1)).subscribe({
          next: () => {
            this.isLoading.set(false);
            this.notification.showRaw('success', 'VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
            this.hasChanges.set(false);
            this.dialog.open(TopicInviteDialogComponent, {
              data: { topic: savedTopic }
            }).afterClosed().subscribe(() => {
              this.router.navigate(['/topics', savedTopic.id]);
            });
          },
          error: () => {
            this.isLoading.set(false);
            this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
          }
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
      }
    });
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
        points: ['MODALS.TOPIC_DELETE_CONFIRM_TXT_TOPIC_DELETED', 'MODALS.TOPIC_DELETE_CONFIRM_TXT_DISCUSSION_DELETED', 'MODALS.TOPIC_DELETE_CONFIRM_TXT_TOPIC_REMOVED_FROM_GROUPS'],
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

  hasUnsavedChanges(): boolean {
    return this.hasChanges();
  }

  removeChanges() {
    const topicId = this.topic().id;
    if (topicId) {
      this.topicService.delete({ id: topicId }).pipe(take(1)).subscribe();
    }
  }
}


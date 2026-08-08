import { Location } from '@angular/common';
import { Component, OnInit, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { switchMap, take, of, forkJoin, catchError } from 'rxjs';
import { TopicMemberUser, TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInvite, TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { TopicMemberGroup } from '../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TopicInviteDialogComponent } from '../topic-view/components/topic-invite-dialog/topic-invite-dialog.component';
import { MemberEditorsPanelComponent } from '../../../shared/components/member-editors-panel/member-editors-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PendingChangesComponent } from '../../../core/guards/pending-changes.guard';

export type VoteCreateStep = 'info' | 'settings' | 'voting' | 'preview';

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
    MemberEditorsPanelComponent
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
  private translate = inject(TranslateService);
  private location = inject(Location);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'voting', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_3', icon: 'check' },
    { key: 'preview', label: 'VIEWS.VOTE_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  currentStep = signal<VoteCreateStep>('info');
  isLoading = signal(false);
  hasChanges = signal(true);

  topicModel = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft'
  });

  topicForm = form(this.topicModel, (path) => {
    required(path.title!);
  });

  voteModel = signal<Partial<VoteWithOptions>>({
    question: '',
    type: 'regular',
    authType: 'soft',
    options: [{ value: 'Yes' }, { value: 'No' }],
    delegationIsAllowed: false,
    autoClose: [{ value: 'allMembersVoted', enabled: false }],
    endsAt: null
  });

  voteForm = form(this.voteModel, (path) => {
    required(path.question!);
  });

  addedGroups = signal<TopicMemberGroup[]>([]);
  groupsToRemove = signal<TopicMemberGroup[]>([]);

  private membersResource = rxResource<TopicMemberUser[], string | undefined>({
    params: () => this.topicModel().id,
    stream: ({ params: id }: { params: string | undefined }) => {
      if (id) return this.memberUserService.loadItems(id);
      return of([]);
    }
  });
  members = computed(() => this.membersResource.value() ?? []);

  private invitesResource = rxResource<TopicInvite[], string | undefined>({
    params: () => this.topicModel().id,
    stream: ({ params: id }: { params: string | undefined }) => {
      if (id) return this.inviteUserService.loadItems(id);
      return of([]);
    }
  });
  invites = computed(() => this.invitesResource.value() ?? []);

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
        this.topicModel.set(topic);
        this.membersResource.reload();
        this.invitesResource.reload();
        if (topic.voteId) {
          this.voteService.get({ topicId: topic.id, voteId: topic.voteId }).subscribe({
            next: (vote: VoteWithOptions) => {
              const options = Array.isArray(vote.options) ? vote.options : (vote.options?.rows || []);
              this.voteModel.set({
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
        this.topicModel.set(savedTopic);
        this.membersResource.reload();
        this.invitesResource.reload();
        const voteData = {
          ...this.voteModel(),
          topicId: savedTopic.id,
          description: this.voteModel().question || ' '
        };
        return this.voteService.save(voteData);
      })
    ).subscribe({
      next: (savedVote: VoteWithOptions) => {
        const options = Array.isArray(savedVote.options) ? savedVote.options : (savedVote.options?.rows || []);
        this.voteModel.set({
          ...savedVote,
          question: savedVote.description ?? undefined,
          options
        });
        this.isLoading.set(false);
        this.hasChanges.set(false);
        
        const currentUrl = this.router.url;
        const newUrl = `${currentUrl}/${this.topicModel().id}`;
        this.location.replaceState(newUrl);
        this.hasChanges.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    this.currentStep.set(step as VoteCreateStep);
    if (step === 'preview') {
      this.loadDescription();
    }
  }

  private loadDescription() {
    const id = this.topicModel().id;
    if (!id) return;

    this.topicService.readDescription(id).pipe(take(1)).subscribe({
      next: (topic) => {
        this.topicModel.update((t) => ({ ...t, description: topic.description }));
      }
    });
  }

  isFooterNextDisabled(): boolean {
    if (this.currentStep() === 'info') return !this.topicModel().title;
    if (this.currentStep() === 'voting') {
      const v = this.voteModel();
      const options = Array.isArray(v.options) ? v.options : (v.options?.rows || []);
      const validOptionsCount = options.filter((o: { value?: string }) => !!o.value).length;
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
    const topicId = this.topicModel().id;
    if (!topicId) return;

    this.isLoading.set(true);
    const addOps = this.addedGroups().map(g => this.groupMemberTopicService.addTopic(g.id, topicId, g.level || 'read'));
    const removeOps = this.groupsToRemove().map(g => this.groupMemberTopicService.removeTopicFromGroup(g.id, topicId));

    forkJoin([...addOps, ...removeOps, this.topicService.patch(this.topicModel() as Partial<Topic> & { id: string })]).pipe(
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
    if (idx > 0) this.currentStep.set(order[idx - 1] as VoteCreateStep);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topicModel.update((t) => ({ ...t, ...updates }));
    if (updates.id) {
      this.membersResource.reload();
      this.invitesResource.reload();
    }
  }

  onVoteUpdate(updates: Partial<VoteWithOptions>) {
    this.voteModel.update((v) => ({ ...v, ...updates }));
  }

  onGroupsAdded(groups: TopicMemberGroup[]) {
    this.addedGroups.set(groups);
  }

  onGroupRemoved(group: TopicMemberGroup) {
    this.addedGroups.update(gs => gs.filter(g => g.id !== group.id));
    this.groupsToRemove.update(gs => [...gs, group]);
  }

  inviteEditors() {
    const topic = this.topicModel();
    if (topic.id) {
      this.dialog.open(TopicInviteDialogComponent, {
        data: { topic: topic as Topic, allowedLevels: ['edit', 'admin'] }
      }).afterClosed().subscribe(() => {
        this.membersResource.reload();
        this.invitesResource.reload();
      });
    } else {
      this.notification.showRaw('info', 'VIEWS.TOPIC_CREATE.SAVE_FIRST_TO_INVITE');
    }
  }

  saveToSettings() {
    const t = this.topicModel();
    if (!t.id) {
      this.createEagerly();
      return;
    }
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: (updated) => {
        this.topicModel.set(updated);
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
    const t = this.topicModel();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch(t).subscribe({
      next: () => {
        if (t.id) {
          const voteData = { ...this.voteModel(), topicId: t.id, description: this.voteModel().question };
          const request = this.voteModel().id ? this.voteService.update(voteData) : this.voteService.save(voteData);
          request.pipe(take(1)).subscribe({
            next: (savedVote) => {
              this.voteModel.update(v => ({ ...v, id: savedVote.id }));
            }
          });
        }
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
        this.hasChanges.set(false);
        this.router.navigate(['/', this.translate.currentLang || 'en', 'topics', t.id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onPublish() {
    const t = this.topicModel();
    if (!t.id) return;
    this.isLoading.set(true);

    const currentVote = this.voteModel();
    const voteData = { 
      ...currentVote, 
      topicId: t.id, 
      description: currentVote.question,
      type: currentVote.type === 'ideation' ? 'multiple' : currentVote.type
    };

    const request = currentVote.id ? this.voteService.update(voteData) : this.voteService.save(voteData);

    request.pipe(
      take(1),
      switchMap((savedVote) => {
        this.voteModel.update(v => ({ ...v, id: savedVote.id }));
        return this.topicService.patch({ ...t, status: 'voting' }).pipe(take(1));
      })
    ).subscribe({
      next: (savedTopic) => {
        this.isLoading.set(false);
        this.notification.showRaw('success', 'VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE');
        this.hasChanges.set(false);
        this.dialog.open(TopicInviteDialogComponent, {
          data: { topic: savedTopic }
        }).afterClosed().subscribe(() => {
          this.router.navigate(['/', this.translate.currentLang || 'en', 'topics', savedTopic.id]);
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
      }
    });
  }

  doDeleteTopic() {
    const topicId = this.topicModel().id;
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
    const topicId = this.topicModel().id;
    if (topicId) {
      this.topicService.delete({ id: topicId }).pipe(take(1)).subscribe();
    }
  }
}


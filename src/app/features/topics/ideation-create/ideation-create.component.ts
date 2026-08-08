import { Component, OnInit, signal, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { form, required } from '@angular/forms/signals';
import { ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { Topic } from '../../../core/interfaces/topic';
import { Ideation } from '../../../core/interfaces/ideation';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from '../topic-create/components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from '../topic-create/components/step-topic-settings/step-topic-settings.component';
import { StepIdeationSettingsComponent } from './components/step-ideation-settings/step-ideation-settings.component';
import { StepTopicPreviewComponent } from '../topic-create/components/step-topic-preview/step-topic-preview.component';
import { take, of, forkJoin, catchError, switchMap } from 'rxjs';
import { TopicMemberUser, TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInvite, TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { TopicMemberGroup } from '../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TopicInviteDialogComponent } from '../topic-view/components/topic-invite-dialog/topic-invite-dialog.component';
import { MemberEditorsPanelComponent } from '../../../shared/components/member-editors-panel/member-editors-panel.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { PendingChangesComponent } from '../../../core/guards/pending-changes.guard';

export type IdeationCreateStep = 'info' | 'settings' | 'ideation' | 'preview';

@Component({
  selector: 'cos-ideation-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepIdeationSettingsComponent,
    StepTopicPreviewComponent,
    MemberEditorsPanelComponent
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './ideation-create.component.html',
  styleUrl: './ideation-create.component.scss'
})
export class IdeationCreateComponent implements OnInit, PendingChangesComponent {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicService = inject(TopicService);
  private ideationService = inject(TopicIdeationService);
  private uploadService = inject(UploadService);
  private notification = inject(NotificationService);
  private memberUserService = inject(TopicMemberUserService);
  private inviteUserService = inject(TopicInviteUserService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private dialog = inject(DialogService);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'ideation', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_3', icon: 'activity' },
    { key: 'preview', label: 'VIEWS.IDEATION_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  currentStep = signal<IdeationCreateStep>('info');
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

  topicForm = form(this.topicModel, (path: any) => {
    required(path.title);
  });

  ideationModel = signal<Partial<Ideation>>({
    question: '',
    allowAnonymous: false,
    disableReplies: false
  });

  ideationForm = form(this.ideationModel, (path: any) => {
    required(path.question);
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
        if (topic.ideationId && topic.ideationId !== 'undefined') {
          console.log('BROWSER CONSOLE: loadExistingTopic fetching ideation:', topic.ideationId);
          this.ideationService.get({ topicId: topic.id, ideationId: topic.ideationId }).subscribe({
            next: (ideation) => {
              console.log('BROWSER CONSOLE: loadExistingTopic got ideation:', ideation.id);
              this.ideationModel.set(ideation);
            },
            error: (err) => { 
              console.log('BROWSER CONSOLE: loadExistingTopic err:', err);
            }
          });
        } else {
          console.log('BROWSER CONSOLE: loadExistingTopic NO ideationId in topic:', topic);
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
        const ideationData = { ...this.ideationModel(), topicId: savedTopic.id || '', question: ' ' };
        return this.ideationService.save(ideationData);
      })
    ).subscribe({
      next: (savedIdeation) => {
        console.log('BROWSER CONSOLE: CREATED IDEATION ID IS: ' + savedIdeation.id);
        this.ideationModel.set(savedIdeation);
        this.isLoading.set(false);
        this.hasChanges.set(false);
        this.router.navigate([this.topicModel().id], {
          relativeTo: this.route,
          replaceUrl: true
        }).then(() => {
          this.hasChanges.set(true);
        });
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    if (this.canNavigateTo(step)) {
      this.currentStep.set(step as IdeationCreateStep);
    }
    if (step === 'preview') {
      this.loadDescription();
    }
  }

  private loadDescription() {
    const id = this.topicModel().id;
    if (!id) return;

    this.topicService.readDescription(id).pipe(take(1)).subscribe({
      next: (topic) => {
        this.topicModel.update((t: any) => ({ ...t, description: topic.description }));
      }
    });
  }

  canNavigateTo(step: string): boolean {
    if (step === 'info') return true;
    if (!this.topicModel().title) return false;
    if (step === 'preview' && !this.ideationModel().question) return false;
    return true;
  }

  isFooterNextDisabled(): boolean {
    if (this.currentStep() === 'info') return !this.topicModel().title;
    if (this.currentStep() === 'ideation') return !this.ideationModel().question;
    return false;
  }

  handleFooterContinue() {
    switch (this.currentStep()) {
      case 'info': this.saveToSettings(); break;
      case 'settings': this.saveGroupsAndContinue(); break;
      case 'ideation': this.currentStep.set('preview'); break;
      case 'preview': this.onPublish(); break;
    }
  }

  private saveGroupsAndContinue() {
    const topicId = this.topicModel().id;
    if (!topicId) return;

    this.isLoading.set(true);
    const addOps = this.addedGroups().map(g => this.groupMemberTopicService.addTopic(g.id, topicId, g.level || 'read'));
    const removeOps = this.groupsToRemove().map(g => this.groupMemberTopicService.removeTopicFromGroup(g.id, topicId));

    forkJoin([...addOps, ...removeOps, this.topicService.patch(this.topicModel() as any)]).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.isLoading.set(false);
      this.groupsToRemove.set([]);
      this.onStepChange('ideation');
    });
  }

  handleFooterBack() {
    const order = this.steps.map(s => s.key);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1] as IdeationCreateStep);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topicModel.update((t: any) => ({ ...t, ...updates }));
    if (updates.id) {
      this.membersResource.reload();
      this.invitesResource.reload();
    }
  }

  onIdeationUpdate(updates: Partial<Ideation>) {
    this.ideationModel.update((i: any) => ({ ...i, ...updates }));
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
        const payload = { ...this.ideationModel(), topicId: t.id || '' };
        if (payload.id && payload.id !== 'undefined') {
          this.ideationService.update(payload).pipe(take(1)).subscribe();
        } else if (payload.question && payload.question.trim().length > 0) {
          this.ideationService.save(payload).pipe(take(1)).subscribe();
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
    const t = this.topicModel();
    if (!t.id) return;
    this.isLoading.set(true);
    this.topicService.patch({ ...t, status: 'ideation' }).subscribe({
      next: (savedTopic) => {
        const payload = { ...this.ideationModel(), topicId: t.id || '' };
        console.log('BROWSER CONSOLE: onPublish payload.id is:', payload.id);
        const request$ = payload.id && payload.id !== 'undefined'
          ? this.ideationService.update(payload)
          : this.ideationService.save(payload);

        request$.pipe(take(1)).subscribe({
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


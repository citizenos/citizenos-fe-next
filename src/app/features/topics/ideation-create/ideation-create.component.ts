import { Component, OnInit, signal, inject, ChangeDetectionStrategy } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
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
  selector: 'cos-ideation-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepIdeationSettingsComponent,
    StepTopicPreviewComponent,
    MemberEditorsPanelComponent,
    AnyPipe
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

  ideation = signal<Partial<Ideation>>({
    question: '',
    allowAnonymous: false,
    disableReplies: false
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
        if (topic.ideationId) {
          this.ideationService.get({ topicId: topic.id, ideationId: topic.ideationId }).subscribe({
            next: (ideation) => this.ideation.set(ideation),
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
        const ideationData = { ...this.ideation(), topicId: savedTopic.id || '', question: ' ' };
        return this.ideationService.save(ideationData);
      })
    ).subscribe({
      next: (savedIdeation) => {
        this.ideation.set(savedIdeation);
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
    if (this.currentStep() === 'ideation') return !this.ideation().question;
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
      this.onStepChange('ideation');
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

  onIdeationUpdate(updates: Partial<Ideation>) {
    this.ideation.update(i => ({ ...i, ...updates }));
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
        if (this.ideation().id) {
          this.ideationService.update({ ...this.ideation(), topicId: t.id || '' }).pipe(take(1)).subscribe();
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
    this.topicService.patch({ ...t, status: 'ideation' }).subscribe({
      next: (savedTopic) => {
        this.ideationService.update({ ...this.ideation(), topicId: t.id || '' }).pipe(take(1)).subscribe({
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


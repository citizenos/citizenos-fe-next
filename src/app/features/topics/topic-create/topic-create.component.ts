import { IconComponent } from '../../../shared/components/icon/icon.component';
import { Component, signal, inject, ChangeDetectionStrategy, OnInit, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { Location } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Router, ActivatedRoute } from '@angular/router';
import { form, required } from '@angular/forms/signals';
import { TopicService } from '../../../core/services/topic.service';
import { UploadService } from '../../../core/services/upload.service';
import { NotificationService } from '../../../core/services/notification.service';
import { TopicMemberUser, TopicMemberUserService } from '../../../core/services/topic-member-user.service';
import { TopicInvite, TopicInviteUserService } from '../../../core/services/topic-invite-user.service';
import { TopicDiscussionService } from '../../../core/services/topic-discussion.service';
import { Topic } from '../../../core/interfaces/topic';
import { Discussion, DiscussionData } from '../../../core/interfaces/discussion';
import { StepConfig } from '../../../shared/components/step-navigator/step-navigator.component';
import { CreateWizardShellComponent } from '../../../shared/components/create-wizard-shell/create-wizard-shell.component';
import { StepTopicInfoComponent } from './components/step-topic-info/step-topic-info.component';
import { StepTopicSettingsComponent } from './components/step-topic-settings/step-topic-settings.component';
import { StepTopicDiscussionComponent } from './components/step-topic-discussion/step-topic-discussion.component';
import { StepTopicPreviewComponent } from './components/step-topic-preview/step-topic-preview.component';
import { MemberEditorsPanelComponent } from '../../../shared/components/member-editors-panel/member-editors-panel.component';
import { switchMap, of, catchError, forkJoin, take, Observable, map } from 'rxjs';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { TopicMemberGroup } from '../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { TopicInviteDialogComponent } from '../topic-view/components/topic-invite-dialog/topic-invite-dialog.component';
import { ConfirmDialogComponent } from '../../../shared/components/confirm-dialog/confirm-dialog.component';
import { GroupDetailService } from '../../../core/services/group-detail.service';
import { PendingChangesComponent } from '../../../core/guards/pending-changes.guard';

export type TopicCreateStep = 'info' | 'settings' | 'discussion' | 'preview';

@Component({
  selector: 'cos-topic-create',
  standalone: true,
  imports: [
    TranslateModule,
    CreateWizardShellComponent,
    StepTopicInfoComponent,
    StepTopicSettingsComponent,
    StepTopicDiscussionComponent,
    StepTopicPreviewComponent,
    MemberEditorsPanelComponent,
    IconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-create.component.html',
  styleUrl: './topic-create.component.scss'
})
export class TopicCreateComponent implements OnInit, PendingChangesComponent {
  private topicService = inject(TopicService);
  private uploadService = inject(UploadService);
  private memberUserService = inject(TopicMemberUserService);
  private inviteUserService = inject(TopicInviteUserService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private discussionService = inject(TopicDiscussionService);
  private notification = inject(NotificationService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private dialog = inject(DialogService);
  private groupDetailService = inject(GroupDetailService);
  private translate = inject(TranslateService);
  private location = inject(Location);

  topicModel = signal<Partial<Topic>>({
    title: '',
    intro: '',
    description: '<html><head></head><body></body></html>',
    visibility: 'private',
    categories: [],
    status: 'draft',
    hashtag: null
  });

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  topicForm = form(this.topicModel, (path: any) => {
    required(path.title);
  });

  discussion = signal<DiscussionData>({ question: '', deadline: null });
  imageFile = signal<File | null>(null);
  isLoading = signal(false);
  currentStep = signal<TopicCreateStep>('info');
  isCreatedFromGroup = signal(false);
  showHelp = signal(true);
  hasChanges = signal(true);

  addedGroups = signal<TopicMemberGroup[]>([]);
  groupsToRemove = signal<TopicMemberGroup[]>([]);

  membersResource = rxResource<TopicMemberUser[], string | undefined>({
    params: () => this.topicModel().id,
    stream: ({ params: id }: { params: string | undefined }) => id ? this.memberUserService.loadItems(id) : of([])
  });
  members = computed(() => this.membersResource.value() ?? []);

  invitesResource = rxResource<TopicInvite[], string | undefined>({
    params: () => this.topicModel().id,
    stream: ({ params: id }: { params: string | undefined }) => id ? this.inviteUserService.loadItems(id) : of([])
  });
  invites = computed(() => this.invitesResource.value() ?? []);

  readonly steps: StepConfig[] = [
    { key: 'info', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_1', icon: 'edit' },
    { key: 'settings', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_2', icon: 'settings' },
    { key: 'discussion', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_3', icon: 'comment' },
    { key: 'preview', label: 'VIEWS.TOPIC_CREATE.CREATE_TAB_4', icon: 'eye' }
  ];

  ngOnInit() {
    const topicId = this.route.snapshot.paramMap.get('topicId');
    
    this.route.queryParams.pipe(take(1)).subscribe({
      next: (params) => {
        const grId = params['groupId'];
        if (grId) {
          this.isCreatedFromGroup.set(true);
          this.groupDetailService.loadGroup(grId).subscribe({
            next: (group) => {
              this.onGroupsAdded([{ ...group, level: 'read' }]);
              this.onTopicUpdate({ visibility: 'private' });
            }
          });
        }
      }
    });

    if (topicId) {
      this.loadExistingTopic(topicId);
    } else {
      this.createTopicEagerly();
    }
  }

  private loadExistingTopic(topicId: string) {
    this.isLoading.set(true);
    this.topicService.get(topicId).subscribe({
      next: (topic) => {
        this.topicModel.set(topic);
        this.membersResource.reload();
        this.invitesResource.reload();
        if (topic.discussionId) {
          this.discussionService.get(topicId, topic.discussionId).subscribe({
            next: (d) => this.discussion.set({ question: d.question, deadline: d.deadline }),
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

  private createTopicEagerly() {
    this.isLoading.set(true);
    const initialPayload = {
      description: '<html><head></head><body></body></html>',
      status: 'draft',
      visibility: 'private'
    };
    this.topicService.save(initialPayload).pipe(take(1)).subscribe({
      next: (savedTopic) => {
        this.topicModel.update(current => {
          const merged = {
            ...savedTopic,
            title: current.title || savedTopic.title,
            intro: current.intro || savedTopic.intro
          };
          return merged;
        });
        this.membersResource.reload();
        this.invitesResource.reload();
        this.isLoading.set(false);
        // Update URL to include topicId without triggering navigation
        this.hasChanges.set(false);
        const url = this.router.createUrlTree([savedTopic.id], { relativeTo: this.route }).toString();
        this.location.replaceState(url);
        this.hasChanges.set(true);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  onStepChange(step: string) {
    if (this.canNavigateTo(step)) {
      this.currentStep.set(step as TopicCreateStep);
      if (step === 'preview') {
        this.loadDescription();
      }
    }
  }

  private loadDescription() {
    const id = this.topicModel().id;
    if (!id) return;

    this.topicService.readDescription(id).pipe(take(1)).subscribe({
      next: (topic) => {
        this.topicModel.update(t => ({ ...t, description: topic.description }));
      }
    });
  }

  canNavigateTo(step: string): boolean {
    if (step === 'info') return true;
    return !!this.topicModel().title;
  }

  isFooterNextDisabled(): boolean {
    if (this.isLoading()) return true;
    if (this.currentStep() === 'info' && !this.topicModel().title) return true;
    if (this.currentStep() === 'discussion' && !this.discussion().question) return true;
    return false;
  }

  handleFooterContinue() {
    switch (this.currentStep()) {
      case 'info': this.saveToSettings(); break;
      case 'settings': this.saveGroupsAndContinue(); break;
      case 'discussion': this.transitionToPreview(); break;
      case 'preview': this.publishTopic(); break;
    }
  }

  private saveGroupsAndContinue() {
    const topicId = this.topicModel().id;
    if (!topicId) return;

    this.isLoading.set(true);
    const addOps = this.addedGroups().map(g => this.groupMemberTopicService.addTopic(g.id, topicId, g.level || 'read'));
    const removeOps = this.groupsToRemove().map(g => this.groupMemberTopicService.removeTopicFromGroup(g.id, topicId));

    forkJoin([...addOps, ...removeOps, this.topicService.patch(this.topicModel())]).pipe(
      catchError(() => of(null))
    ).subscribe(() => {
      this.isLoading.set(false);
      this.groupsToRemove.set([]);
      this.onStepChange('discussion');
    });
  }

  handleFooterBack() {
    const order = this.steps.map(s => s.key);
    const idx = order.indexOf(this.currentStep());
    if (idx > 0) this.currentStep.set(order[idx - 1] as TopicCreateStep);
  }

  onTopicUpdate(updates: Partial<Topic>) {
    this.topicModel.update(t => ({ ...t, ...updates }));
    if (updates.id) {
      this.membersResource.reload();
      this.invitesResource.reload();
    }
  }

  onImageFileUpdate(file: File | null) {
    this.imageFile.set(file);
  }

  onGroupsAdded(groups: TopicMemberGroup[]) {
    this.addedGroups.set(groups);
  }

  onGroupRemoved(group: TopicMemberGroup) {
    this.addedGroups.update(gs => gs.filter(g => g.id !== group.id));
    this.groupsToRemove.update(gs => [...gs, group]);
  }

  saveToSettings() {
    const t = this.topicModel();
    if (!t.id) {
      // Topic not yet created (e.g. eager create failed) — create now
      this.createTopicEagerly();
      return;
    }

    const patchAndUpload$ = this.topicService.patch(t).pipe(
      switchMap((updated) => {
        this.topicModel.set(updated);
        if (this.imageFile()) {
          const path = `/api/users/self/topics/${updated.id}/upload`;
          return this.uploadService.upload<{ imageUrl?: string; link?: string; id?: string }>(path, this.imageFile()!).pipe(
            map((uploaded) => {
              if (uploaded) {
                const imageUrl = uploaded.imageUrl || uploaded.link;
                if (imageUrl) {
                  this.topicModel.update(current => ({ ...current, imageUrl }));
                } else if (uploaded.id) {
                  this.topicModel.set(uploaded);
                }
              }
              return uploaded;
            })
          );
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
    const t = this.topicModel();
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
      if (d) this.topicModel.update(current => ({ ...current, discussionId: d.id }));
      this.isLoading.set(false);
      this.currentStep.set('preview');
    });
  }

  private saveGroups(topicId: string): Observable<unknown> {
    const addOps = this.addedGroups().map(g => this.groupMemberTopicService.addTopic(g.id, topicId, g.level || 'read'));
    const removeOps = this.groupsToRemove().map(g => this.groupMemberTopicService.removeTopicFromGroup(g.id, topicId));
    if (addOps.length === 0 && removeOps.length === 0) {
      return of(null);
    }
    return forkJoin([...addOps, ...removeOps]).pipe(
      catchError(() => of(null))
    );
  }

  saveAsDraft() {
    const t = this.topicModel();
    if (!t.id) {
      this.notification.showRaw('info', 'VIEWS.TOPIC_CREATE.SAVE_FIRST_TO_INVITE');
      return;
    }

    this.isLoading.set(true);
    this.topicService.patch(t).pipe(
      switchMap((savedTopic) => {
        this.topicModel.set(savedTopic);
        return this.saveGroups(savedTopic.id!);
      })
    ).subscribe({
      next: () => {
        this.isLoading.set(false);
        this.groupsToRemove.set([]);
        this.notification.showRaw('success', 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE');
        this.hasChanges.set(false);
        this.router.navigate(['/', this.translate.currentLang || 'en', 'topics', this.topicModel().id]);
      },
      error: () => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_SAVE_FAILED');
      }
    });
  }

  publishTopic() {
    this.isLoading.set(true);
    const t = this.topicModel();
    const disc = this.discussion();
    const isNewOrDraft = t.status === 'draft';

    const topicSave$ = t.id
      ? this.topicService.patch({ ...t, status: 'inProgress', visibility: 'public' })
      : this.topicService.save({ ...t, status: 'inProgress', visibility: 'public' });

    topicSave$.pipe(
      switchMap((savedTopic) => {
        this.topicModel.set(savedTopic);
        const groupsSave$ = this.saveGroups(savedTopic.id!);
        const discSave$: Observable<Discussion | null> = disc.question
          ? (savedTopic.discussionId
              ? this.discussionService.update(savedTopic.id!, savedTopic.discussionId, disc)
              : this.discussionService.create(savedTopic.id!, disc))
          : of(null);

        return forkJoin({
          topic: of(savedTopic),
          groups: groupsSave$,
          discussion: discSave$.pipe(catchError(() => of(null)))
        });
      }),
      catchError(() => {
        this.isLoading.set(false);
        this.notification.showRaw('error', 'VIEWS.TOPIC_CREATE.ERROR_PUBLISH_FAILED');
        return of(null);
      })
    ).subscribe((result) => {
      if (!result) return;
      this.isLoading.set(false);
      this.groupsToRemove.set([]);

      const successMessage = isNewOrDraft
        ? 'VIEWS.TOPIC_CREATE.NOTIFICATION_SUCCESS_MESSAGE'
        : 'VIEWS.TOPIC_EDIT.NOTIFICATION_SUCCESS_MESSAGE';

      this.notification.showRaw('success', successMessage);

      this.hasChanges.set(false);
      this.router.navigate(['/', this.translate.currentLang || 'en', 'topics', this.topicModel().id]).then(() => {
        if (isNewOrDraft) {
          this.dialog.open(TopicInviteDialogComponent, {
            data: { topic: this.topicModel() }
          });
        }
      });
    });
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

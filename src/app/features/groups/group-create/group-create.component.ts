import {
  Component,
  ChangeDetectionStrategy,
  signal,
  inject,
  computed,
  HostListener,
} from '@angular/core';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { switchMap, of, forkJoin, last, map, take, Observable, finalize } from 'rxjs';
import { Group } from '../../../core/interfaces/group';
import { UserGroupService } from '../../../core/services/user-group.service';
import { GroupInviteUserService } from '../../../core/services/group-invite-user.service';
import { GroupMemberTopicService } from '../../../core/services/group-member-topic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { StepInfoComponent } from './components/step-info/step-info.component';
import { StepSettingsComponent } from './components/step-settings/step-settings.component';
import { StepTopicsComponent } from './components/step-topics/step-topics.component';
import { StepInviteComponent } from './components/step-invite/step-invite.component';
import { GroupCreateHelpComponent } from './components/group-create-help/group-create-help.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../shared/components/button/button.component';

export type GroupCreateStep = 'info' | 'settings' | 'add_topics' | 'invite';

@Component({
  selector: 'cos-group-create',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule,
    StepInfoComponent,
    StepSettingsComponent,
    StepTopicsComponent,
    StepInviteComponent,
    GroupCreateHelpComponent,
    IconComponent,
    ButtonComponent,
  ],
  templateUrl: './group-create.component.html',
  styleUrl: './group-create.component.scss',
})
export class GroupCreateComponent {
  private userGroupService = inject(UserGroupService);
  private groupInviteUserService = inject(GroupInviteUserService);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private notificationService = inject(NotificationService);
  private router = inject(Router);
  private translate = inject(TranslateService);
  wWidth = signal(window.innerWidth);

  @HostListener('window:resize')
  onResize() {
    this.wWidth.set(window.innerWidth);
  }

  currentStep = signal<GroupCreateStep>('info');
  group = signal<Partial<Group>>({
    name: '',
    description: '',
    visibility: 'private',
    members: {
      users: [],
      topics: { rows: [], count: 0 },
    },
  });

  imageFile = signal<File | null>(null);
  loading = signal(false);

  steps: GroupCreateStep[] = ['info', 'settings', 'add_topics', 'invite'];

  currentStepIndex = computed(() => this.steps.indexOf(this.currentStep()));

  setStep(step: GroupCreateStep) {
    this.currentStep.set(step);
  }

  nextStep() {
    const index = this.currentStepIndex();
    if (index < this.steps.length - 1) {
      this.currentStep.set(this.steps[index + 1]);
    } else {
      this.createGroup();
    }
  }

  previousStep() {
    const index = this.currentStepIndex();
    if (index > 0) {
      this.currentStep.set(this.steps[index - 1]);
    }
  }

  updateGroup(data: Partial<Group>) {
    this.group.update(g => ({ ...g, ...data }));
  }

  updateImageFile(file: File | null) {
    this.imageFile.set(file);
  }

  cancel() {
    this.router.navigate(['/', this.translate.currentLang, 'my', 'groups']);
  }

  createGroup() {
    const groupData = this.group();
    if (!groupData.name?.trim()) {
      this.notificationService.error('VIEWS.GROUP_CREATE.ERROR_NAME_REQUIRED');
      return;
    }

    const payload: Partial<Group> = {
      name: groupData.name,
      description: groupData.description,
      visibility: groupData.visibility,
      country: groupData.country ?? undefined,
      language: groupData.language ?? undefined,
      contact: groupData.contact ?? undefined,
      rules: groupData.rules ?? [],
    };

    const imageFile = this.imageFile();
    this.loading.set(true);

    this.userGroupService.save(payload).pipe(
      switchMap(created => {
        if (!imageFile) return of(created);
        return this.userGroupService.uploadGroupImage(imageFile, created.id).pipe(
          last(),
          map(() => created)
        );
      }),
      switchMap(created => {
        const users: any[] = groupData.members?.users ?? [];
        const topics: any[] = groupData.members?.topics?.rows ?? [];
        const obs$: Observable<any>[] = [];

        if (users.length) {
          obs$.push(this.groupInviteUserService.invite(created.id, users.map(u => ({
            userId: u.userId ?? u.id,
            level: u.level ?? 'read',
            inviteMessage: groupData.inviteMessage ?? undefined,
          }))));
        }

        for (const topic of topics) {
          obs$.push(this.groupMemberTopicService.addTopic(
            created.id, topic.id, topic.permission?.level ?? 'read'
          ));
        }

        return obs$.length ? forkJoin(obs$).pipe(map(() => created)) : of(created);
      }),
      take(1),
      finalize(() => this.loading.set(false))
    ).subscribe({
      next: created => {
        this.notificationService.success(
          'VIEWS.GROUP_CREATE.NOTIFICATION_SUCCESS_MESSAGE',
          'VIEWS.GROUP_CREATE.NOTIFICATION_SUCCESS_TITLE'
        );
        this.router.navigate(['/', this.translate.currentLang, 'groups', created.id]);
      },
      error: () => {
        this.notificationService.error('VIEWS.GROUP_CREATE.ERROR_FAILED');
      },
    });
  }
}

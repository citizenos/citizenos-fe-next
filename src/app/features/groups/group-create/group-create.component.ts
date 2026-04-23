import { Component, signal, inject, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Group } from '../../../core/interfaces/group';
import { UserGroupService } from '../../../core/services/user-group.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserStore } from '../../../core/state/user.store';
import { StepInfoComponent } from './components/step-info/step-info.component';
import { StepSettingsComponent } from './components/step-settings/step-settings.component';
import { StepTopicsComponent } from './components/step-topics/step-topics.component';
import { StepInviteComponent } from './components/step-invite/step-invite.component';
import { GroupCreateHelpComponent } from './components/group-create-help/group-create-help.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

export type GroupCreateStep = 'info' | 'settings' | 'add_topics' | 'invite';

@Component({
  selector: 'cos-group-create',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    StepInfoComponent,
    StepSettingsComponent,
    StepTopicsComponent,
    StepInviteComponent,
    GroupCreateHelpComponent,
    IconComponent
  ],
  templateUrl: './group-create.component.html',
  styleUrl: './group-create.component.scss'
})
export class GroupCreateComponent {
  private userGroupService = inject(UserGroupService);
  private notificationService = inject(NotificationService);
  private userStore = inject(UserStore);
  private router = inject(Router);
  private translate = inject(TranslateService);

  currentStep = signal<GroupCreateStep>('info');
  group = signal<Partial<Group>>({
    name: '',
    description: '',
    visibility: 'private',
    members: {
      users: [],
      topics: { rows: [], count: 0 }
    }
  });

  imageFile = signal<File | null>(null);

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
    this.router.navigate(['/groups']);
  }

  async createGroup() {
    try {
      const groupData = this.group();
      if (!groupData.name) {
        this.notificationService.error('VIEWS.GROUP_CREATE.ERROR_NAME_REQUIRED');
        return;
      }

      const createdGroup = await this.userGroupService.save(groupData).toPromise();
      
      if (createdGroup && this.imageFile()) {
        await this.userGroupService.uploadGroupImage(this.imageFile()!, createdGroup.id).toPromise();
      }

      this.notificationService.success('VIEWS.GROUP_CREATE.SUCCESS_CREATED');
      if (createdGroup) {
        this.router.navigate(['/groups', createdGroup.id]);
      }
    } catch (error) {
      console.error('Error creating group:', error);
      this.notificationService.error('VIEWS.GROUP_CREATE.ERROR_FAILED');
    }
  }
}

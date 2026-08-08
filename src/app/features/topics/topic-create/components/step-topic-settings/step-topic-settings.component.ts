import { Component, input, output, ChangeDetectionStrategy, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicSettingsPanelComponent, TopicMemberGroup } from '../../../../../shared/components/topic-settings-panel/topic-settings-panel.component';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';
import { UserGroupService } from '../../../../../core/services/user-group.service';

@Component({
  selector: 'cos-step-topic-settings',
  standalone: true,
  imports: [TranslateModule, TopicSettingsPanelComponent, AnyPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <cos-topic-settings-panel
        [topic]="topic() | any"
        [groups]="groups() | any"
        [isCreatedFromGroup]="isCreatedFromGroup()"
        (visibilityChange)="onUpdate({visibility: $event})"
        (categoriesChange)="onUpdate({categories: $event})"
        (countryChange)="onUpdate({country: $event})"
        (languageChange)="onUpdate({language: $event})"
        (groupsAdded)="groupsAdded.emit($event)"
        (groupRemoved)="groupRemoved.emit($event)"
      ></cos-topic-settings-panel>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }
  `]
})
export class StepTopicSettingsComponent {
  private userGroupService = inject(UserGroupService);

  topic = input<Partial<Topic>>({
    visibility: 'private',
    categories: [],
    country: null,
    language: null
  });
  isCreatedFromGroup = input<boolean>(false);
  topicUpdate = output<Partial<Topic>>();
  groupsAdded = output<TopicMemberGroup[]>();
  groupRemoved = output<TopicMemberGroup>();

  groups = this.userGroupService.items;

  onUpdate(updates: Partial<Topic>) {
    this.topicUpdate.emit(updates);
  }
}

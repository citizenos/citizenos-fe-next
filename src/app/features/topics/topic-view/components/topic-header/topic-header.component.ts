import { Component, input, output, inject, ChangeDetectionStrategy, computed, signal } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { Topic } from '../../../../../core/interfaces/topic';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { ActivitiesButtonComponent } from '../../../../../shared/components/activities-button/activities-button.component';


@Component({
  selector: 'app-topic-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, RouterModule, TranslateModule, IconComponent, CosDropdownDirective, ButtonComponent, TooltipComponent, ActivitiesButtonComponent],
  templateUrl: './topic-header.component.html',
  styleUrls: ['./topic-header.component.scss']
})
export class TopicHeaderComponent {
  topic = input.required<Topic>();
  navigation = input.required<{title: string, link: string[]}>();
  appTopicNotificationSettings = input<() => void>();

  joinTopic = output<Topic>();
  toggleFavourite = output<Topic>();
  leaveTopic = output<Topic>();
  inviteEditors = output<Topic>();
  duplicateTopic = output<Topic>();
  addGroupsDialog = output<Topic>();
  reportTopic = output<Topic>();
  reportReasonDialog = output<Topic>();
  moderateTopic = output<Topic>();
  reviewTopic = output<Topic>();
  resolveTopic = output<Topic>();
  closeTopic = output<Topic>();
  deleteTopic = output<Topic>();
  openSettings = output<Topic>();

  userStore = inject(UserStore);
  topicService = inject(TopicService);
  translate = inject(TranslateService);

  mobileActions = signal(false);

  lang = computed(() => this.translate.currentLang || 'en');
  isLoggedIn = computed(() => this.userStore.isAuthenticated());

  onJoin() {
    this.joinTopic.emit(this.topic());
  }

  onToggleFavourite() {
    this.toggleFavourite.emit(this.topic());
  }

  onReportTopic() {
    this.reportTopic.emit(this.topic());
  }
}

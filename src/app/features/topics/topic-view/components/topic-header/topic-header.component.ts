import { Component, input, output, inject, ChangeDetectionStrategy, computed } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Topic } from '../../../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-header',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [UpperCasePipe, RouterModule, TranslateModule, IconComponent],
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
  reportReasonDialog = output<Topic>();
  closeTopic = output<Topic>();
  deleteTopic = output<Topic>();

  userStore = inject(UserStore);
  topicService = inject(TopicService);
  translate = inject(TranslateService);

  mobileActions = false;

  isLoggedIn = computed(() => this.userStore.isAuthenticated());

  onJoin() {
    this.joinTopic.emit(this.topic());
  }

  onToggleFavourite() {
    this.toggleFavourite.emit(this.topic());
  }
}

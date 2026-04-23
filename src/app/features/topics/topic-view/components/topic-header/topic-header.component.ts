import { Component, input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';

import { Topic } from '../../../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-header',
  standalone: true,
  imports: [CommonModule, RouterModule, TranslateModule],
  templateUrl: './topic-header.component.html',
  styleUrls: ['./topic-header.component.scss']
})
export class TopicHeaderComponent {
  topic = input.required<Topic>();
  navigation = input.required<{title: string, link: string[]}>();
  appTopicNotificationSettings = input<() => void>();
  
  @Output() joinTopic = new EventEmitter<Topic>();
  @Output() toggleFavourite = new EventEmitter<Topic>();
  @Output() leaveTopic = new EventEmitter<Topic>();
  @Output() inviteEditors = new EventEmitter<Topic>();
  @Output() duplicateTopic = new EventEmitter<Topic>();
  @Output() addGroupsDialog = new EventEmitter<Topic>();
  @Output() reportReasonDialog = new EventEmitter<Topic>();
  @Output() closeTopic = new EventEmitter<Topic>();
  @Output() deleteTopic = new EventEmitter<Topic>();

  userStore = inject(UserStore);
  topicService = inject(TopicService);
  translate = inject(TranslateService);
  
  mobileActions = false;

  get isLoggedIn() {
    return this.userStore.isAuthenticated();
  }

  onJoin() {
    this.joinTopic.emit(this.topic());
  }

  onToggleFavourite() {
    this.toggleFavourite.emit(this.topic());
  }
}

import { Component, input, Output, EventEmitter, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { Topic } from '../../../../../core/interfaces/topic';
import { trigger, state, style, transition, animate } from '@angular/animations';

@Component({
  selector: 'app-topic-info-sidebar',
  standalone: true,
  imports: [CommonModule, TranslateModule, RouterModule],
  templateUrl: './topic-info-sidebar.component.html',
  styleUrls: ['./topic-info-sidebar.component.scss'],
  animations: [
    trigger('openClose', [
      state('open', style({
        height: '*',
        opacity: 1,
        visibility: 'visible',
      })),
      state('closed', style({
        height: '0',
        opacity: 0,
        visibility: 'hidden',
        overflow: 'hidden'
      })),
      transition('open <=> closed', [
        animate('0.2s ease-in-out')
      ])
    ])
  ]
})
export class TopicInfoSidebarComponent {
  topic = input.required<Topic>();
  attachments = input<any[]>([]);
  groups = input<any[]>([]);
  
  appTopicNotificationSettings = input<() => void>();
  
  @Output() toggleFavourite = new EventEmitter<Topic>();
  @Output() leaveTopic = new EventEmitter<Topic>();
  @Output() inviteEditors = new EventEmitter<Topic>();
  @Output() duplicateTopic = new EventEmitter<Topic>();
  @Output() addGroupsDialog = new EventEmitter<Topic>();
  @Output() closeTopic = new EventEmitter<Topic>();
  @Output() deleteTopic = new EventEmitter<Topic>();
  @Output() downloadAttachment = new EventEmitter<any>();

  topicService = inject(TopicService);
  userStore = inject(UserStore);

  showAttachments = false;
  showGroups = false;
  showCategories = false;
  
  get isLoggedIn() {
    return this.userStore.isAuthenticated();
  }

  onDownloadAttachment(event: Event, attachment: any) {
    event.preventDefault();
    this.downloadAttachment.emit(attachment);
  }
}

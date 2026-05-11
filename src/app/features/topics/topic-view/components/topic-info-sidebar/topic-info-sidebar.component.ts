import { Component, output, inject, ChangeDetectionStrategy, computed, model } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { TopicService } from '../../../../../core/services/topic.service';
import { Topic, TopicAttachment, TopicGroup } from '../../../../../core/interfaces/topic';
import { UserStore } from '../../../../../core/state/user.store';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { trigger, state, style, transition, animate } from '@angular/animations';
import { DatePipe } from '@angular/common';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

@Component({
  selector: 'app-topic-info-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, RouterModule, IconComponent, DatePipe, CosDropdownDirective],
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
  topic = model.required<Topic>();
  attachments = model<TopicAttachment[]>([]);
  groups = model<TopicGroup[]>([]);
  appTopicNotificationSettings = model<() => void>();

  toggleFavourite = output<Topic>();
  leaveTopic = output<Topic>();
  inviteEditors = output<Topic>();
  duplicateTopic = output<Topic>();
  addGroupsDialog = output<Topic>();
  closeTopic = output<Topic>();
  deleteTopic = output<Topic>();
  downloadAttachment = output<TopicAttachment>();

  topicService = inject(TopicService);
  userStore = inject(UserStore);
  private translate = inject(TranslateService);

  showAttachments = false;
  showGroups = false;
  manageOpen = false;
  lang = computed(() => this.translate.currentLang || 'en');

  get isLoggedIn() {
    return this.userStore.isAuthenticated();
  }

  onDownloadAttachment(event: Event, attachment: TopicAttachment) {
    event.preventDefault();
    this.downloadAttachment.emit(attachment);
  }
}

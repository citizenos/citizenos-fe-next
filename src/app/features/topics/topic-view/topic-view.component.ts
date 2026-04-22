import { Component, OnInit, OnDestroy, inject, signal, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { switchMap, combineLatest, map, BehaviorSubject } from 'rxjs';

import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicEventService } from '../../../core/services/topic-event.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { UserStore } from '../../../core/state/user.store';

import { TopicHeaderComponent } from './components/topic-header/topic-header.component';
import { TopicContentComponent } from './components/topic-content/topic-content.component';
import { TopicInfoSidebarComponent } from './components/topic-info-sidebar/topic-info-sidebar.component';
import { TopicStateItemsComponent } from './components/topic-state-items/topic-state-items.component';

import { Topic } from '../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    TranslateModule,
    TopicHeaderComponent,
    TopicContentComponent,
    TopicInfoSidebarComponent,
    TopicStateItemsComponent
  ],
  templateUrl: './topic-view.component.html',
  styleUrls: ['./topic-view.component.scss']
})
export class TopicViewComponent implements OnInit, OnDestroy {
  route = inject(ActivatedRoute);
  router = inject(Router);
  
  topicService = inject(TopicService);
  topicIdeationService = inject(TopicIdeationService);
  topicEventService = inject(TopicEventService);
  topicVoteService = inject(TopicVoteService);
  userStore = inject(UserStore);

  topic = signal<Topic | null>(null);
  ideation = signal<any>(null);
  vote = signal<any>(null);
  eventsCount = signal<number>(0);
  attachments = signal<any[]>([]);
  groups = signal<any[]>([]);

  topicId = '';
  
  tabSelected = signal<string | null>(null);
  tabTablet = signal<string>('');
  
  wWidth = window.innerWidth;
  
  navigation = signal({
    title: 'VIEWS.TOPIC.TITLE',
    link: ['/']
  });

  @HostListener('window:resize')
  onResize() {
    this.wWidth = window.innerWidth;
  }

  constructor() {
    combineLatest([this.route.params, this.route.queryParams])
      .pipe(takeUntilDestroyed())
      .subscribe(([params, queryParams]) => {
        if (params['topicId']) {
          this.topicId = params['topicId'];
          this.topicService.loadTopic(this.topicId).subscribe((topic: any) => {
            this.topic.set(topic);
            this.loadRelatedData(topic);
          });
        }
      });
  }

  ngOnInit() {
    this.topicService.reloadTopic();
  }

  ngOnDestroy() {
    // Cleanup if necessary
  }

  loadRelatedData(topic: Topic) {
    if (topic.ideationId) {
      this.topicIdeationService.get({ topicId: topic.id, ideationId: topic.ideationId })
        .subscribe((ideation: any) => this.ideation.set(ideation));
    }
    
    if (topic.voteId) {
      this.topicVoteService.get({ topicId: topic.id, voteId: topic.voteId })
        .subscribe((vote: any) => this.vote.set(vote));
    }

    if (topic.status === this.topicService.STATUSES.followUp) {
      this.topicEventService.query({ topicId: topic.id })
        .subscribe({
          next: (res: any) => {
            this.eventsCount.set(res.count || 0);
          },
          error: (err: any) => console.log(err)
        });
    }
  }

  selectTab(tab: string) {
    this.tabSelected.set(tab);
    if (this.wWidth <= 1024) {
      this.tabTablet.set(tab);
    }
  }

  startDiscussion(topic: Topic) {
    if (this.topicService.canUpdate(topic)) {
      this.topicService.changeState(topic, 'inProgress', 'VIEWS.TOPICS_TOPICID.MSG_DISCUSSION_STARTED');
    }
  }

  startVote(topic: Topic) {
    if (this.topicService.canUpdate(topic)) {
      this.router.navigate(['/topics', topic.id, 'votes', 'create']);
    }
  }

  sendToFollowUp(topic: Topic) {
    if (this.topicService.canUpdate(topic)) {
      this.topicService.changeState(topic, 'followUp');
    }
  }

  appTopicNotificationSettings() {
    console.log('Open Notification Settings Dialog'); // Replace with actual dialog
  }

  toggleFavourite(topic: Topic) {
    this.topicService.toggleFavourite(topic);
  }

  leaveTopic(topic: Topic) {
    // Replicate dialog logic
  }

  inviteEditors(topic: Topic) {
    // Replicate dialog logic
  }
  
  duplicateTopic(topic: Topic) {
    // Replicate duplicate logic
  }
  
  addGroupsDialog(topic: Topic) {
    // Replicate dialog logic
  }
  
  reportReasonDialog(topic: Topic) {
    // Replicate dialog logic
  }
  
  closeTopic(topic: Topic) {
    this.topicService.changeState(topic, 'closed');
  }

  deleteTopic(topic: Topic) {
    this.topicService.doDeleteTopic(topic, ['/']);
  }
  
  downloadAttachment(attachment: any) {
    // Add logic
  }
}

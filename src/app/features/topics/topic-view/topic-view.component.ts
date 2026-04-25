import { Component, OnInit, OnDestroy, inject, signal, HostListener, ChangeDetectionStrategy, PLATFORM_ID, computed, DestroyRef } from '@angular/core';
import { NgClass, isPlatformBrowser, DatePipe } from '@angular/common';
import { RouterModule, ActivatedRoute, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { takeUntilDestroyed, toSignal, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, combineLatest, map, of, tap, catchError, startWith, filter } from 'rxjs';

import { TopicService } from '../../../core/services/topic.service';
import { TopicIdeationService } from '../../../core/services/topic-ideation.service';
import { TopicEventService } from '../../../core/services/topic-event.service';
import { TopicVoteService } from '../../../core/services/topic-vote.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { IconComponent } from '../../../shared/components/icon/icon.component';

import { TopicHeaderComponent } from './components/topic-header/topic-header.component';
import { TopicContentComponent } from './components/topic-content/topic-content.component';
import { TopicInfoSidebarComponent } from './components/topic-info-sidebar/topic-info-sidebar.component';
import { TopicStateItemsComponent } from './components/topic-state-items/topic-state-items.component';
import { TopicIdeationComponent } from './components/topic-ideation/topic-ideation.component';
import { TopicDiscussionComponent } from './components/topic-discussion/topic-discussion.component';

import { Topic } from '../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-view',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass,
    RouterModule,
    TranslateModule,
    TopicHeaderComponent,
    TopicContentComponent,
    TopicInfoSidebarComponent,
    TopicStateItemsComponent,
    TopicIdeationComponent,
    TopicDiscussionComponent,
    IconComponent
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
  translate = inject(TranslateService);
  private dialogService = inject(DialogService);
  private platformId = inject(PLATFORM_ID);
  private destroyRef = inject(DestroyRef);
  get STATUSES() { return this.topicService.STATUSES; }

  topic = signal<Topic | null>(null);
  loading = signal(true);
  ideation = signal<any>(null);
  vote = signal<any>(null);
  eventsCount = signal<number>(0);
  attachments = signal<any[]>([]);
  groups = signal<any[]>([]);

  topicId = '';
  
  tabSelected = signal<string | null>(null);
  tabTablet = signal<string>('');
  
  wWidth = isPlatformBrowser(this.platformId) ? window.innerWidth : 1280;

  navigation = signal<{title: string, link: any[]}>({
    title: 'DEFAULT.NAV.HEADING_TOPICS',
    link: ['/']
  });

  @HostListener('window:resize')
  onResize() {
    if (isPlatformBrowser(this.platformId)) {
      this.wWidth = window.innerWidth;
    }
  }

  private topicResource = toSignal(
    combineLatest([
      this.route.params,
      this.route.queryParams,
      this.translate.onLangChange.pipe(startWith(null))
    ]).pipe(
      switchMap(([params, queryParams]) => {
        const topicId = params['topicId'];
        if (topicId) {
          this.topicId = topicId;
          this.loading.set(true);
          this.navigation.set({
            title: 'DEFAULT.NAV.HEADING_TOPICS',
            link: ['/', this.translate.currentLang, 'my', 'topics']
          });
          return this.topicService.loadTopic(topicId).pipe(
            tap((topic: any) => {
              this.topic.set(topic);
              this.loadRelatedData(topic);
              this.loading.set(false);
              
              const fragment = this.route.snapshot.fragment;
              if (fragment) {
                this.selectTab(fragment);
              } else if (!this.tabSelected()) {
                if (topic.ideationId) {
                  this.selectTab('ideation');
                } else {
                  this.selectTab('discussion');
                }
              }
            }),
            catchError((err) => {
              console.error('Error loading topic:', err);
              this.loading.set(false);
              return of(null);
            })
          );
        }
        this.loading.set(false);
        return of(null);
      })
    )
  );

  ngOnInit() {
    this.topicService.reloadTopic();
  }

  ngOnDestroy() {
    // Cleanup if necessary
  }

  loadRelatedData(topic: Topic) {
    if (topic.ideationId) {
      this.topicIdeationService.get({ topicId: topic.id, ideationId: topic.ideationId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((ideation: any) => this.ideation.set(ideation));
    }
    
    if (topic.voteId) {
      this.topicVoteService.get({ topicId: topic.id, voteId: topic.voteId })
        .pipe(takeUntilDestroyed(this.destroyRef))
        .subscribe((vote: any) => this.vote.set(vote));
    }

    if (topic.status === this.topicService.STATUSES.followUp) {
      this.topicEventService.query({ topicId: topic.id })
        .pipe(takeUntilDestroyed(this.destroyRef))
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
    if (!this.topicService.canUpdate(topic)) return;
    import('../vote-create/vote-create-dialog.component').then(m => {
      this.dialogService.open(m.VoteCreateDialogComponent, { data: { topic } })
        .afterClosed()
        .subscribe((created: any) => {
          if (created) this.topicService.reloadTopic();
        });
    });
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
    this.topicService.doDeleteTopic(topic, ['/', this.translate.currentLang, 'my', 'topics']);
  }
  
  downloadAttachment(attachment: any) {
    // Add logic
  }
}

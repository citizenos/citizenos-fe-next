import {
  Component, input, signal, inject, ChangeDetectionStrategy, OnInit, computed
} from '@angular/core';
import { NgClass, DatePipe, UpperCasePipe, AsyncPipe, KeyValuePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap, of, take, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog';
import { EditDiscussionDeadlineComponent } from '../edit-discussion-deadline/edit-discussion-deadline.component';
import { MissingDiscussionComponent } from '../missing-discussion/missing-discussion.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ArgumentComponent } from '../argument/argument.component';
import { PostArgumentFormComponent } from '../post-argument-form/post-argument-form.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { InputComponent } from '../../../../../shared/components/input/input.component';

@Component({
  selector: 'cos-topic-discussion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    NgClass, DatePipe, UpperCasePipe, TranslateModule, AsyncPipe, KeyValuePipe,
    ArgumentComponent, PostArgumentFormComponent,
    ButtonComponent, IconComponent, PaginationComponent,
    CosDropdownDirective, InputComponent, DropdownComponent,
    RouterLink
  ],
  templateUrl: './topic-discussion.component.html',
  styleUrls: ['./topic-discussion.component.scss']
})
export class TopicDiscussionComponent implements OnInit {
  topic = input.required<Topic>();

  private topicService = inject(TopicService);
  private discussionService = inject(TopicDiscussionService);
  private argumentService = inject(TopicArgumentService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);
  private notification = inject(NotificationService);

  showPostForm = signal(false);

  argumentTypes = [
    { value: 'pro', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_ARGUMENT_TYPE_PRO' },
    { value: 'con', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_ARGUMENT_TYPE_CON' },
    { value: 'poi', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_ARGUMENT_TYPE_POI' }
  ];

  orderByOptions = [
    { value: 'relevance', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_SORT_BY_RELEVANCE' },
    { value: 'popularity', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_SORT_BY_POPULARITY' },
    { value: 'date', title: 'COMPONENTS.TOPIC_ARGUMENTS.LBL_SORT_BY_DATE' }
  ];

  selectedTypes = signal<string[]>(['pro', 'con', 'poi']);
  selectedOrder = signal<string>('relevance');

  discussion = toSignal(
    toObservable(this.topic).pipe(
      switchMap(topic => {
        if (topic.discussionId) {
          return this.discussionService.get(topic.id, topic.discussionId).pipe(
            tap(disc => {
              this.argumentService.setParam('topicId', topic.id);
              this.argumentService.setParam('discussionId', disc.id);
              this.argumentService.setParam('limit', 5);
              this.argumentService.loadPage(1);

              if (!disc.question && disc.createdAt === disc.updatedAt && this.canUpdate()) {
                this.dialog.open(MissingDiscussionComponent, {
                  data: { topic: topic }
                });
              }
            })
          );
        }
        return of(null);
      })
    )
  );

  arguments = toSignal(this.argumentService.items$, { initialValue: [] as any[] });
  loading = toSignal(this.argumentService.isLoading$, { initialValue: false });

  counts = computed(() => {
    const args = this.arguments();
    return {
      total: args.length,
      pro: args.filter((a: any) => a.type === 'pro').length,
      con: args.filter((a: any) => a.type === 'con').length,
      poi: args.filter((a: any) => a.type === 'poi').length,
      reply: args.reduce((acc: number, a: any) => acc + (a.replies?.count || 0), 0)
    };
  });

  flattenedArguments = computed(() => {
    return this.arguments();
  });

  ngOnInit(): void {
    // Initial load handled by toSignal/switchMap
  }

  canPost() {
    return this.userStore.isAuthenticated();
  }

  canUpdate() {
    return this.topicService.canUpdate(this.topic());
  }

  canEditDeadline() {
    return this.canUpdate() && [this.topicService.STATUSES.draft, this.topicService.STATUSES.ideation, this.topicService.STATUSES.inProgress].indexOf(this.topic().status) > -1;
  }

  hasDiscussionEndedExpired() {
    const disc = this.discussion();
    if (!disc) return false;
    return this.discussionService.hasDiscussionEndedExpired(this.topic(), disc);
  }

  getArgumentPercentage(count: number): number {
    const total = this.counts().total;
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  toggleTypeFilter(type: string) {
    const current = this.selectedTypes();
    if (current.includes(type)) {
      this.selectedTypes.set(current.filter(t => t !== type));
    } else {
      this.selectedTypes.set([...current, type]);
    }
    const selected = this.selectedTypes();
    this.argumentService.setParam('types', selected.length ? selected : null);
    this.argumentService.loadPage(1);
  }

  setOrder(order: string) {
    this.selectedOrder.set(order);
    this.argumentService.setParam('sortOrder', order);
    this.argumentService.loadPage(1);
  }

  onArgumentPosted() {
    this.showPostForm.set(false);
    this.reload();
  }

  reload() {
    this.argumentService.loadPage((this.argumentService as any).page.value);
  }

  openEditDeadline() {
    this.dialog.open(EditDiscussionDeadlineComponent, {
      data: {
        topic: this.topic(),
        discussion: this.discussion()
      }
    });
  }

  closeDiscussion() {
    const disc = this.discussion();
    if (!disc) return;

    this.dialog.open(ConfirmDialogComponent, {
      data: {
        heading: 'COMPONENTS.CLOSE_DISCUSSION_CONFIRM.HEADING',
        description: 'COMPONENTS.CLOSE_DISCUSSION_CONFIRM.ARE_YOU_SURE',
        confirmBtn: 'COMPONENTS.CLOSE_DISCUSSION_CONFIRM.CONFIRM_YES',
        closeBtn: 'COMPONENTS.CLOSE_DISCUSSION_CONFIRM.CONFIRM_NO',
        level: 'warn'
      }
    }).afterClosed().subscribe(confirmed => {
      if (confirmed) {
        disc.deadline = new Date().toISOString();
        this.saveDiscussion(disc);
      }
    });
  }

  saveDiscussion(discussion: any) {
    const payload = {
      deadline: discussion.deadline
    };
    this.discussionService.update(this.topic().id, discussion.id, payload)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.topicService.reloadTopic();
          this.dialog.closeAll();
        },
        error: (res) => {
          if (res.errors) {
            Object.values(res.errors).forEach((message) => {
              if (typeof message === 'string')
                this.notification.showRaw('error', message);
            });
          } else if (res.message) {
            this.notification.showRaw('error', res.message);
          }
        }
      });
  }
}

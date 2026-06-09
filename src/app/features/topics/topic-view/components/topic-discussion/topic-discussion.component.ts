import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import {
  Component, input, signal, inject, ChangeDetectionStrategy, computed
} from '@angular/core';
import { DatePipe, UpperCasePipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { switchMap, of, take, tap } from 'rxjs';
import { RouterLink } from '@angular/router';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { Argument, ArgumentCount } from '../../../../../core/interfaces/discussion';
import { Discussion } from '../../../../../core/interfaces/discussion';
import { NotificationService } from '../../../../../core/services/notification.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog';
import { EditDiscussionDeadlineComponent } from '../edit-discussion-deadline/edit-discussion-deadline.component';
import { MissingDiscussionComponent } from '../missing-discussion/missing-discussion.component';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { ArgumentComponent } from '../argument/argument.component';
import { TopicDiscussionCreateDialogComponent } from '../topic-discussion-create-dialog/topic-discussion-create-dialog.component';
import { PostArgumentFormComponent } from '../post-argument-form/post-argument-form.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

@Component({
  selector: 'cos-topic-discussion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, UpperCasePipe, TranslateModule,
    ArgumentComponent, PostArgumentFormComponent,
    PaginationComponent,
    DropdownComponent, RouterLink, IconComponent],
  templateUrl: './topic-discussion.component.html',
  styleUrls: ['./topic-discussion.component.scss']
})
export class TopicDiscussionComponent {
  topic = input.required<Topic>();

  public topicService = inject(TopicService);
  private discussionService = inject(TopicDiscussionService);
  private argumentService = inject(TopicArgumentService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);
  private notification = inject(NotificationService);
  translate = inject(TranslateService);

  showPostForm = signal(false);

  argumentTypes = [
    { value: 'pro', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_PRO' },
    { value: 'con', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_CON' },
    { value: 'poi', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_POI' }
  ];
  
  orderByOptions = [
    { value: 'popularity', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_POPULARITY' },
    { value: 'date', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_DATE' }
  ];

  selectedTypes = signal<string[]>(['pro', 'con', 'poi']);
  selectedOrder = signal<string>('popularity');

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

  arguments = this.argumentService.items;
  loading = this.argumentService.isLoading;
  page = this.argumentService.page;
  totalPages = this.argumentService.totalPages;

  private argumentCount = toSignal(this.argumentService.count, { initialValue: { total: 0, pro: 0, con: 0, poi: 0, reply: 0 } as ArgumentCount });

  counts = computed(() => {
    return this.argumentCount() as ArgumentCount;
  });

  flattenedArguments = computed(() => {
    return this.arguments();
  });



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

  getActiveTypeFilterText() {
    if (this.selectedTypes().length === 3 || this.selectedTypes().length === 0) return 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ALL';
    return this.selectedTypes().map(t => this.argumentTypes.find(at => at.value === t)?.title).join(', ');
  }

  getActiveOrderFilterText() {
    return this.orderByOptions.find(o => o.value === this.selectedOrder())?.title || '';
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

  loadPage(page: number) {
    this.argumentService.loadPage(page);
  }

  reload() {
    this.argumentService.reload();
  }

  openEditDeadline() {
    this.dialog.open(EditDiscussionDeadlineComponent, {
      data: {
        topic: this.topic(),
        discussion: this.discussion()
      }
    });
  }

  openCreateDiscussion() {
    this.dialog.open(TopicDiscussionCreateDialogComponent, {
      data: { topic: this.topic() }
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

  saveDiscussion(discussion: Discussion) {
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
        error: (res: { error?: { errors?: Record<string, string>; message?: string } }) => {
          const error = res.error;
          if (error?.errors) {
            Object.values(error.errors).forEach((message) => {
              if (typeof message === 'string')
                this.notification.showRaw('error', message);
            });
          } else if (error?.message) {
            this.notification.showRaw('error', error.message);
          }
        }
      });
  }
}

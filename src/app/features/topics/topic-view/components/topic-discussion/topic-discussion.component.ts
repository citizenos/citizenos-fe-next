import {
  Component, input, signal, inject, ChangeDetectionStrategy, OnInit, computed
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap, of, take, tap } from 'rxjs';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { AsyncPipe, KeyValuePipe } from '@angular/common';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicDiscussionService } from '../../../../../core/services/topic-discussion.service';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog';
import { EditDiscussionDeadlineComponent } from '../edit-discussion-deadline/edit-discussion-deadline.component';
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
    DatePipe, TranslateModule, AsyncPipe, KeyValuePipe,
    ArgumentComponent, PostArgumentFormComponent,
    ButtonComponent, IconComponent, PaginationComponent,
    CosDropdownDirective, InputComponent, DropdownComponent
  ],
  templateUrl: './topic-discussion.component.html',
  styleUrls: ['./topic-discussion.component.scss']
})
export class TopicDiscussionComponent implements OnInit {
  topic = input.required<Topic>();

  private topicService = inject(TopicService);
  private discussionService = inject(TopicDiscussionService);
  private argumentService = inject(TopicArgumentService);
  private dialog = inject(DialogService);
  userStore = inject(UserStore);

  showPostForm = signal(false);
  
  argumentTypes = [
    { value: 'pro', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_PRO' },
    { value: 'con', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_CON' },
    { value: 'poi', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_POI' }
  ];
  orderByOptions = [
    { value: 'default', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_DEFAULT' },
    { value: 'rating', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_RATING' },
    { value: 'newest', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_NEWEST' },
    { value: 'oldest', title: 'COMPONENTS.TOPIC_ARGUMENTS.FILTER_ARGUMENT_ORDER_BY_OLDEST' }
  ];

  selectedTypes = signal<string[]>([]);
  selectedOrder = signal<string>('default');

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
            })
          );
        }
        return of(null);
      })
    )
  );

  arguments = toSignal(this.argumentService.items$, { initialValue: [] });
  loading = toSignal(this.argumentService.isLoading$, { initialValue: false });
  counts = toSignal(this.argumentService.count, { initialValue: { total: 0, pro: 0, con: 0, poi: 0, reply: 0 } });
  
  // Keep these as observables to pipe to PaginationComponent
  totalPages$ = this.argumentService.totalPages;
  page$ = this.argumentService.page;

  flattenedArguments = computed(() => this.flattenArguments(this.arguments() as any[]));

  ngOnInit() {
  }


  private flattenArguments(rows: any[]): any[] {
    const result: any[] = [];
    rows.forEach(row => {
      result.push(row);
      if (row.replies?.rows?.length) {
        row.replies.count = row.replies.rows.length;
        row.replies.rows.forEach((reply: any) => {
          if (reply.children?.length) {
            row.replies.count += reply.children.length;
          }
        });
      }
    });
    return result;
  }

  canUpdate() {
    return this.topicService.canUpdate(this.topic());
  }

  canPost() {
    return this.userStore.isAuthenticated() && this.discussion();
  }

  getArgumentPercentage(count: number) {
    const total = this.counts().pro + this.counts().con;
    if (total === 0) return 0;
    return (count / total) * 100;
  }

  toggleTypeFilter(type: string) {
    const current = this.selectedTypes();
    const next = current.includes(type) ? current.filter(t => t !== type) : [...current, type];
    this.selectedTypes.set(next);
    this.argumentService.setParam('types', next.length ? next : null);
    this.argumentService.loadPage(1);
  }

  setOrder(order: string) {
    this.selectedOrder.set(order);
    this.argumentService.setParam('orderBy', order === 'default' ? null : order);
    this.argumentService.loadPage(1);
  }

  loadPage(page: number) {
    this.argumentService.loadPage(page);
  }

  reload() {
    this.argumentService.loadPage(this.argumentService.page.value);
  }

  onArgumentPosted() {
    this.showPostForm.set(false);
    this.reload();
  }

  openEditDeadline() {
    const disc = this.discussion();
    if (!disc) return;
    this.dialog.open(EditDiscussionDeadlineComponent, {
      data: { discussion: disc, topic: this.topic() }
    });
  }
}

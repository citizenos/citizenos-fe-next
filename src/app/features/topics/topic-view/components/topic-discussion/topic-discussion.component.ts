import {
  Component, input, signal, inject, ChangeDetectionStrategy, OnInit, computed
} from '@angular/core';
import { DatePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { switchMap, of, take, tap } from 'rxjs';
import { toSignal, toObservable, takeUntilDestroyed } from '@angular/core/rxjs-interop';

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

@Component({
  selector: 'cos-topic-discussion',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, TranslateModule,
    ArgumentComponent, PostArgumentFormComponent,
    ButtonComponent, IconComponent,
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
  activeFilter = signal<string | null>(null);

  discussion = toSignal(
    toObservable(this.topic).pipe(
      switchMap(topic => {
        if (topic.discussionId) {
          return this.discussionService.get(topic.id, topic.discussionId).pipe(
            tap(disc => {
              this.argumentService.setParam('topicId', topic.id);
              this.argumentService.setParam('discussionId', disc.id);
              this.argumentService.setParam('limit', 20);
              this.argumentService.loadItems().subscribe(); // ItemsListService needs a trigger
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

  setFilter(type: string | null) {
    this.activeFilter.set(type);
    this.argumentService.setParam('types', type ? [type] : null);
    this.argumentService.loadItems().subscribe();
  }

  reload() {
    this.argumentService.loadItems().subscribe();
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

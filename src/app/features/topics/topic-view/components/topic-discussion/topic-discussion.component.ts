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
  template: `
    @if (discussion()) {
      <div class="discussion-wrap">
        <div class="discussion-header">
          <div class="discussion-question">
            {{ discussion()?.question || ('COMPONENTS.TOPIC_ARGUMENTS.QUESTION_DISCUSSION' | translate) }}
          </div>

          @if (canUpdate() && discussion()?.deadline) {
            <div class="discussion-deadline">
              <span class="deadline-label" translate="COMPONENTS.TOPIC_ARGUMENTS.LBL_DEADLINE"></span>
              <span class="deadline-value">{{ discussion()?.deadline | date:'y-MM-dd HH:mm' }}</span>
            </div>
          }
        </div>

        <div class="arguments-toolbar">
          <div class="argument-counts">
            @if (counts().pro > 0) {
              <button
                class="count-chip count-chip--pro"
                [class.active]="activeFilter() === 'pro'"
                (click)="setFilter('pro')"
              >
                <span class="count-label" translate="COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_PRO"></span>
                <span class="count-val">{{ counts().pro }}</span>
              </button>
            }
            @if (counts().con > 0) {
              <button
                class="count-chip count-chip--con"
                [class.active]="activeFilter() === 'con'"
                (click)="setFilter('con')"
              >
                <span class="count-label" translate="COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_CON"></span>
                <span class="count-val">{{ counts().con }}</span>
              </button>
            }
            @if (counts().poi > 0) {
              <button
                class="count-chip count-chip--poi"
                [class.active]="activeFilter() === 'poi'"
                (click)="setFilter('poi')"
              >
                <span class="count-label" translate="COMPONENTS.TOPIC_ARGUMENTS.FILTER_TYPE_POI"></span>
                <span class="count-val">{{ counts().poi }}</span>
              </button>
            }
            @if (activeFilter()) {
              <button class="count-chip" (click)="setFilter(null)">
                <cos-icon name="close" size="14"></cos-icon>
                <span translate="COMPONENTS.TOPIC_ARGUMENTS.BTN_CLEAR_FILTER"></span>
              </button>
            }
          </div>

          @if (canPost()) {
            <cos-button variant="primary" (clicked)="showPostForm.set(true)">
              {{ 'COMPONENTS.TOPIC_ARGUMENTS.BTN_ADD_ARGUMENT' | translate }}
            </cos-button>
          }
        </div>

        @if (showPostForm()) {
          <div class="post-form-container">
            <cos-post-argument-form
              [topicId]="topic().id"
              [discussionId]="discussion()!.id"
              (cancel)="showPostForm.set(false)"
              (posted)="onArgumentPosted()"
            ></cos-post-argument-form>
          </div>
        }

        <div class="arguments-list">
          @if (loading() && !arguments().length) {
            <div class="loading-placeholder" translate="COMPONENTS.TOPIC_ARGUMENTS.LOADING"></div>
          }

          @for (argument of flattenedArguments(); track argument.id) {
            <cos-argument
              [argument]="argument"
              [topicId]="topic().id"
              [discussionId]="discussion()!.id"
              (deleted)="reload()"
            ></cos-argument>
          } @empty {
            @if (!loading()) {
              <div class="empty-state">
                <p translate="COMPONENTS.TOPIC_ARGUMENTS.NO_ARGUMENTS"></p>
                @if (canPost()) {
                  <cos-button variant="secondary" (clicked)="showPostForm.set(true)">
                    {{ 'COMPONENTS.TOPIC_ARGUMENTS.BTN_BE_FIRST' | translate }}
                  </cos-button>
                }
              </div>
            }
          }
        </div>
      </div>
    } @else {
      <div class="no-discussion">
        <p translate="COMPONENTS.TOPIC_ARGUMENTS.NO_DISCUSSION"></p>
      </div>
    }
  `,
  styles: [`
    .discussion-wrap { display: flex; flex-direction: column; gap: 16px; }

    .discussion-header { display: flex; flex-direction: column; gap: 8px; padding-bottom: 16px; border-bottom: 1px solid var(--color-border); }
    .discussion-question { font-size: 18px; font-weight: 700; color: var(--color-text); }
    .discussion-deadline { display: flex; gap: 8px; font-size: 13px; color: var(--color-text-muted); }
    .deadline-value { font-weight: 600; color: var(--color-text); }

    .arguments-toolbar { display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; }
    .argument-counts { display: flex; gap: 8px; flex-wrap: wrap; }
    .count-chip {
      display: flex; align-items: center; gap: 6px;
      padding: 4px 12px; border-radius: 99px; border: 1px solid var(--color-border);
      background: var(--color-background); cursor: pointer; font-size: 13px; font-weight: 500;
      transition: border-color .15s, background .15s;
      &:hover { border-color: var(--color-primary); }
      &.active { background: var(--color-secondary); border-color: var(--color-primary); }
    }
    .count-chip--pro { &.active { background: #e8f5e9; border-color: #5AB467; } }
    .count-chip--con { &.active { background: #ffebee; border-color: #EF4025; } }
    .count-chip--poi { &.active { background: #e3f2fd; border-color: #1168A8; } }
    .count-val { font-weight: 700; }

    .post-form-container { background: var(--color-surfaces); border-radius: var(--radius-md); padding: 16px; border: 1px solid var(--color-border); }

    .arguments-list { display: flex; flex-direction: column; gap: 0; }
    .loading-placeholder { color: var(--color-text-muted); font-style: italic; padding: 24px 0; text-align: center; }
    .empty-state { text-align: center; padding: 32px; display: flex; flex-direction: column; align-items: center; gap: 16px; color: var(--color-text-muted); }
    .no-discussion { padding: 24px; text-align: center; color: var(--color-text-muted); }
  `]
})
export class TopicDiscussionComponent implements OnInit {
  topic = input.required<Topic>();

  private topicService = inject(TopicService);
  private discussionService = inject(TopicDiscussionService);
  private argumentService = inject(TopicArgumentService);
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
}

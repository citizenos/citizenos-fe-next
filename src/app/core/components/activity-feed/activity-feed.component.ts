import { Component, ChangeDetectionStrategy, inject, signal, effect } from '@angular/core';
import { tap } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService, ActivityGroup } from '../../services/activity.service';
import { ActivityFeedState } from '../../state/activity-feed.state';
import { ActivityItemComponent } from '../../../shared/components/activity-item/activity-item.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-activity-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ActivityItemComponent, IconComponent],
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent {
  readonly feedState = inject(ActivityFeedState);
  private activityService = inject(ActivityService);

  readonly activities = signal<ActivityGroup[]>([]);
  readonly hasMore = this.activityService.hasMore;

  get feedType(): string {
    if (this.feedState.groupId()) return 'group';
    if (this.feedState.topicId()) return 'topic';
    return 'global';
  }

  constructor() {
    effect(() => {
      if (!this.feedState.isOpen()) return;
      this.activities.set([]);
      this.activityService.reset();
      this.activityService
        .loadItems({ groupId: this.feedState.groupId(), topicId: this.feedState.topicId() })
        .pipe(
          tap(page => {
            this.activities.update(prev => [...prev, ...page]);
          })
        )
        .subscribe();
    });
  }

  onScroll(event: Event): void {
    const el = event.target as HTMLElement;
    if (el.scrollTop + el.offsetHeight >= el.scrollHeight - 50 && this.hasMore()) {
      this.activityService.loadMore();
    }
  }

  close(): void {
    this.activityService.reset();
    this.activityService.reloadUnreadItems();
    this.feedState.close();
  }
}

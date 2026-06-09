import { Component, ChangeDetectionStrategy, inject, signal, DestroyRef } from '@angular/core';
import { takeUntilDestroyed, toObservable } from '@angular/core/rxjs-interop';
import { switchMap, tap, combineLatest, map, of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService, ActivityGroup } from '../../services/activity.service';
import { ActivityFeedState } from '../../state/activity-feed.state';
import { ActivityItemComponent } from '../../../shared/components/activity-item/activity-item.component';
import { IconComponent } from '../../../shared/components/icon/icon.component';
import { TourItemDirective } from '../../../shared/directives/tour-item.directive';
import { DropdownComponent } from '../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-activity-feed',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ActivityItemComponent, IconComponent, DropdownComponent, TourItemDirective],
  templateUrl: './activity-feed.component.html',
  styleUrls: ['./activity-feed.component.scss']
})
export class ActivityFeedComponent {
  readonly feedState = inject(ActivityFeedState);
  readonly activityService = inject(ActivityService);
  private destroyRef = inject(DestroyRef);

  readonly activities = signal<ActivityGroup[]>([]);
  readonly hasMore = this.activityService.hasMore;

  get feedType(): string {
    if (this.feedState.groupId()) return 'group';
    if (this.feedState.topicId()) return 'topic';
    return 'global';
  }

  constructor() {
    // Single reactive pipeline to handle feed opening, context changes, and filtering
    combineLatest([
      toObservable(this.feedState.isOpen),
      toObservable(this.feedState.groupId),
      toObservable(this.feedState.topicId),
      toObservable(this.activityService.filter)
    ]).pipe(
      map(([isOpen, groupId, topicId, filterVal]) => ({ isOpen, groupId, topicId, filterVal })),
      switchMap(({ isOpen, groupId, topicId, filterVal }) => {
        if (!isOpen) {
          this.activities.set([]);
          return of([]);
        }
        this.activities.set([]);
        this.activityService.reset();
        return this.activityService.loadItems({
          groupId,
          topicId,
          include: filterVal === 'all' ? null : filterVal
        });
      }),
      tap(page => {
        if (this.feedState.isOpen()) {
          this.activities.update(prev => [...prev, ...page]);
        }
      }),
      takeUntilDestroyed(this.destroyRef)
    ).subscribe();
  }

  filterActivities(filter: string) {
    this.activityService.filter.set(filter);
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

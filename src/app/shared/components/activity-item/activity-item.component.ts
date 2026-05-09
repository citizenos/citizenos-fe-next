import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { DatePipe } from '@angular/common';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { TranslateService } from '@ngx-translate/core';
import { ActivityService, ActivityGroup, ActivityItem } from '../../../core/services/activity.service';
import { ActivityFeedState } from '../../../core/state/activity-feed.state';

@Component({
  selector: 'cos-activity-item',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [DatePipe],
  templateUrl: './activity-item.component.html',
  styleUrls: ['./activity-item.component.scss']
})
export class ActivityItemComponent {
  activityGroup = input.required<ActivityGroup>();

  private sanitizer = inject(DomSanitizer);
  private translate = inject(TranslateService);
  readonly activityService = inject(ActivityService);
  private feedState = inject(ActivityFeedState);

  get activity() { return this.activityGroup().values[0]; }
  get count() { return this.activityGroup().values.length; }

  translate_activity(activity: ActivityItem): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(
      this.translate.instant(activity.string ?? '', activity.values)
    );
  }

  translate_group(group: ActivityGroup): SafeHtml {
    const values = { ...group.values[0].values, groupCount: group.values.length };
    if (group.referer.indexOf('USERACTIVITYGROUP') === -1) values.groupCount--;
    return this.sanitizer.bypassSecurityTrustHtml(
      this.translate.instant(group.referer.split(':')[0], values)
    );
  }

  translate_version(activity: ActivityItem, type: 'previous' | 'new'): SafeHtml {
    const key = type === 'previous'
      ? 'ACTIVITY_FEED.ACTIVITY_PREVIOUS_VERSION'
      : 'ACTIVITY_FEED.ACTIVITY_NEW_VERSION';
    const prev = activity.values?.['previousValue'] ?? '';
    const next = activity.values?.['newValue'] ?? '';
    return this.sanitizer.bypassSecurityTrustHtml(
      this.translate.instant(key, {
        previousValue: prev.toString().slice(0, 200) + (prev.toString().length > 200 ? '...' : ''),
        newValue: next.toString().slice(0, 200) + (next.toString().length > 200 ? '...' : '')
      })
    );
  }

  redirect(activity: ActivityItem): void {
    this.activityService.handleActivityRedirect(activity);
    this.feedState.close();
  }
}

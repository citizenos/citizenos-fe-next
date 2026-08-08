import { IconComponent } from '../icon/icon.component';
import { Component, ChangeDetectionStrategy, inject, input, computed } from '@angular/core';
import { rxResource } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityFeedState } from '../../../core/state/activity-feed.state';
import { UserStore } from '../../../core/state/user.store';
import { of } from 'rxjs';

@Component({
  selector: 'cos-activities-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent],
  templateUrl: './activities-button.component.html',
  styleUrls: ['./activities-button.component.scss']
})
export class ActivitiesButtonComponent {
  groupId = input<string>();
  topicId = input<string>();

  private activityService = inject(ActivityService);
  private feedState = inject(ActivityFeedState);
  private userStore = inject(UserStore);

  private unreadResource = rxResource({
    params: () => ({
      auth: this.userStore.isAuthenticated(),
      groupId: this.groupId(),
      topicId: this.topicId()
    }),
    stream: ({ params }) => params.auth
      ? this.activityService.unreadCount$({ groupId: params.groupId, topicId: params.topicId })
      : of(0)
  });

  readonly unreadCount = computed(() => this.unreadResource.value() || 0);

  open(): void {
    this.feedState.toggle({ groupId: this.groupId(), topicId: this.topicId() });
  }
}

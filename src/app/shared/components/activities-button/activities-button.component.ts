import { IconComponent } from '../icon/icon.component';
import { Component, ChangeDetectionStrategy, inject, input } from '@angular/core';
import { toSignal, toObservable } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService } from '../../../core/services/activity.service';
import { ActivityFeedState } from '../../../core/state/activity-feed.state';
import { UserStore } from '../../../core/state/user.store';
import { switchMap, of } from 'rxjs';

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

  readonly unreadCount = toSignal(
    toObservable(this.userStore.isAuthenticated).pipe(
      switchMap(authenticated =>
        authenticated
          ? this.activityService.unreadCount$({ groupId: this.groupId(), topicId: this.topicId() })
          : of(0)
      )
    ),
    { initialValue: 0 }
  );

  open(): void {
    this.feedState.toggle({ groupId: this.groupId(), topicId: this.topicId() });
  }
}

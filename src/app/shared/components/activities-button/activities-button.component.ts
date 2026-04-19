import { Component, ChangeDetectionStrategy, inject, input, Output, EventEmitter } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { TranslateModule } from '@ngx-translate/core';
import { ActivityService } from '../../../core/services/activity.service';
import { UserStore } from '../../../core/state/user.store';
import { switchMap, of } from 'rxjs';
import { toObservable } from '@angular/core/rxjs-interop';

@Component({
  selector: 'cos-activities-button',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule],
  templateUrl: './activities-button.component.html',
  styleUrls: ['./activities-button.component.scss']
})
export class ActivitiesButtonComponent {
  groupId = input<string>();
  topicId = input<string>();

  @Output() activate = new EventEmitter<void>();

  private activityService = inject(ActivityService);
  private userStore = inject(UserStore);

  readonly unreadCount = toSignal(
    toObservable(this.userStore.isAuthenticated).pipe(
      switchMap(authenticated =>
        authenticated
          ? this.activityService.getUnreadCount({ groupId: this.groupId(), topicId: this.topicId() })
          : of(0)
      )
    ),
    { initialValue: 0 }
  );
}

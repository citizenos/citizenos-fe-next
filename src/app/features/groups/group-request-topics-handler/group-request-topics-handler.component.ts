import { Component, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { combineLatest, map, switchMap, take, of } from 'rxjs';
import { GroupRequestTopicService } from '../../../core/services/group-request-topic.service';
import { NotificationService } from '../../../core/services/notification.service';
import { UserStore } from '../../../core/state/user.store';
import { ConfigStore } from '../../../core/state/config.store';

@Component({
  selector: 'app-group-request-topics-handler',
  standalone: true,
  template: '',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class GroupRequestTopicsHandlerComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private requestService = inject(GroupRequestTopicService);
  private notification = inject(NotificationService);
  private userStore = inject(UserStore);
  private configStore = inject(ConfigStore);

  ngOnInit() {
    combineLatest([this.route.url, this.route.params]).pipe(
      take(1),
      switchMap(([url, params]) => {
        const curPath = url[url.length - 1]?.path;
        const groupId = params['groupId'];
        const requestId = params['requestId'];

        return this.requestService.get({ groupId, requestId }).pipe(
          take(1),
          switchMap((request) => {
            const acceptMessage = 'MSG_REQUEST_ACCEPTED';
            const rejectMessage = 'MSG_REQUEST_REJECTED';
            const acceptPath = ['/', this.configStore.language(), 'topics', request.topicId];
            const rejectPath = ['/', this.configStore.language(), 'groups', request.groupId];

            const redirect = (path: string[], message: string) => {
              this.router.navigate(path);
              this.notification.showRaw('success', message);
            };

            if (curPath === 'accept') {
              return this.requestService.accept(groupId, requestId).pipe(
                map(() => redirect(acceptPath, acceptMessage))
              );
            } else if (curPath === 'reject') {
              return this.requestService.reject(groupId, requestId).pipe(
                map(() => redirect(rejectPath, rejectMessage))
              );
            } else {
               this.router.navigate(acceptPath);
               return of(null);
            }
          })
        );
      })
    ).subscribe({
        error: (err) => {
            console.error('Group request handler error', err);
            const groupId = this.route.snapshot.params['groupId'];
            if (!this.userStore.isAuthenticated()) {
                this.router.navigate(['/account/login'], {
                    queryParams: { redirectSuccess: window.location.href }
                });
            } else if (groupId) {
                this.router.navigate(['/groups', groupId]);
            } else {
                this.router.navigate(['/']);
            }
        }
    });
  }
}

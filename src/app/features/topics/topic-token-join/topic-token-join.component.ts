import { Component, inject, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { take } from 'rxjs';
import { TopicJoinService } from '../../../core/services/topic-join.service';
import { UserStore } from '../../../core/state/user.store';
import { DialogService } from '../../../shared/dialog/dialog.service';
import { InvitationDialogComponent } from '../../../shared/components/invitation-dialog/invitation-dialog.component';
import { Topic } from '../../../core/interfaces/topic';

@Component({
  selector: 'app-topic-token-join',
  template: '',
  standalone: true,
})
export class TopicTokenJoinComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private topicJoinService = inject(TopicJoinService);
  private userStore = inject(UserStore);
  private dialog = inject(DialogService);

  ngOnInit() {
    const token: string = this.route.snapshot.params['token'];
    const queryParams = this.route.snapshot.queryParams;
    const currentUrl = window.location.href;
    const hasDirectJoin = queryParams['join'] === 'true';

    this.topicJoinService.get(token).pipe(take(1)).subscribe({
      next: (topic: Topic) => {
        const isInTopic = topic.permission?.level && topic.permission.level !== 'none';

        if (isInTopic) {
          this.router.navigate(['/topics', topic.id]);
          return;
        }

        if (hasDirectJoin) {
          if (this.userStore.isAuthenticated()) {
            this.joinTopic(token);
          } else {
            this.router.navigate(['/account/login'], {
              queryParams: { redirectSuccess: currentUrl },
            });
          }
          return;
        }

        this.router.navigate(['dashboard']);
        this.showJoinDialog(topic, token, currentUrl);
      },
      error: (err) => {
        console.error('Topic token join error', err);
      },
    });
  }

  private joinTopic(token: string) {
    this.topicJoinService.join(token).pipe(take(1)).subscribe({
      next: (topic: Topic) => this.router.navigate(['/topics', topic.id]),
      error: (res) => {
        const code = res.status?.code;
        if (code === 40100) {
          this.router.navigate(['/account/login'], {
            queryParams: { redirectSuccess: window.location.href },
          });
        } else if (code === 40001) {
          this.router.navigate(['dashboard']);
        } else {
          this.router.navigate(['/404']);
        }
      },
    });
  }

  private showJoinDialog(topic: Topic, token: string, redirectUrl: string) {
    const publicAccess = topic.visibility === 'public'
      ? { title: 'COMPONENTS.TOPIC_JOIN.BTN_GO_TO_TOPIC', link: ['/topics/', topic.id] }
      : null;

    const data = {
      imageUrl: topic.imageUrl,
      title: topic.title,
      intro: topic.intro,
      description: topic.description,
      creator: topic.creator,
      user: null,
      level: 'read',
      visibility: topic.visibility,
      publicAccess,
      type: 'join',
      view: 'topic',
    };

    this.dialog.open(InvitationDialogComponent, { data }).afterClosed().subscribe((confirm) => {
      if (confirm === true) {
        this.joinTopic(token);
      } else if (topic.visibility !== 'public') {
        this.router.navigate(['dashboard']);
      }
    });
  }
}

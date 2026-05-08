import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit, DestroyRef } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, switchMap, take, map, catchError, forkJoin, Observable } from 'rxjs';
import { isEmail } from 'validator';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { TopicShareComponent } from '../topic-share/topic-share.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';

export interface TopicInviteDialogData {
  topic: Topic;
  allowedLevels?: string[];
  tab?: 'invite' | 'share';
}

@Component({
  selector: 'app-topic-invite-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    UpperCasePipe,
    IconComponent,
    ButtonComponent,
    DropdownComponent,
    TooltipComponent,
    DialogCloseDirective,
    TopicShareComponent,
    InitialsComponent
  ],
  templateUrl: './topic-invite-dialog.component.html',
  styleUrls: ['./topic-invite-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicInviteDialogComponent implements OnInit {
  data = inject<TopicInviteDialogData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicInviteDialogComponent>);
  private topicService = inject(TopicService);
  private topicInviteUserService = inject(TopicInviteUserService);
  private searchService = inject(SearchService);
  private notificationService = inject(NotificationService);
  private translate = inject(TranslateService);
  private destroyRef = inject(DestroyRef);

  topic = signal<Topic>(this.data.topic);
  activeTab = signal<'invite' | 'share'>(this.data.tab || 'invite');
  
  searchString = signal('');
  searchResults = signal<any[]>([]);
  selectedMembers = signal<any[]>([]);
  inviteMessage = signal('');
  
  allowedLevels = signal<string[]>(this.data.allowedLevels || Object.keys(this.topicService.LEVELS));
  readonly LEVELS = Object.keys(this.topicService.LEVELS);
  globalLevel = signal<string>(this.allowedLevels()[0]);

  maxUsers = 550;
  private EMAIL_SEPARATOR_REGEXP = /[;,\s]/ig;

  ngOnInit() {
    if (!this.canInvite()) {
      this.activeTab.set('share');
    }
  }

  canInvite() {
    return this.topicService.canUpdate(this.topic());
  }

  onSearchChange(str: string) {
    this.searchString.set(str);
    if (str && str.length >= 2) {
      this.searchService.searchUsers(str)
        .pipe(
          takeUntilDestroyed(this.destroyRef),
          map(res => {
            if (res.results.public.users.count === 0 && isEmail(str)) {
              return [{ email: str, name: str, id: str }];
            }
            return res.results.public.users.rows;
          }),
          catchError(() => of([]))
        )
        .subscribe(results => this.searchResults.set(results));
    } else {
      this.searchResults.set([]);
    }
  }

  addMember(member: any) {
    if (this.selectedMembers().length >= this.maxUsers) {
      this.notificationService.error('MSG_ERROR_INVITE_MEMBER_COUNT_OVER_LIMIT');
      return;
    }

    // Check for duplicates
    if (this.selectedMembers().find(m => m.id === member.id || m.email === member.email)) {
      this.searchString.set('');
      this.searchResults.set([]);
      return;
    }

    const memberToAdd = {
      ...member,
      level: this.globalLevel()
    };

    this.selectedMembers.update(members => [...members, memberToAdd]);
    this.searchString.set('');
    this.searchResults.set([]);
  }

  addMembersFromInput() {
    const input = this.searchString();
    if (!input) return;

    const emails = input.replace(this.EMAIL_SEPARATOR_REGEXP, ',').split(',');
    const validEmails: any[] = [];
    
    emails.forEach(email => {
      const trimmed = email.trim();
      if (isEmail(trimmed)) {
        if (!this.selectedMembers().find(m => m.email === trimmed || m.id === trimmed)) {
          validEmails.push({
            id: trimmed,
            name: trimmed,
            email: trimmed,
            level: this.globalLevel()
          });
        }
      }
    });

    if (validEmails.length) {
      this.selectedMembers.update(members => [...members, ...validEmails]);
      this.searchString.set('');
      this.searchResults.set([]);
    }
  }

  removeMember(member: any) {
    this.selectedMembers.update(members => members.filter(m => m !== member));
  }

  updateMemberLevel(member: any, level: string) {
    this.selectedMembers.update(members => members.map(m => m === member ? { ...m, level } : m));
  }

  updateAllLevels(level: string) {
    this.globalLevel.set(level);
    this.selectedMembers.update(members => members.map(m => ({ ...m, level })));
  }

  doInvite() {
    if (this.selectedMembers().length === 0) return;

    const invites = this.selectedMembers().map(member => ({
      userId: member.id,
      email: member.email,
      level: member.level,
      inviteMessage: this.inviteMessage()
    }));

    this.topicInviteUserService.save(this.topic().id, invites)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.notificationService.success('COMPONENTS.TOPIC_INVITE.MSG_INVITES_SENT');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to send invites', err);
          this.notificationService.error(err.error?.errors?.[0]?.message || 'MSG_ERROR_INVITE_SEND_FAILED');
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}

import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { Component, ChangeDetectionStrategy, inject, signal, computed, DestroyRef } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, take, catchError, map } from 'rxjs';
import { isEmail } from 'validator';

import { Topic } from '../../../../../core/interfaces/topic';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DIALOG_DATA, DialogRef, DialogCloseDirective } from '../../../../../shared/dialog';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

export interface InviteEditorsData {
  topic: Topic;
}

export interface EditorMember {
  id: string;
  name: string;
  email?: string;
  level: string;
  imageUrl?: string;
}

@Component({
  selector: 'app-invite-editors',
  standalone: true,
  imports: [
    UpperCasePipe, FormsModule, TranslateModule, DialogCloseDirective,
    InitialsComponent, InputComponent, CosDropdownDirective, PaginationComponent, IconComponent],
  templateUrl: './invite-editors.component.html',
  styleUrls: ['./invite-editors.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class InviteEditorsComponent {
  private data = inject<InviteEditorsData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef<InviteEditorsComponent>);
  private topicService = inject(TopicService);
  private topicInviteUserService = inject(TopicInviteUserService);
  private searchService = inject(SearchService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  topic = this.data.topic;
  readonly LEVELS = [this.topicService.LEVELS.edit, this.topicService.LEVELS.admin];

  inviteMessage = signal('');
  readonly inviteMessageMaxLength = 1000;

  searchString = signal('');
  searchResults = signal<EditorMember[]>([]);
  members = signal<EditorMember[]>([]);
  invalid = signal<string[]>([]);
  topicLevel = signal<string>(this.LEVELS[0]);

  membersPage = signal(1);
  readonly itemsPerPage = 10;

  totalPages = computed(() => Math.ceil(this.members().length / this.itemsPerPage));
  private EMAIL_SEPARATOR_REGEXP = /[;,\s]/ig;

  onSearch(str: string) {
    this.searchString.set(str);
    if (str && str.length >= 2) {
      this.searchService.searchUsers(str).pipe(
        takeUntilDestroyed(this.destroyRef),
        map(res => {
          const results = res?.results?.public?.users;
          if (results?.count === 0 && isEmail(str)) {
            return [{ email: str, name: str, id: str }];
          }
          return results?.rows || [];
        }),
        catchError(() => of([]))
      ).subscribe(results => this.searchResults.set(results as EditorMember[]));
    } else {
      this.searchResults.set([]);
    }
  }

  addTopicMember(member?: EditorMember) {
    if (this.members().length >= 550) {
      this.notificationService.error('MSG_ERROR_INVITE_MEMBER_COUNT_OVER_LIMIT');
      return;
    }
    if (!member) {
      this.addFromInput();
      return;
    }
    if (member.name === member.email || member.name === member.id) {
      this.addFromInput();
      return;
    }
    if (this.members().find(m => m.id === member.id)) {
      this.searchString.set('');
      this.searchResults.set([]);
      return;
    }
    this.members.update(list => [...list, { ...member, level: this.topicLevel() }].sort(byName));
    this.searchString.set('');
    this.searchResults.set([]);
  }

  private addFromInput() {
    const input = this.searchString();
    if (!input) return;

    const emails = input.replace(this.EMAIL_SEPARATOR_REGEXP, ',').split(',');
    const added: EditorMember[] = [];
    const invalid: string[] = [];

    emails.forEach(raw => {
      const email = raw.trim();
      if (!email) return;
      if (isEmail(email)) {
        if (!this.members().find(m => m.id === email)) {
          added.push({ id: email, name: email, level: this.topicLevel() });
        }
      } else {
        invalid.push(email);
      }
    });

    if (added.length) {
      this.members.update(list => [...list, ...added].sort(byName));
    }
    if (invalid.length) {
      this.invalid.update(list => [...list, ...invalid]);
    }
    this.searchString.set('');
    this.searchResults.set([]);
  }

  addCorrectedEmail(email: string, index: number) {
    if (isEmail(email.trim())) {
      if (!this.members().find(m => m.id === email.trim())) {
        this.members.update(list => [...list, { id: email.trim(), name: email.trim(), level: this.topicLevel() }]);
      }
      this.invalid.update(list => list.filter((_, i) => i !== index));
    }
  }

  removeInvalidEmail(index: number) {
    this.invalid.update(list => list.filter((_, i) => i !== index));
  }

  removeTopicMemberUser(member: EditorMember) {
    this.members.update(list => list.filter(m => m !== member));
  }

  updateTopicMemberUserLevel(member: EditorMember, level: string) {
    this.members.update(list => list.map(m => m === member ? { ...m, level } : m));
  }

  updateAllMemberLevels(level: string) {
    this.topicLevel.set(level);
    this.members.update(list => list.map(m => ({ ...m, level })));
  }

  removeAllMembers() {
    this.members.set([]);
  }

  isOnPage(index: number): boolean {
    const page = this.membersPage();
    const end = page * this.itemsPerPage;
    return index >= (end - this.itemsPerPage) && index < end;
  }

  loadPage(pageNr: number) {
    this.membersPage.set(pageNr);
  }

  inviteEditors() {
    const members = this.members();
    if (!members.length) return;

    const invites = members.map(m => ({
      userId: m.id,
      inviteMessage: this.inviteMessage() || null,
      level: m.level
    }));

    this.topicInviteUserService.save(this.topic.id, invites).pipe(take(1)).subscribe({
      next: (res) => {
        this.notificationService.success('COMPONENTS.TOPIC_INVITE_EDITORS.MSG_INVITES_SENT');
        this.dialogRef.close(res);
      },
      error: (err) => console.error(err)
    });
  }
}

function byName(a: EditorMember, b: EditorMember): number {
  return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
}

import {
  Component, ChangeDetectionStrategy, inject, signal, computed, OnInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../../shared/dialog';
import { GroupInviteUserService } from '../../../../core/services/group-invite-user.service';
import { GroupJoinService } from '../../../../core/services/group-join.service';
import { GroupMemberUserService } from '../../../../core/services/group-member-user.service';
import { SearchService } from '../../../../core/services/search.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { TypeaheadComponent, TypeaheadItemDirective, TypeaheadSelectDirective } from '../../../../shared/components/typeahead/typeahead.component';
import { GroupShareComponent } from '../../group-detail/components/group-share/group-share.component';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { TooltipComponent } from '../../../../shared/components/tooltip/tooltip.component';
import { Group } from '../../../../core/interfaces/group';
import { UserStore } from '../../../../core/state/user.store';
import { of, switchMap, take } from 'rxjs';
import { SearchResults } from '../../../../core/interfaces/search';

export interface GroupInviteUser {
  userId: string;
  name?: string;
  email?: string;
  level: string;
  id?: string;
}

export interface SearchResultUser {
  id?: string;
  userId?: string;
  name: string;
  email?: string;
  imageUrl?: string;
}

const EMAIL_SEPARATOR = /[;,\s]/ig;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isEmail(s: string) { return EMAIL_RE.test(s.trim()); }

@Component({
  selector: 'cos-group-invite-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule, FormsModule, IconComponent, DropdownComponent,
    TypeaheadComponent, TypeaheadItemDirective, TypeaheadSelectDirective, DialogCloseDirective, GroupShareComponent, ButtonComponent,
    TooltipComponent
  ],
  templateUrl: './group-invite-dialog.component.html',
  styleUrls: ['./group-invite-dialog.component.scss'],
})
export class GroupInviteDialogComponent implements OnInit {
  private data = inject<{ group: Group; results?: SearchResults; rows?: SearchResultUser[] }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private inviteUserService = inject(GroupInviteUserService);
  private groupJoinService = inject(GroupJoinService);
  private memberUserService = inject(GroupMemberUserService);
  private searchService = inject(SearchService);
  private notification = inject(NotificationService);
  private dialogService = inject(DialogService);
  private userStore = inject(UserStore);
  private translate = inject(TranslateService);

  group = signal<Group>({ ...this.data.group });
  activeTab = signal<'invite' | 'share'>('invite');

  LEVELS = this.memberUserService.LEVELS;
  selectedLevel = signal(this.LEVELS[0]);

  inviteMessage = signal('');
  inviteMessageMaxLength = 250;

  pendingUsers = signal<GroupInviteUser[]>([]);
  invalidEmails = signal<string[]>([]);
  searchResults = signal<SearchResultUser[]>([]);
  noUsersSelected = signal(false);

  join = signal({ token: this.data.group.join?.token ?? null, level: this.data.group.join?.level ?? this.LEVELS[0] });
  joinUrl = signal('');
  copySuccess = signal(false);
  canShare = computed(() => this.data.group.visibility === 'public' || true);

  ngOnInit() {
    this.generateJoinUrl();
  }

  onSearch(str: string) {
    if (str.length < 2) { this.searchResults.set([]); return; }
    this.searchService.searchUsers(str).pipe(
      switchMap(data => {
        const rows = data?.results?.public?.users?.rows ?? data?.rows ?? [];
        if (!rows.length && isEmail(str)) return of([{ name: str, userId: str, email: str }]);
        return of(rows);
      })
    ).subscribe((rows: SearchResultUser[]) => this.searchResults.set(rows));
  }

  addMember(user?: SearchResultUser) {
    this.searchResults.set([]);
    if (!user) return;
    const id = user.userId ?? user.id;
    if (!this.pendingUsers().find(u => (u.userId ?? u.id) === id)) {
      this.pendingUsers.update(u => [...u, { ...user, userId: id, level: this.selectedLevel() } as GroupInviteUser]);
    }
  }

  addEmail(email: string) {
    const emails = email.replace(EMAIL_SEPARATOR, ',').split(',').map(e => e.trim()).filter(e => e);
    const valid: GroupInviteUser[] = [];
    const invalid: string[] = [];
    emails.forEach(e => {
      if (isEmail(e)) {
        if (!this.pendingUsers().find(u => u.userId === e)) {
          valid.push({ userId: e, name: e, level: this.selectedLevel() });
        }
      } else if (e) {
        invalid.push(e);
      }
    });
    if (valid.length) this.pendingUsers.update(u => [...u, ...valid]);
    if (invalid.length) this.invalidEmails.update(inv => [...inv, ...invalid]);
  }

  removeMember(user: GroupInviteUser) {
    this.pendingUsers.update(u => u.filter(m => m !== user));
  }

  removeInvalid(index: number) {
    this.invalidEmails.update(inv => inv.filter((_, i) => i !== index));
  }

  updateLevel(user: GroupInviteUser, level: string) {
    this.pendingUsers.update(u => u.map(m => m === user ? { ...m, level } : m));
  }

  updateAllLevels(level: string) {
    this.selectedLevel.set(level);
    this.pendingUsers.update(u => u.map(m => ({ ...m, level })));
  }

  invite() {
    const users = this.pendingUsers();
    if (!users.length) { this.noUsersSelected.set(true); setTimeout(() => this.noUsersSelected.set(false), 5000); return; }

    const invites = users.map(u => ({ userId: u.userId ?? u.id, level: u.level, inviteMessage: this.inviteMessage() }));
    this.inviteUserService.invite(this.group().id, invites).pipe(take(1)).subscribe(() => this.dialogRef.close(true));
  }

  private generateJoinUrl() {
    const j = this.join();
    const base = window.location.origin;
    const url = j.token
      ? `${base}/groups/join/${j.token}`
      : `${base}/groups/${this.group().id}/join`;
    this.joinUrl.set(url);
  }
}

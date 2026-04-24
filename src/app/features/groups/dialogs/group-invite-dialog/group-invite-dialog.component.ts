import {
  Component, ChangeDetectionStrategy, inject, signal, computed,
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
import { ConfirmDialogComponent } from '../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead.component';
import { Group } from '../../../../core/interfaces/group';
import { UserStore } from '../../../../core/state/user.store';
import { of, switchMap, take } from 'rxjs';

const EMAIL_SEPARATOR = /[;,\s]/ig;
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function isEmail(s: string) { return EMAIL_RE.test(s.trim()); }

@Component({
  selector: 'cos-group-invite-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    TranslateModule, FormsModule, IconComponent, DropdownComponent,
    TypeaheadComponent, DialogCloseDirective,
  ],
  templateUrl: './group-invite-dialog.component.html',
  styleUrls: ['./group-invite-dialog.component.scss'],
})
export class GroupInviteDialogComponent {
  private data = inject<{ group: Group }>(DIALOG_DATA);
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

  pendingUsers = signal<any[]>([]);
  invalidEmails = signal<string[]>([]);
  searchResults = signal<any[]>([]);
  noUsersSelected = signal(false);

  join = signal({ token: this.data.group.join?.token ?? null, level: this.data.group.join?.level ?? this.LEVELS[0] });
  joinUrl = signal('');
  copySuccess = signal(false);
  canShare = computed(() => this.data.group.visibility === 'public' || true);

  constructor() {
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
    ).subscribe(rows => this.searchResults.set(rows));
  }

  addMember(user?: any) {
    this.searchResults.set([]);
    if (!user) return;
    const id = user.userId ?? user.id;
    if (!this.pendingUsers().find(u => (u.userId ?? u.id) === id)) {
      this.pendingUsers.update(u => [...u, { ...user, userId: id, level: this.selectedLevel() }]);
    }
  }

  addEmail(email: string) {
    const emails = email.replace(EMAIL_SEPARATOR, ',').split(',').map(e => e.trim()).filter(e => e);
    const valid: any[] = [];
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

  removeMember(user: any) {
    this.pendingUsers.update(u => u.filter(m => m !== user));
  }

  removeInvalid(index: number) {
    this.invalidEmails.update(inv => inv.filter((_, i) => i !== index));
  }

  updateLevel(user: any, level: string) {
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

  generateToken() {
    this.dialogService.open(ConfirmDialogComponent, {
      data: {
        heading: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_HEADING',
        title: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_TXT_ARE_YOU_SURE',
        closeBtn: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_NO',
        confirmBtn: 'MODALS.GROUP_INVITE_SHARE_LINK_GENERATE_CONFIRM_BTN_YES',
      }
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (!confirmed) return;
      this.groupJoinService.generateToken(this.group().id, this.join().level).pipe(take(1)).subscribe(res => {
        this.join.set({ token: res.token, level: res.level });
        this.generateJoinUrl();
      });
    });
  }

  updateJoinLevel(level: string) {
    const j = this.join();
    this.groupJoinService.updateLevel(this.group().id, j.token!, level).pipe(take(1)).subscribe(() => {
      this.join.update(j => ({ ...j, level }));
    });
  }

  copyLink() {
    const url = this.joinUrl();
    if (!url) return;
    navigator.clipboard.writeText(url).then(() => {
      this.copySuccess.set(true);
      setTimeout(() => this.copySuccess.set(false), 3000);
    });
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

import { Component, ChangeDetectionStrategy, input, output, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { SearchService } from '../../../../../core/services/search.service';
import { SearchResultUser } from '../../../../../core/interfaces/user';
import { GroupMember } from '../../../../../core/services/group-member-user.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { GroupCreateData } from '../../group-create.interface';

@Component({
  selector: 'cos-step-invite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, IconComponent, InputComponent, DropdownComponent, ButtonComponent],
  templateUrl: './step-invite.component.html',
  styleUrl: './step-invite.component.scss',
})
export class StepInviteComponent implements OnInit {
  group = input.required<GroupCreateData>();
  groupUpdate = output<GroupCreateData>();

  private searchService = inject(SearchService);

  LEVELS = ['read', 'admin'];

  searchString = signal('');
  searchResults = signal<SearchResultUser[]>([]);
  selectedUsers = signal<Partial<GroupMember>[]>([]);
  inviteMessage = signal('');

  ngOnInit() {
    if (this.group().members?.users) {
      this.selectedUsers.set(this.group().members?.users || []);
    }
  }

  onSearch(str: string) {
    this.searchString.set(str);
    if (str.length >= 2) {
      this.searchService.searchUsers(str).subscribe((res: unknown) => {
        const data = res as { results?: { public?: { users?: { rows: SearchResultUser[] } } } };
        this.searchResults.set(data.results?.public?.users?.rows ?? []);
      });
    } else {
      this.searchResults.set([]);
    }
  }

  addUser(user: SearchResultUser) {
    if (!this.selectedUsers().find(u => u.id === user.id || u.email === user.email)) {
      this.selectedUsers.update(users => [...users, { ...user, level: 'read' } as Partial<GroupMember>]);
      this.emitChange();
    }
    this.searchString.set('');
    this.searchResults.set([]);
  }

  removeUser(user: Partial<GroupMember>) {
    this.selectedUsers.update(users => users.filter(u => u.id !== user.id && u.email !== user.email));
    this.emitChange();
  }

  updateLevel(user: Partial<GroupMember>, level: string) {
    this.selectedUsers.update(users => users.map(u =>
      (u.id === user.id || u.email === user.email) ? { ...u, level } : u
    ));
    this.emitChange();
  }

  onMessageChange(message: string) {
    this.inviteMessage.set(message);
    this.groupUpdate.emit({ inviteMessage: message });
  }

  private emitChange() {
    this.groupUpdate.emit({
      members: { ...this.group().members, users: this.selectedUsers() },
    });
  }
}

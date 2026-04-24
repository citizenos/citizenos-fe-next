import { Component, ChangeDetectionStrategy, input, output, inject, signal, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Group } from '../../../../../core/interfaces/group';
import { SearchService } from '../../../../../core/services/search.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-step-invite',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, IconComponent, InputComponent, DropdownComponent],
  templateUrl: './step-invite.component.html',
  styleUrl: './step-invite.component.scss',
})
export class StepInviteComponent implements OnInit {
  group = input.required<Partial<Group>>();
  groupUpdate = output<Partial<Group>>();

  private searchService = inject(SearchService);

  LEVELS = ['read', 'admin'];

  searchString = signal('');
  searchResults = signal<any[]>([]);
  selectedUsers = signal<any[]>([]);
  inviteMessage = signal('');

  ngOnInit() {
    if (this.group().members?.users) {
      this.selectedUsers.set(this.group().members!.users);
    }
  }

  onSearch(str: string) {
    this.searchString.set(str);
    if (str.length >= 2) {
      this.searchService.searchUsers(str).subscribe(res => {
        this.searchResults.set(res.results?.public?.users?.rows ?? []);
      });
    } else {
      this.searchResults.set([]);
    }
  }

  addUser(user: any) {
    if (!this.selectedUsers().find(u => u.id === user.id || u.email === user.email)) {
      this.selectedUsers.update(users => [...users, { ...user, level: 'read' }]);
      this.emitChange();
    }
    this.searchString.set('');
    this.searchResults.set([]);
  }

  removeUser(user: any) {
    this.selectedUsers.update(users => users.filter(u => u.id !== user.id && u.email !== user.email));
    this.emitChange();
  }

  updateLevel(user: any, level: string) {
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

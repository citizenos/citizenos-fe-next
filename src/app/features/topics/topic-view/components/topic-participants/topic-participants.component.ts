import { Component, ChangeDetectionStrategy, inject, signal, computed, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef, DialogService } from '../../../../../shared/dialog';
import { DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicMemberUserService } from '../../../../../core/services/topic-member-user.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { TopicInviteUserService } from '../../../../../core/services/topic-invite-user.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { TopicMemberUserComponent } from '../topic-member-user/topic-member-user.component';
import { TopicMemberGroupComponent } from '../topic-member-group/topic-member-group.component';
import { TopicMemberInviteComponent } from '../topic-member-invite/topic-member-invite.component';
import { NotificationComponent } from '../../../../../shared/components/notification/notification.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { take, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';
import { Topic } from '../../../../../core/interfaces/topic';
import { TopicMemberUser } from '../../../../../core/services/topic-member-user.service';
import { TopicMemberGroup } from '../../../../../core/services/topic-member-group.service';
import { TopicInvite } from '../../../../../core/services/topic-invite-user.service';

const PAGE_SIZE = 10;

@Component({
  selector: 'app-topic-participants',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    FormsModule,
    UpperCasePipe,
    TranslateModule,
    DialogCloseDirective,
    CosDropdownDirective,
    InputComponent,
    PaginationComponent,
    TopicMemberUserComponent,
    TopicMemberGroupComponent,
    TopicMemberInviteComponent,
    NotificationComponent,
    TooltipComponent,
  ],
  templateUrl: './topic-participants.component.html',
  styleUrl: './topic-participants.component.scss',
})
export class TopicParticipantsComponent implements OnInit {
  private data = inject<{ topic: Topic }>(DIALOG_DATA);
  private memberUserService = inject(TopicMemberUserService);
  private memberGroupService = inject(TopicMemberGroupService);
  private inviteUserService = inject(TopicInviteUserService);
  public dialogRef = inject(DialogRef<TopicParticipantsComponent>);

  topic = this.data.topic;
  activeTab = signal('participants');

  allUsers = signal<TopicMemberUser[]>([]);
  allGroups = signal<TopicMemberGroup[]>([]);
  allInvites = signal<TopicInvite[]>([]);

  userSearch = signal('');
  groupSearch = signal('');
  inviteSearch = signal('');

  userOrderField = signal('name');
  userOrderDir = signal<'asc' | 'desc'>('asc');
  groupOrderField = signal('name');
  groupOrderDir = signal<'asc' | 'desc'>('asc');
  inviteOrderField = signal('name');
  inviteOrderDir = signal<'asc' | 'desc'>('asc');

  userPage = signal(1);
  groupPage = signal(1);
  invitePage = signal(1);

  filteredUsers = computed(() => {
    const q = this.userSearch().toLowerCase();
    const list = q ? this.allUsers().filter(u => (u.name || '').toLowerCase().includes(q)) : this.allUsers();
    const field = this.userOrderField();
    const dir = this.userOrderDir();
    return [...list].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[field] || '').toLowerCase();
      const bv = String((b as unknown as Record<string, unknown>)[field] || '').toLowerCase();
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  });

  filteredGroups = computed(() => {
    const q = this.groupSearch().toLowerCase();
    const list = q ? this.allGroups().filter(g => (g.name || '').toLowerCase().includes(q)) : this.allGroups();
    const field = this.groupOrderField();
    const dir = this.groupOrderDir();
    return [...list].sort((a, b) => {
      const av = String((a as unknown as Record<string, unknown>)[field] || '').toLowerCase();
      const bv = String((b as unknown as Record<string, unknown>)[field] || '').toLowerCase();
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  });

  filteredInvites = computed(() => {
    const q = this.inviteSearch().toLowerCase();
    const list = q ? this.allInvites().filter(i => (i.user?.name || i.email || '').toLowerCase().includes(q)) : this.allInvites();
    const field = this.inviteOrderField();
    const dir = this.inviteOrderDir();
    return [...list].sort((a, b) => {
      const ar = a as unknown as Record<string, unknown>;
      const br = b as unknown as Record<string, unknown>;
      const av = String(ar[field] || (ar['user'] as Record<string, unknown>)?.[field] || '').toLowerCase();
      const bv = String(br[field] || (br['user'] as Record<string, unknown>)?.[field] || '').toLowerCase();
      return dir === 'asc' ? av.localeCompare(bv) : bv.localeCompare(av);
    });
  });

  userTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredUsers().length / PAGE_SIZE)));
  groupTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredGroups().length / PAGE_SIZE)));
  inviteTotalPages = computed(() => Math.max(1, Math.ceil(this.filteredInvites().length / PAGE_SIZE)));

  pagedUsers = computed(() => {
    const p = this.userPage();
    return this.filteredUsers().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  pagedGroups = computed(() => {
    const p = this.groupPage();
    return this.filteredGroups().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  pagedInvites = computed(() => {
    const p = this.invitePage();
    return this.filteredInvites().slice((p - 1) * PAGE_SIZE, p * PAGE_SIZE);
  });

  ngOnInit(): void {
    this.memberUserService.loadItems(this.topic.id).pipe(take(1)).subscribe(users => this.allUsers.set(users));
    this.memberGroupService.loadItems(this.topic.id).pipe(take(1)).subscribe(groups => this.allGroups.set(groups));
    this.inviteUserService.loadItems(this.topic.id).pipe(take(1)).subscribe(invites => this.allInvites.set(invites));
  }

  setUserSearch(val: string) { this.userSearch.set(val); this.userPage.set(1); }
  setGroupSearch(val: string) { this.groupSearch.set(val); this.groupPage.set(1); }
  setInviteSearch(val: string) { this.inviteSearch.set(val); this.invitePage.set(1); }

  doUserOrder(field: string, dir: 'asc' | 'desc') { this.userOrderField.set(field); this.userOrderDir.set(dir); this.userPage.set(1); }
  doGroupOrder(field: string, dir: 'asc' | 'desc') { this.groupOrderField.set(field); this.groupOrderDir.set(dir); this.groupPage.set(1); }
  doInviteOrder(field: string, dir: 'asc' | 'desc') { this.inviteOrderField.set(field); this.inviteOrderDir.set(dir); this.invitePage.set(1); }
}

@Component({
  selector: 'app-topic-participants-dialog',
  standalone: true,
  template: ''
})
export class TopicParticipantsDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private topicService = inject(TopicService);

  ngOnInit() {
    this.route.params.pipe(
      take(1),
      switchMap((params) => {
        const topicId = params['topicId'];
        return this.topicService.loadTopic(topicId).pipe(
          take(1),
          switchMap((topic) => {
            const dialogRef = this.dialog.open(TopicParticipantsComponent, {
              data: { topic }
            });
            return dialogRef.afterClosed().pipe(
              take(1),
              switchMap(() => {
                const lang = this.router.url.split('/')[1] || 'en';
                return this.router.navigate([lang, 'topics', topicId]);
              })
            );
          })
        );
      })
    ).subscribe();
  }
}


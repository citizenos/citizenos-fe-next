import { Component, ChangeDetectionStrategy, inject, signal, OnInit, DestroyRef } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { UpperCasePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { of, map, catchError, forkJoin, take } from 'rxjs';

import { Topic } from '../../../../../core/interfaces/topic';
import { Group } from '../../../../../core/interfaces/group';
import { TopicService } from '../../../../../core/services/topic.service';
import { TopicMemberGroupService } from '../../../../../core/services/topic-member-group.service';
import { SearchService } from '../../../../../core/services/search.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';

import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';

export interface TopicAddGroupsDialogData {
  topic: Topic;
}

@Component({
  selector: 'app-topic-add-groups-dialog',
  standalone: true,
  imports: [
    TranslateModule,
    FormsModule,
    UpperCasePipe,
    IconComponent,
    ButtonComponent,
    DropdownComponent,
    DialogCloseDirective,
    TooltipComponent
  ],
  templateUrl: './topic-add-groups-dialog.component.html',
  styleUrls: ['./topic-add-groups-dialog.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TopicAddGroupsDialogComponent implements OnInit {
  data = inject<TopicAddGroupsDialogData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef<TopicAddGroupsDialogComponent>);
  private topicService = inject(TopicService);
  private topicMemberGroupService = inject(TopicMemberGroupService);
  private searchService = inject(SearchService);
  private notificationService = inject(NotificationService);
  private destroyRef = inject(DestroyRef);

  topic = signal<Topic>(this.data.topic);
  searchString = signal('');
  searchResults = signal<Group[]>([]);
  selectedGroups = signal<Group[]>([]);
  
  readonly LEVELS = Object.keys(this.topicMemberGroupService.LEVELS);
  globalLevel = signal<string>(this.LEVELS[0]);

  ngOnInit() {}

  onSearchChange(str: string) {
    this.searchString.set(str);
    if (str && str.length >= 2) {
      this.searchService.search(str, {
        include: 'my.group',
        'my.group.level': 'admin'
      })
      .pipe(
        takeUntilDestroyed(this.destroyRef),
        map(res => res.results.my.groups.rows),
        catchError(() => of([]))
      )
      .subscribe(results => this.searchResults.set(results));
    } else {
      this.searchResults.set([]);
    }
  }

  addGroup(group: Group) {
    if (this.selectedGroups().find(g => g.id === group.id)) {
      this.searchString.set('');
      this.searchResults.set([]);
      return;
    }

    const groupToAdd = {
      ...group,
      permission: { level: this.globalLevel() }
    };

    this.selectedGroups.update(groups => [...groups, groupToAdd]);
    this.searchString.set('');
    this.searchResults.set([]);
  }

  removeGroup(group: Group) {
    this.selectedGroups.update(groups => groups.filter(g => g.id !== group.id));
  }

  updateGroupLevel(group: Group, level: string) {
    this.selectedGroups.update(groups => groups.map(g => g.id === group.id ? { ...g, permission: { level } } : g));
  }

  updateAllLevels(level: string) {
    this.globalLevel.set(level);
    this.selectedGroups.update(groups => groups.map(g => ({ ...g, permission: { level } })));
  }

  doSave() {
    if (this.selectedGroups().length === 0) return;

    const saves = this.selectedGroups().map(group => 
      this.topicMemberGroupService.save({
        topicId: this.topic().id,
        groupId: group.id,
        level: group.permission.level
      })
    );

    forkJoin(saves)
      .pipe(take(1))
      .subscribe({
        next: () => {
          this.topicService.reloadTopic();
          this.notificationService.success('COMPONENTS.TOPIC_ADD_GROUPS.MSG_GROUPS_ADDED');
          this.dialogRef.close(true);
        },
        error: (err) => {
          console.error('Failed to add groups', err);
          this.notificationService.error('MSG_ERROR_GROUP_ADD_FAILED');
        }
      });
  }

  close() {
    this.dialogRef.close();
  }
}

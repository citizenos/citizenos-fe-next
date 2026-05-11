import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../../shared/dialog';
import { GroupMemberTopicService } from '../../../../core/services/group-member-topic.service';
import { SearchService } from '../../../../core/services/search.service';
import { TypeaheadComponent } from '../../../../shared/components/typeahead/typeahead.component';
import { DropdownComponent } from '../../../../shared/components/dropdown/dropdown.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Group } from '../../../../core/interfaces/group';
import { Topic } from '../../../../core/interfaces/topic';
import { forkJoin, Observable, of, switchMap, take } from 'rxjs';


const LEVELS = ['read', 'admin'];

@Component({
  selector: 'cos-group-add-topics-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, TypeaheadComponent, DropdownComponent, IconComponent, DialogCloseDirective],
  templateUrl: './group-add-topics-dialog.component.html',
  styleUrls: ['./group-add-topics-dialog.component.scss'],
})
export class GroupAddTopicsDialogComponent {
  private data = inject<{ group: Group }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private groupMemberTopicService = inject(GroupMemberTopicService);
  private searchService = inject(SearchService);
  group = this.data.group;
  LEVELS = LEVELS;

  topicsToAdd = signal<(Topic & { selectedLevel: string })[]>([]);
  searchResults = signal<Topic[]>([]);
  noTopicsSelected = signal(false);

  onSearch(str: string) {
    if (str.length < 2) { this.searchResults.set([]); return; }
    this.searchService.search(str, { include: 'my.topic', 'my.topic.level': 'admin' }).pipe(
      switchMap((data: unknown) => {
        const res = data as { results?: { my?: { topics?: { rows: Topic[] } } } };
        return of(res.results?.my?.topics?.rows ?? []);
      })
    ).subscribe((rows: Topic[]) => this.searchResults.set(rows));
  }

  addTopic(topic: Topic) {
    this.searchResults.set([]);
    if (!topic?.id) return;
    const alreadyAdded = this.topicsToAdd().find(t => t.id === topic.id);
    if (!alreadyAdded) {
      this.topicsToAdd.update(t => [...t, { ...topic, selectedLevel: LEVELS[0] }]);
    }
  }

  removeTopic(topic: Topic) {
    this.topicsToAdd.update(t => t.filter(x => x.id !== topic.id));
  }

  updateLevel(topic: Topic & { selectedLevel: string }, level: string) {
    this.topicsToAdd.update(t => t.map(x => x.id === topic.id ? { ...x, selectedLevel: level } : x));
  }

  save() {
    const topics = this.topicsToAdd();
    if (!topics.length) { this.noTopicsSelected.set(true); return; }

    const requests: Record<string, Observable<unknown>> = {};
    topics.forEach(topic => {
      requests[topic.id] = this.groupMemberTopicService.addTopic(this.group.id, topic.id, topic.selectedLevel);
    });

    forkJoin(requests).pipe(take(1)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close(false),
    });
  }
}

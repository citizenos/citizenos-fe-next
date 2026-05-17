import { Component, ChangeDetectionStrategy, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogCloseDirective } from '../../../../shared/dialog';
import { GroupRequestTopicService } from '../../../../core/services/group-request-topic.service';
import { SearchService } from '../../../../core/services/search.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { TypeaheadComponent, TypeaheadItemDirective, TypeaheadSelectDirective } from '../../../../shared/components/typeahead/typeahead.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { Group } from '../../../../core/interfaces/group';
import { Topic } from '../../../../core/interfaces/topic';
import { forkJoin, Observable, of, switchMap, take } from 'rxjs';

@Component({
  selector: 'cos-group-request-topics-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, FormsModule, TypeaheadComponent, TypeaheadItemDirective, TypeaheadSelectDirective, IconComponent, DialogCloseDirective],
  templateUrl: './group-request-topics-dialog.component.html',
  styleUrls: ['./group-request-topics-dialog.component.scss'],
})
export class GroupRequestTopicsDialogComponent {
  private data = inject<{ group: Group }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private requestService = inject(GroupRequestTopicService);
  private searchService = inject(SearchService);
  private notification = inject(NotificationService);

  group = this.data.group;

  topicsToRequest = signal<Topic[]>([]);
  searchResults = signal<Topic[]>([]);
  message = signal('');
  noTopicsSelected = signal(false);

  onSearch(str: string) {
    if (str.length < 2) { this.searchResults.set([]); return; }
    this.searchService.search(str, { include: 'my.topic', 'my.topic.level': 'admin' }).pipe(
      switchMap((data: unknown) => of((data as { results?: { my?: { topics?: { rows: Topic[] } } } })?.results?.my?.topics?.rows ?? []))
    ).subscribe(rows => this.searchResults.set(rows));
  }

  addTopic(topic: Topic) {
    this.searchResults.set([]);
    if (!topic?.id) return;
    if (!this.topicsToRequest().find(t => t.id === topic.id)) {
      this.topicsToRequest.update(t => [...t, topic]);
    }
  }

  removeTopic(topic: Topic) {
    this.topicsToRequest.update(t => t.filter(x => x.id !== topic.id));
  }

  send() {
    const topics = this.topicsToRequest();
    if (!topics.length) { this.noTopicsSelected.set(true); return; }

    const requests: Record<string, Observable<unknown>> = {};
    topics.forEach(topic => {
      requests[topic.id] = this.requestService.request(this.group.id, topic.id, 'read', this.message() || undefined);
    });

    forkJoin(requests).pipe(take(1)).subscribe({
      next: () => {
        this.notification.success('COMPONENTS.GROUP_REQUEST_ADD_TOPICS_DIALOG.MSG_REQUEST_SENT_SUCCESS');
        this.dialogRef.close(true);
      },
      error: () => this.dialogRef.close(false),
    });
  }
}

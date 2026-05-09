import { Component, OnInit, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { take } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA, DialogCloseDirective } from '../../../../../shared/dialog';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';

export interface ArgumentReactionsData {
  commentId: string;
  topicId: string;
  discussionId: string;
}

@Component({
  selector: 'app-argument-reactions',
  standalone: true,
  imports: [TranslateModule, DialogCloseDirective, InitialsComponent, PaginationComponent],
  templateUrl: './argument-reactions.component.html',
  styleUrls: ['./argument-reactions.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentReactionsComponent implements OnInit {
  private data = inject<ArgumentReactionsData>(DIALOG_DATA);
  private argumentService = inject(TopicArgumentService);

  members = signal<{ id: string; name: string; value: number }[]>([]);
  page = signal(1);
  totalPages = signal(0);
  private itemsPerPage = 10;

  ngOnInit() {
    this.argumentService.votes({
      discussionId: this.data.discussionId,
      commentId: this.data.commentId,
      topicId: this.data.topicId
    }).pipe(take(1)).subscribe(res => {
      const rows = res.rows || res || [];
      this.totalPages.set(Math.ceil(rows.length / this.itemsPerPage) || 1);
      this.page.set(1);
      this.members.set(rows);
    });
  }

  loadPage(pageNr: number) {
    this.page.set(pageNr);
  }

  isOnPage(index: number, page: number): boolean {
    const endIndex = page * this.itemsPerPage;
    return index >= (endIndex - this.itemsPerPage) && index < endIndex;
  }
}

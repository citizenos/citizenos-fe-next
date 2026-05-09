import { Component, inject, OnInit, signal } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { IdeaVoter } from '../../../../../core/interfaces/ideation';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { PaginationComponent } from '../../../../../shared/components/pagination/pagination.component';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';

@Component({
  selector: 'app-idea-reactions',
  standalone: true,
  imports: [
    TranslateModule,
    IconComponent,
    InitialsComponent,
    PaginationComponent
  ],
  templateUrl: './idea-reactions.component.html',
  styleUrls: ['./idea-reactions.component.scss']
})
export class IdeaReactionsComponent implements OnInit {
  public data = inject<{ topicId: string; ideationId: string; ideaId: string }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private ideationService = inject(TopicIdeationService);

  voteItems = signal<IdeaVoter[]>([]);
  page = signal(1);
  totalPages = signal(0);
  itemsPerPage = 10;

  ngOnInit(): void {
    this.loadReactions();
  }

  loadReactions() {
    this.ideationService.getIdeaVotes({
      topicId: this.data.topicId,
      ideationId: this.data.ideationId,
      ideaId: this.data.ideaId,
      limit: this.itemsPerPage,
      offset: (this.page() - 1) * this.itemsPerPage
    }).subscribe((res) => {
      this.voteItems.set(res.rows);
      this.totalPages.set(Math.ceil(res.countTotal / this.itemsPerPage));
    });
  }

  loadPage(pageNr: number) {
    this.page.set(pageNr);
    this.loadReactions();
  }

  close() {
    this.dialogRef.close();
  }
}

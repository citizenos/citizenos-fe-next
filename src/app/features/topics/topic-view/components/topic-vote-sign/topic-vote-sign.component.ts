import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogCloseDirective, DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { TopicVoteService } from '../../../../../core/services/topic-vote.service';
import { TopicVoteSignEsteidComponent } from '../topic-vote-sign-esteid/topic-vote-sign-esteid.component';
import { TopicVoteSignSmartidComponent } from '../topic-vote-sign-smartid/topic-vote-sign-smartid.component';

@Component({
  selector: 'app-topic-vote-sign',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DialogCloseDirective],
  templateUrl: './topic-vote-sign.component.html'
})
export class TopicVoteSignComponent {
  data = inject<{ topic: any; options: any[] }>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private dialogService = inject(DialogService);
  private topicVoteService = inject(TopicVoteService);

  doSignEsteId() {
    this.dialogRef.close();
    this.dialogService.open(TopicVoteSignEsteidComponent, { data: this.data })
      .afterClosed().subscribe(() => this.topicVoteService.reloadVote());
  }

  doSignSmartId() {
    this.dialogRef.close();
    this.dialogService.open(TopicVoteSignSmartidComponent, { data: this.data })
      .afterClosed().subscribe(() => this.topicVoteService.reloadVote());
  }
}

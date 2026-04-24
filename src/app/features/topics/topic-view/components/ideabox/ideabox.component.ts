import { Component, input, output, inject } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { IdeaReactionsComponent } from '../idea-reactions/idea-reactions.component';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';

@Component({
  selector: 'app-ideabox',
  standalone: true,
  imports: [DatePipe, TranslateModule, RouterModule, InitialsComponent, IconComponent],
  templateUrl: './ideabox.component.html',
  styleUrls: ['./ideabox.component.scss'],
})
export class IdeaboxComponent {
  idea = input.required<Idea>();
  topic = input.required<Topic>();
  ideation = input.required<Ideation>();

  ideaDeleted = output<Idea>();
  ideaUpdated = output<Idea>();

  private ideationService = inject(TopicIdeationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  userStore = inject(UserStore);

  IdeaStatus = IdeaStatus;

  isDraft() {
    return this.idea().status === IdeaStatus.draft;
  }

  canEditTopic() {
    return this.topicService.canEdit(this.topic());
  }

  canEditIdea() {
    const user = this.userStore.user();
    return (
      this.idea().author?.id === user?.id &&
      !this.idea().deletedAt &&
      [this.topicService.STATUSES.draft, this.topicService.STATUSES.ideation].includes(this.topic().status)
    );
  }

  canVote() {
    return this.topic().status === this.topicService.STATUSES.ideation;
  }

  vote(value: number) {
    if (!this.userStore.user()) return;
    if (!this.canVote()) return;

    this.ideationService.voteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: this.idea().id,
      value,
    }).pipe(take(1)).subscribe(votes => {
      this.ideaUpdated.emit({ ...this.idea(), votes });
    });
  }

  showReactions() {
    this.dialogService.open(IdeaReactionsComponent, {
      data: {
        ideaId: this.idea().id,
        ideationId: this.ideation().id,
        topicId: this.topic().id
      }
    });
  }

  toggleFavourite() {
    const idea = this.idea();
    const params = { topicId: this.topic().id, ideationId: this.ideation().id, ideaId: idea.id };
    if (idea.favourite) {
      this.ideationService.removeIdeaFromFavourites(params).pipe(take(1)).subscribe(() => {
        this.ideaUpdated.emit({ ...idea, favourite: false });
      });
    } else {
      this.ideationService.addIdeaToFavourites(params).pipe(take(1)).subscribe(() => {
        this.ideaUpdated.emit({ ...idea, favourite: true });
      });
    }
  }

  confirmDelete() {
    const dialog = this.dialogService.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_DELETE_IDEA_TITLE',
        points: ['MODALS.TOPIC_DELETE_IDEA_TXT_ARE_YOU_SURE'],
        confirmBtn: 'MODALS.TOPIC_DELETE_IDEA_BTN_YES',
        closeBtn: 'MODALS.TOPIC_DELETE_IDEA_BTN_NO',
      },
    });
    dialog.afterClosed().subscribe(confirmed => {
      if (confirmed) {
        this.ideationService.deleteIdea({
          topicId: this.topic().id,
          ideationId: this.ideation().id,
          ideaId: this.idea().id,
        }).pipe(take(1)).subscribe(() => {
          this.ideaDeleted.emit(this.idea());
        });
      }
    });
  }
}

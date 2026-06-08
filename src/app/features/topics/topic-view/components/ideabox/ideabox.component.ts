import { Component, input, output, inject, signal, computed, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterModule, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
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
import { Ideation, IdeaComment } from '../../../../../core/interfaces/ideation';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { IdeaReportComponent } from '../idea-report/idea-report.component';
import { AddIdeaFolderComponent } from '../add-idea-folder/add-idea-folder.component';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { IdeaDialogComponent } from '../idea-dialog/idea-dialog.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-ideabox',
  standalone: true,
  imports: [DatePipe, TranslateModule, RouterModule, InitialsComponent, IconComponent, CosDropdownDirective, TooltipComponent],
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
  private router = inject(Router);
  private translate = inject(TranslateService);
  userStore = inject(UserStore);

  IdeaStatus = IdeaStatus;
  showReplies = signal(false);
  showReplyInput = signal(false);
  replies = signal<IdeaComment[]>([]);

  isDraft() {
    return this.idea().status === IdeaStatus.draft;
  }

  isNew = computed(() => {
    const createdAt = new Date(this.idea().createdAt);
    const now = new Date();
    return (now.getTime() - createdAt.getTime()) < 24 * 60 * 60 * 1000;
  });

  isEdited() {
    const edits = this.idea().edits;
    return Array.isArray(edits) && edits.length > 1;
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
    if (!this.userStore.isAuthenticated()) {
        // Show login logic? Or just return?
        return;
    }
    if (!this.canVote()) return;

    this.ideationService.voteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: this.idea().id,
      value,
    }).pipe(take(1)).subscribe(votes => {
      this.ideaUpdated.emit({ ...this.idea(), votes: votes as Idea['votes'] });
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

  doIdeaReport() {
    this.dialogService.open(IdeaReportComponent, {
      data: {
        ideaId: this.idea().id,
        topicId: this.topic().id,
        ideationId: this.ideation().id
      }
    });
  }

  addToFolder() {
    this.dialogService.open(AddIdeaFolderComponent, {
      data: {
        topicId: this.topic().id,
        ideationId: this.ideation().id,
        idea: this.idea()
      }
    });
  }

  editIdea() {
    this.dialogService.open(EditIdeaComponent, {
      data: {
        idea: this.idea(),
        topicId: this.topic().id,
        ideation: this.ideation(),
        topicCountry: this.topic().country
      }
    });
  }

  goToView(showReplies = false) {
    this.dialogService.open(IdeaDialogComponent, {
        data: {
            idea: this.idea(),
            topic: this.topic(),
            ideation: this.ideation(),
            showReplies: showReplies
        }
    });
  }

  toggleReplies() {
    this.showReplies.set(!this.showReplies());
    if (this.showReplies() && !this.replies().length) {
      this.loadReplies();
    }
  }

  loadReplies() {
    this.ideationService.getIdeaComments({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: this.idea().id
    }).subscribe(res => {
      this.replies.set(res.rows);
    });
  }
}

import { Component, inject, signal, computed, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { DatePipe, AsyncPipe } from '@angular/common';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { RouterModule, Router } from '@angular/router';
import { take, Observable, map, of, BehaviorSubject } from 'rxjs';
import { CdkTrapFocus } from '@angular/cdk/a11y';

import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { UserStore } from '../../../../../core/state/user.store';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { Idea, IdeaStatus } from '../../../../../core/interfaces/idea';
import { Topic } from '../../../../../core/interfaces/topic';
import { Ideation, IdeationFolder, IdeaComment } from '../../../../../core/interfaces/ideation';
import { IdeaReplyComponent } from '../idea-reply/idea-reply.component';
import { IdeaReplyFormComponent } from '../idea-reply-form/idea-reply-form.component';
import { IdeaAttachmentService } from '../../../../../core/services/idea-attachment.service';
import { IdeaReportComponent } from '../idea-report/idea-report.component';
import { AddIdeaFolderComponent } from '../add-idea-folder/add-idea-folder.component';
import { EditIdeaComponent } from '../edit-idea/edit-idea.component';
import { IdeaReactionsComponent } from '../idea-reactions/idea-reactions.component';
import { Attachment } from '../../../../../core/interfaces/attachment';

@Component({
  selector: 'app-idea-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe,
    AsyncPipe,
    TranslateModule,
    IconComponent,
    InitialsComponent,
    TooltipComponent,
    DialogCloseDirective,
    CdkTrapFocus,
    CosDropdownDirective,
    IdeaReplyComponent,
    IdeaReplyFormComponent,
    EditIdeaComponent,
    RouterModule,
  ],
  templateUrl: './idea-dialog.component.html',
  styleUrls: ['./idea-dialog.component.scss'],
})
export class IdeaDialogComponent implements OnInit {
  data = inject<{ idea: Idea; topic: Topic; ideation: Ideation; showReplies?: boolean }>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private ideationService = inject(TopicIdeationService);
  private topicService = inject(TopicService);
  private dialogService = inject(DialogService);
  private attachmentService = inject(IdeaAttachmentService);
  private translate = inject(TranslateService);
  private router = inject(Router);
  userStore = inject(UserStore);

  idea = signal<Idea>(this.data.idea);
  topic = signal<Topic>(this.data.topic);
  ideation = signal<Ideation>(this.data.ideation);
  isLoading = signal(false);
  hasError = signal(false);
  showReply = signal(false);
  showReplies = signal(false);
  showEdit = signal(false);

  folders$: Observable<IdeationFolder[]> = of([]);
  images$: Observable<Attachment[]> = of([]);
  replies$: Observable<IdeaComment[]> = of([]);
  replyCount = signal(0);

  private viewedImageIds = signal(new Set<string>());
  private ideas$ = new BehaviorSubject<Idea[]>([]);
  private currentIndex = signal(-1);

  constructor() {
    this.loadIdeaData(this.data.idea);
    this.loadIdeationIdeas();
  }

  ngOnInit() {
    if (this.data.showReplies) {
      this.showReply.set(true);
      this.showReplies.set(true);
    }
  }

  private loadIdeaData(idea: Idea) {
    this.idea.set(idea);
    this.showReplies.set(false);
    this.viewedImageIds.set(new Set());

    this.folders$ = this.ideationService.getIdeaFolders({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: idea.id
    }).pipe(map(res => res.rows));

    this.images$ = this.attachmentService.getItems({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: idea.id,
      limit: 100,
      offset: 0,
      page: 1
    }).pipe(map(res => res.rows.filter(a => a.type === 'image')));

    this.replies$ = this.ideationService.getIdeaComments({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: idea.id
    }).pipe(
      map(res => {
        this.replyCount.set(res.count);
        return this.buildReplyTree(res.rows);
      })
    );
  }

  private loadIdeationIdeas() {
    this.ideationService.getIdeas({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      limit: 1000
    }).pipe(take(1)).subscribe(res => {
      this.ideas$.next(res.rows);
      this.updateCurrentIndex(res.rows);
    });
  }

  private updateCurrentIndex(ideas: Idea[]) {
    const idx = ideas.findIndex(i => i.id === this.idea().id);
    this.currentIndex.set(idx);
  }

  private buildReplyTree(rows: IdeaComment[]): IdeaComment[] {
    const map = new Map<string, IdeaComment>();
    const roots: IdeaComment[] = [];

    rows.forEach(reply => {
      map.set(reply.id, { ...reply, children: [] });
    });

    rows.forEach(reply => {
      const node = map.get(reply.id)!;
      if (reply.parentId && map.has(reply.parentId)) {
        map.get(reply.parentId)!.children!.push(node);
      } else {
        roots.push(node);
      }
    });

    return roots;
  }

  ideaNumber = computed(() => this.currentIndex() + 1);

  isDraft() {
    return this.idea().status === IdeaStatus.draft;
  }

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

  voteIdea(value: number) {
    if (!this.userStore.isAuthenticated()) return;
    if (!this.canVote()) return;

    this.ideationService.voteIdea({
      topicId: this.topic().id,
      ideationId: this.ideation().id,
      ideaId: this.idea().id,
      value
    }).pipe(take(1)).subscribe(() => {
      this.ideationService.getIdea({
        topicId: this.topic().id,
        ideationId: this.ideation().id,
        ideaId: this.idea().id
      }).pipe(take(1)).subscribe(idea => {
        this.idea.set(idea);
      });
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
        this.idea.update(i => ({ ...i, favourite: false }));
      });
    } else {
      this.ideationService.addIdeaToFavourites(params).pipe(take(1)).subscribe(() => {
        this.idea.update(i => ({ ...i, favourite: true }));
      });
    }
  }

  doIdeaReport() {
    this.dialogService.open(IdeaReportComponent, {
      data: {
        idea: this.idea(),
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
    this.showEdit.set(true);
  }

  onIdeaUpdated(idea: Idea) {
    this.showEdit.set(false);
    this.loadIdeaData(idea);
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
          this.dialogRef.close(true);
        });
      }
    });
  }

  isImageViewed(imageId: string) {
    return this.viewedImageIds().has(imageId);
  }

  toggleImageView(imageId: string) {
    const next = new Set(this.viewedImageIds());
    if (next.has(imageId)) {
      next.delete(imageId);
    } else {
      next.add(imageId);
    }
    this.viewedImageIds.set(next);
  }

  loadIdea(next: number) {
    const ideas = this.ideas$.value;
    if (ideas.length === 0) return;

    let index = this.currentIndex();
    index += next;

    if (index < 0) index = ideas.length - 1;
    if (index >= ideas.length) index = 0;

    const newIdea = ideas[index];
    this.loadIdeaData(newIdea);
    this.currentIndex.set(index);
  }

  prevIdea() { this.loadIdea(-1); }
  nextIdea() { this.loadIdea(1); }

  hasMoreIdeas() { return this.ideas$.value.length > 1; }
  hasPrev() { return this.currentIndex() > 0 || this.ideas$.value.length > 1; }
  hasNext() { return this.currentIndex() < this.ideas$.value.length - 1 || this.ideas$.value.length > 1; }

  viewFolder(folder: IdeationFolder) {
    this.dialogRef.close();
    this.router.navigate(['/', this.translate.currentLang, 'topics', this.topic().id], { queryParams: { folderId: folder.id } });
  }

  onReplyAdded() {
    this.loadIdeaData(this.idea());
  }
}

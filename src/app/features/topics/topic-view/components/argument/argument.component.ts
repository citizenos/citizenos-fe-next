import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import {
  Component, input, model, output, signal, inject, ChangeDetectionStrategy,
  ViewChild, ElementRef, forwardRef, computed, PLATFORM_ID
} from '@angular/core';
import { DatePipe, isPlatformBrowser, DOCUMENT } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';
import { timer, take } from 'rxjs';
import { Router } from '@angular/router';
import { TranslateService } from '@ngx-translate/core';
import { Argument } from '../../../../../core/interfaces/discussion';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { UserStore } from '../../../../../core/state/user.store';
import { NotificationService } from '../../../../../core/services/notification.service';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { ConfirmDialogComponent } from '../../../../../shared/components/confirm-dialog/confirm-dialog.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';
import { TooltipComponent } from '../../../../../shared/components/tooltip/tooltip.component';
import { ArgumentReportComponent } from '../argument-report/argument-report.component';
import { ArgumentDeletedComponent } from '../argument-deleted/argument-deleted.component';
import { ArgumentReplyComponent } from '../argument-reply/argument-reply.component';
import { ArgumentEditsComponent } from '../argument-edits/argument-edits.component';
import { EditArgumentComponent } from '../edit-argument/edit-argument.component';
import { ArgumentReactionsComponent } from '../argument-reactions/argument-reactions.component';
import { MarkdownPipe } from '../../../../../shared/pipes/markdown.pipe';

@Component({
  selector: 'cos-argument',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [
    DatePipe, FormsModule, TranslateModule,
    InitialsComponent, CosDropdownDirective,
    TooltipComponent, ArgumentDeletedComponent,
    ArgumentReplyComponent, ArgumentEditsComponent, EditArgumentComponent,
    MarkdownPipe,
    forwardRef(() => ArgumentComponent), IconComponent,],
  templateUrl: './argument.component.html',
  styleUrls: ['./argument.component.scss']
})
export class ArgumentComponent {
  argument = input.required<Argument>();
  topicId = input.required<string>();
  discussionId = input.required<string>();
  root = input<Argument | null>(null);
  deleted = output<void>();

  @ViewChild('argumentBody') argumentBody?: ElementRef;

  private argumentService = inject(TopicArgumentService);
  private notification = inject(NotificationService);
  private dialog = inject(DialogService);
  private sanitizer = inject(DomSanitizer);
  private router = inject(Router);
  private platformId = inject(PLATFORM_ID);
  private doc = inject(DOCUMENT);
  private translate = inject(TranslateService);
  userStore = inject(UserStore);

  showEdit = signal(false);
  showReplies = model(false);
  showReplyForm = signal(false);
  showDeletedArgument = signal(false);
  showEdits = signal(false);
  mobileActions = signal(false);

  localVotes = signal<Argument['votes'] | undefined>(undefined);

  votes = computed(() => {
    return this.localVotes() || this.argument().votes;
  });

  argumentId() {
    const arg = this.argument();
    const version = Math.max(0, (Object.keys(arg.edits || {}).length || 1) - 1);
    return arg.id + '_v' + version;
  }

  isEdited() {
    return (Object.keys(this.argument().edits || {}).length || 0) > 1;
  }

  canEdit() {
    return this.argument().creator?.id === this.userStore.user()?.id && !this.argument().deletedAt;
  }

  safe(html: string): SafeHtml {
    return this.sanitizer.bypassSecurityTrustHtml(html || '');
  }

  vote(value: number) {
    if (!this.userStore.isAuthenticated()) return;
    this.argumentService.vote({
      commentId: this.argument().id,
      topicId: this.topicId(),
      discussionId: this.discussionId(),
      value,
    }).pipe(take(1)).subscribe(votes => {
      this.localVotes.set(votes);
    });
  }

  async copyLink(_event: MouseEvent) {
    if (!isPlatformBrowser(this.platformId)) return;
    const id = this.argumentId();
    const url = `${window.location.origin}${window.location.pathname}?argumentId=${id}`;
    
    try {
      await navigator.clipboard.writeText(url);
      this.notification.success('VIEWS.TOPICS_TOPICID.ARGUMENT_LNK_COPIED');
    } catch (err) {
      console.error('Failed to copy: ', err);
    }
  }

  showVoters() {
    this.dialog.open(ArgumentReactionsComponent, {
      data: {
        commentId: this.argument().id,
        topicId: this.topicId(),
        discussionId: this.discussionId(),
      }
    });
  }

  doReport() {
    this.dialog.open(ArgumentReportComponent, {
      data: { argument: this.argument(), topicId: this.topicId() }
    });
  }

  doDelete() {
    this.dialog.open(ConfirmDialogComponent, {
      data: {
        level: 'delete',
        heading: 'MODALS.TOPIC_DELETE_ARGUMENT_TITLE',
        points: ['MODALS.TOPIC_DELETE_ARGUMENT_TXT_ARE_YOU_SURE'],
        confirmBtn: 'MODALS.TOPIC_DELETE_ARGUMENT_BTN_YES',
        closeBtn: 'MODALS.TOPIC_DELETE_ARGUMENT_BTN_NO',
      }
    }).afterClosed().pipe(take(1)).subscribe(confirmed => {
      if (!confirmed) return;
      this.argumentService.delete({
        topicId: this.topicId(),
        discussionId: this.discussionId(),
        commentId: this.argument().id,
      }).pipe(take(1)).subscribe(() => this.deleted.emit());
    });
  }

  handleShowReply() {
    if (!this.userStore.isAuthenticated()) {
      if (isPlatformBrowser(this.platformId)) {
        this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams: { redirectSuccess: window.location.href } });
      }
      return;
    }
    this.showReplyForm.update(v => !v);
  }

  getParentAuthor() {
    const arg = this.argument();
    if (arg.parent?.id === this.root()?.id) {
      return this.root()?.creator?.name || '';
    }

    const parentReply = this.root()?.replies?.rows.find((a: Argument) => a.id === arg.parent?.id);
    if (parentReply) {
      return parentReply.creator?.name || '';
    }
    return '';
  }

  goToParentArgument() {
    const arg = this.argument();
    if (!arg.parent?.id) return;

    const argumentIdWithVersion = arg.parent.id + '_v' + arg.parent.version;
    if (isPlatformBrowser(this.platformId)) {
      const commentElement = this.doc.getElementById(argumentIdWithVersion);
      if (commentElement) {
        this.scrollTo(commentElement as HTMLElement);
      }
    }
  }

  private scrollTo(argumentEl: HTMLElement) {
    const bodyEl = argumentEl.querySelector('.argument_body');
    if (bodyEl) {
      bodyEl.scrollIntoView({ behavior: 'smooth', block: 'center', inline: 'center' });
    }
    argumentEl.classList.add('highlight');
    timer(2000).pipe(take(1)).subscribe(() => {
      argumentEl.classList.remove('highlight');
    });
  }
}

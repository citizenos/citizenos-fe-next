import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { NgClass } from '@angular/common';
import { take, combineLatest, switchMap } from 'rxjs';

import { IdeaComment, IdeaReport } from '../../../../../core/interfaces/ideation';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../../shared/dialog/dialog.service';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

export interface IdeaReplyReportModerateData {
  argument: IdeaComment;
  report: IdeaReport;
  topicId: string;
  ideationId: string;
  ideaId: string;
  commentId: string;
  reportId: string;
  token: string;
}

@Component({
  selector: 'app-idea-reply-report-moderate',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, ReactiveFormsModule, NgClass, DialogCloseDirective, CosDropdownDirective, IconComponent],
  templateUrl: './idea-reply-report-moderate.component.html',
  styleUrl: './idea-reply-report-moderate.component.scss'
})
export class IdeaReplyReportModerateComponent {
  private data = inject<IdeaReplyReportModerateData>(DIALOG_DATA);
  protected dialogRef = inject(DialogRef);
  private ideationService = inject(TopicIdeationService);

  argument = this.data.argument || this.data.report?.comment;
  topicId = this.data.topicId;
  ideationId = this.data.ideationId;
  ideaId = this.data.ideaId;
  commentId = this.data.commentId;
  reportId = this.data.report?.id ?? this.data.reportId;
  token = this.data.token;

  reportTypes = Object.keys(this.ideationService.COMMENT_REPORT_TYPES);

  report = new FormGroup({
    type: new FormControl(this.reportTypes[0], Validators.required),
    text: new FormControl('', Validators.required)
  });

  constructor() {
    if (this.data.report) {
      this.report.patchValue(this.data.report);
    }
  }

  selectReportType(type: string) {
    this.report.controls['type'].setValue(type);
  }

  doModerate() {
    if (this.report.invalid) return;

    this.ideationService.moderateIdeaComment({
      token: this.token,
      topicId: this.topicId,
      ideationId: this.ideationId,
      ideaId: this.ideaId,
      commentId: this.argument?.id ?? this.commentId,
      reportId: this.reportId,
      report: this.report.value as { type: string; text: string }
    }).pipe(take(1)).subscribe({
      next: () => this.dialogRef.close(true),
      error: () => this.dialogRef.close()
    });
  }
}

@Component({
  selector: 'app-idea-reply-report-moderate-dialog',
  standalone: true,
  template: ''
})
export class IdeaReplyReportModerateDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private ideationService = inject(TopicIdeationService);

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      switchMap(([params, queryParams]) =>
        this.ideationService.getIdeaCommentReport({
          topicId: params['topicId'],
          ideationId: params['ideationId'],
          ideaId: params['ideaId'],
          commentId: params['commentId'],
          reportId: params['reportId'],
          token: queryParams['token']
        }).pipe(
          take(1),
          switchMap(report => {
            const dialogRef = this.dialog.open(IdeaReplyReportModerateComponent, {
              data: {
                report,
                topicId: params['topicId'],
                ideationId: params['ideationId'],
                ideaId: params['ideaId'],
                commentId: params['commentId'],
                reportId: params['reportId'],
                token: queryParams['token']
              }
            });
            return dialogRef.afterClosed().pipe(
              take(1),
              switchMap(() => {
                const lang = this.router.url.split('/')[1] || 'en';
                return this.router.navigate([lang, 'topics', params['topicId']]);
              })
            );
          })
        )
      )
    ).subscribe();
  }
}

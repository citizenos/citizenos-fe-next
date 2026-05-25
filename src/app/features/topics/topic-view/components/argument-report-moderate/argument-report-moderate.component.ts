import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take, combineLatest, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { Argument, ArgumentReport } from '../../../../../core/interfaces/discussion';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { DIALOG_DATA, DialogCloseDirective, DialogService } from '../../../../../shared/dialog';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

interface ArgumentReportModerateData {
  argument?: Argument;
  report: ArgumentReport;
  topicId: string;
  discussionId: string;
  commentId: string;
  token: string;
}

@Component({
  selector: 'app-argument-report-moderate',
  standalone: true,
  imports: [UpperCasePipe, ReactiveFormsModule, TranslateModule, DialogCloseDirective, InputComponent, CosDropdownDirective],
  templateUrl: './argument-report-moderate.component.html',
  styleUrls: ['./argument-report-moderate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ArgumentReportModerateComponent {
  private data = inject<ArgumentReportModerateData>(DIALOG_DATA);
  private argumentService = inject(TopicArgumentService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  argument = this.data.argument || this.data.report?.comment;
  topicId = this.data.topicId;
  discussionId = this.data.discussionId;
  commentId = this.data.commentId;
  reportId = this.data.report?.id;
  token = this.data.token;

  reportTypes = Object.keys(this.argumentService.ARGUMENT_REPORT_TYPES);

  report = this.fb.group({
    type: [this.reportTypes[0], Validators.required],
    text: ['', Validators.required]
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

    const data = {
      token: this.token,
      topicId: this.topicId,
      discussionId: this.discussionId,
      commentId: this.argument?.id || this.commentId,
      reportId: this.reportId || '',
      report: this.report.value as { type: string; text: string }
    };

    this.argumentService.moderate(data).pipe(take(1)).subscribe({
      next: () => this.dialog.closeAll(),
      error: () => this.dialog.closeAll()
    });
  }
}

@Component({
  selector: 'app-argument-report-moderate-dialog',
  standalone: true,
  template: ''
})
export class ArgumentReportModerateDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private argumentService = inject(TopicArgumentService);

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      take(1),
      switchMap(([params, queryParams]) => {
        const topicId = params['topicId'];
        const commentId = params['commentId'];
        const discussionId = params['discussionId'] || topicId;
        const token = queryParams['token'];
        const reportId = params['reportId'];

        return this.argumentService.getReport({
          topicId,
          commentId,
          reportId,
          token
        }).pipe(
          take(1),
          switchMap((report) => {
            const dialogRef = this.dialog.open(ArgumentReportModerateComponent, {
              data: {
                report,
                topicId,
                discussionId,
                commentId,
                token
              }
            });
            return dialogRef.afterClosed().pipe(
              take(1),
              switchMap(() => {
                const lang = this.router.url.split('/')[1] || 'en';
                return this.router.navigate([lang, 'topics', topicId]);
              })
            );
          })
        );
      })
    ).subscribe();
  }
}


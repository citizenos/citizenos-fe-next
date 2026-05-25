import { Component, inject, ChangeDetectionStrategy, OnInit } from '@angular/core';
import { UpperCasePipe } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take, combineLatest, switchMap } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { IdeaReport } from '../../../../../core/interfaces/ideation';
import { Idea } from '../../../../../core/interfaces/idea';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { DIALOG_DATA, DialogCloseDirective, DialogService } from '../../../../../shared/dialog';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { CosDropdownDirective } from '../../../../../shared/directives/cos-dropdown.directive';

interface IdeaReportModerateData {
  idea?: Idea;
  report: IdeaReport;
  topicId: string;
  ideationId: string;
  ideaId: string;
  token: string;
}

@Component({
  selector: 'app-idea-report-moderate',
  standalone: true,
  imports: [UpperCasePipe, ReactiveFormsModule, TranslateModule, DialogCloseDirective, InputComponent, CosDropdownDirective],
  templateUrl: './idea-report-moderate.component.html',
  styleUrls: ['./idea-report-moderate.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReportModerateComponent {
  private data = inject<IdeaReportModerateData>(DIALOG_DATA);
  private ideationService = inject(TopicIdeationService);
  private dialog = inject(DialogService);
  private fb = inject(FormBuilder);

  idea = this.data.idea || this.data.report?.idea;
  topicId = this.data.topicId;
  ideationId = this.data.ideationId;
  ideaId = this.data.ideaId;
  reportId = this.data.report?.id;
  token = this.data.token;

  reportTypes = Object.keys(this.ideationService.IDEA_REPORT_TYPES);

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

    this.ideationService.moderateIdea({
      token: this.token,
      topicId: this.topicId,
      ideationId: this.ideationId,
      ideaId: (this.idea?.id || this.ideaId) as string,
      reportId: this.reportId as string,
      report: this.report.value as { type: string; text: string }
    }).pipe(take(1)).subscribe({
      next: () => this.dialog.closeAll(),
      error: () => this.dialog.closeAll()
    });
  }
}

@Component({
  selector: 'app-idea-report-moderate-dialog',
  standalone: true,
  template: ''
})
export class IdeaReportModerateDialogComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private dialog = inject(DialogService);
  private ideationService = inject(TopicIdeationService);

  ngOnInit() {
    combineLatest([this.route.params, this.route.queryParams]).pipe(
      take(1),
      switchMap(([params, queryParams]) => {
        const topicId = params['topicId'];
        const ideationId = params['ideationId'];
        const ideaId = params['ideaId'];
        const token = queryParams['token'];
        const reportId = params['reportId'];

        return this.ideationService.getIdeaReport({
          topicId,
          ideationId,
          ideaId,
          reportId,
          token
        }).pipe(
          take(1),
          switchMap((report) => {
            const dialogRef = this.dialog.open(IdeaReportModerateComponent, {
              data: {
                report,
                topicId,
                ideationId,
                ideaId,
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


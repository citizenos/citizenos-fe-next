import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

export interface IdeaReplyReportData {
  argument: any;
  topicId: string;
  ideaId: string;
  ideationId: string;
}

@Component({
  selector: 'idea-reply-report',
  standalone: true,
  imports: [
    CommonModule,
    TranslateModule,
    ReactiveFormsModule,
    IconComponent,
    InitialsComponent,
    InputComponent,
    DropdownComponent
  ],
  template: `
    <div class="dialog_report">
      <div class="dialog_header">
        <div class="header_title">
          <h2 [innerHTML]="'COMPONENTS.IDEA_REPORT.HEADING_REPORT_IDEA' | translate"></h2>
        </div>
        <div class="header_close" cosDialogClose>
          <cos-icon name="close"></cos-icon>
        </div>
      </div>

      <div class="dialog_content">
        <div class="report_argument">
          <div class="argument_header">
            <cos-initials [name]="data.argument.creator?.name || data.argument.author?.name"></cos-initials>
            <div class="author_info">
              <span class="name">{{ data.argument.creator?.name || data.argument.author?.name }}</span>
            </div>
          </div>
          <div class="argument_body" [innerHTML]="data.argument.text"></div>
        </div>

        <form [formGroup]="report" (ngSubmit)="doReport()">
          <div class="form_group">
            <label [innerHTML]="'COMPONENTS.IDEA_REPORT.LABEL_REPORT_TYPE' | translate"></label>
            <cos-dropdown>
              <div selection>
                {{ 'COMPONENTS.IDEA_REPORT.REPORT_TYPE_' + report.get('type')?.value?.toUpperCase() | translate }}
              </div>
              <div options>
                @for (type of reportTypes; track type) {
                  <div class="option" (click)="selectReportType(type)">
                    {{ 'COMPONENTS.IDEA_REPORT.REPORT_TYPE_' + type.toUpperCase() | translate }}
                  </div>
                }
              </div>
            </cos-dropdown>
          </div>

          <div class="form_group">
            <label [innerHTML]="'COMPONENTS.IDEA_REPORT.LABEL_REPORT_TEXT' | translate"></label>
            <cos-input
              [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate"
              [hasError]="!!(report.get('text')?.touched && report.get('text')?.invalid)"
              [errorMessage]="'COMPONENTS.IDEA_REPORT.ERROR_TEXT' | translate"
            >
              <textarea formControlName="text" [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate" [maxlength]="2048" rows="5"></textarea>
            </cos-input>
            @if (errors()?.text) {
              <div class="error">{{ errors().text | translate }}</div>
            }
          </div>

          <div class="dialog_footer">
            <button type="button" class="btn_secondary" cosDialogClose [innerHTML]="'COMPONENTS.IDEA_REPORT.BTN_CANCEL' | translate"></button>
            <button type="submit" class="btn_primary" [disabled]="report.invalid" [innerHTML]="'COMPONENTS.IDEA_REPORT.BTN_REPORT' | translate"></button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .dialog_report {
      padding: 32px;
      max-width: 600px;
      background: white;
      border-radius: 8px;
    }
    .dialog_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 24px;
    }
    .header_title h2 {
      margin: 0;
      font-size: 24px;
      color: #374151;
    }
    .header_close {
      cursor: pointer;
      color: #9CA3AF;
    }
    .report_argument {
      background: #F9FAFB;
      padding: 16px;
      border-radius: 8px;
      margin-bottom: 24px;
    }
    .argument_header {
      display: flex;
      align-items: center;
      gap: 12px;
      margin-bottom: 12px;
    }
    .author_info .name {
      font-weight: 600;
      color: #111827;
    }
    .argument_body {
      color: #4B5563;
      line-height: 1.5;
    }
    .form_group {
      margin-bottom: 20px;
    }
    .form_group label {
      display: block;
      margin-bottom: 8px;
      font-weight: 500;
      color: #374151;
    }
    .dialog_footer {
      display: flex;
      justify-content: flex-end;
      gap: 12px;
      margin-top: 32px;
    }
    .btn_primary {
      background: #3B82F6;
      color: white;
      border: none;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .btn_primary:disabled {
      background: #93C5FD;
      cursor: not-allowed;
    }
    .btn_secondary {
      background: white;
      color: #374151;
      border: 1px solid #D1D5DB;
      padding: 10px 24px;
      border-radius: 6px;
      font-weight: 500;
      cursor: pointer;
    }
    .error {
      color: #EF4444;
      font-size: 14px;
      margin-top: 4px;
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyReportComponent {
  public data = inject<IdeaReplyReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private TopicIdeationService = inject(TopicIdeationService);

  reportTypes = Object.keys(this.TopicIdeationService.COMMENT_REPORT_TYPES);
  errors = signal<any>(null);

  report = new FormGroup({
    type: new FormControl(this.reportTypes[0], Validators.required),
    text: new FormControl('', Validators.required),
    topicId: new FormControl(this.data.topicId),
    ideaId: new FormControl(this.data.ideaId),
    ideationId: new FormControl(this.data.ideationId),
    commentId: new FormControl(this.data.argument.id)
  });

  selectReportType(type: string) {
    this.report.get('type')?.setValue(type);
  }

  doReport() {
    if (this.report.invalid) return;

    this.TopicIdeationService.reportIdeaComment(this.report.value as any).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (res) => {
        this.errors.set(res.errors);
      },
    });
  }
}

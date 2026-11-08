import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { Idea } from '../../../../../core/interfaces/idea';

export interface IdeaReportData {
  idea?: Idea;
  ideaId?: string;
  ideationId: string;
  topicId: string;
}

@Component({
  selector: 'app-idea-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    IconComponent,
    InitialsComponent,
    InputComponent,
    DropdownComponent,
    DialogCloseDirective,
  ],
  template: `
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header warning">
          <div class="header_with_icon">
            <div class="icon_notification">
              <cos-icon name="warning-filled" [size]="40"></cos-icon>
            </div>
            <h4 class="title">{{ 'COMPONENTS.IDEA_REPORT.HEADING' | translate }}</h4>
          </div>
          <div class="dialog_close">
            <button type="button" class="btn_dialog_close icon" dialogClose [aria-label]="'BTN_CLOSE' | translate">
              <cos-icon name="nav-close"></cos-icon>
            </button>
          </div>
        </div>
        <div class="dialog_content">
          <div class="dialog_info_wrap">
            <div class="dialog_info row">
              <div class="delete_info_button_wrap">
                <div class="delete_info_text">{{ 'COMPONENTS.IDEA_REPORT.MESSAGE_MAIN' | translate }}</div>
              </div>
              <div class="profile_image_wrap">
                @if (data.idea?.author?.imageUrl) {
                  <img class="profile_image" [src]="data.idea!.author!.imageUrl" alt="" />
                } @else {
                  <div class="profile_image_filler">
                    <cos-initials [name]="data.idea?.author?.name || ''"></cos-initials>
                  </div>
                }
              </div>
              <div class="bold" [innerHTML]="data.idea?.author?.name || ''"></div>
            </div>
          </div>

          <form [formGroup]="report">
            <cos-dropdown [placeholder]="'COMPONENTS.IDEA_REPORT.LABLE_REASON' | translate">
              <div id="report_reason" selection class="selected_item">{{ 'TXT_REPORT_TYPES_' + report.get('type')?.value?.toUpperCase() | translate }}</div>
              <div id="report_reason_options" options role="listbox">
                @for (type of reportTypes; track type) {
                  <div class="option" (click)="selectReportType(type)" (keydown.enter)="selectReportType(type)" role="option" tabindex="0" [attr.aria-selected]="report.get('type')?.value === type">
                    {{ 'TXT_REPORT_TYPES_' + type.toUpperCase() | translate }}
                  </div>
                }
              </div>
            </cos-dropdown>

            <cos-input
              [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate"
              [hasError]="!!(report.get('text')?.touched && report.get('text')?.invalid)"
              [errorMessage]="'COMPONENTS.IDEA_REPORT.ERROR_TEXT' | translate"
            >
              <textarea id="report_text" formControlName="text" [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate" [maxlength]="2048" rows="5"></textarea>
            </cos-input>
          </form>
        </div>
        <div class="dialog_content no_footer">
          <div class="button_wrap">
            <button type="button" class="btn_big_submit" [class.disabled]="report.invalid" [disabled]="report.invalid" (click)="doReport()">
              {{ 'COMPONENTS.IDEA_REPORT.BTN_SUBMIT' | translate }}
            </button>
            <a dialogClose tabindex="0" role="button">{{ 'COMPONENTS.IDEA_REPORT.BTN_CANCEL' | translate }}</a>
          </div>
        </div>
        <div class="dialog_footer"></div>
      </div>
    </div>
  `,
  styleUrls: ['./idea-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReportComponent {
  public data = inject<IdeaReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private TopicIdeationService = inject(TopicIdeationService);
  private notificationService = inject(NotificationService);

  reportTypes = Object.keys(this.TopicIdeationService.IDEA_REPORT_TYPES);
  errors = signal<Record<string, string[]> | null>(null);

  report = new FormGroup({
    type: new FormControl(this.reportTypes[0], Validators.required),
    text: new FormControl('', Validators.required),
    topicId: new FormControl(this.data.topicId),
    ideaId: new FormControl(this.data.idea?.id || this.data.ideaId || ''),
    ideationId: new FormControl(this.data.ideationId),
  });

  selectReportType(type: string) {
    this.report.get('type')?.setValue(type);
  }

  doReport() {
    if (this.report.invalid) return;

    this.TopicIdeationService.reportIdea({
      type: this.report.value.type!,
      text: this.report.value.text ?? undefined,
      topicId: this.data.topicId,
      ideaId: (this.data.idea?.id || this.data.ideaId)!,
      ideationId: this.data.ideationId
    }).subscribe({
      next: () => {
        this.notificationService.success('COMPONENTS.ARGUMENT_REPORT.MSG_REPORT_SENT');
        this.dialogRef.close(true);
      },
      error: (res) => {
        this.errors.set(res?.errors || null);
        this.notificationService.error('MSG_ERROR_REPORT_SEND_FAILED');
      },
    });
  }
}

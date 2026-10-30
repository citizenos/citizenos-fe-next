import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { Idea } from '../../../../../core/interfaces/idea';

export interface IdeaReportData {
  idea: Idea;
  ideationId: string;
  topicId: string;
}

@Component({
  selector: 'app-idea-report',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
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
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" class="icon-bg" />
                <path
                  d="M19.0645 8C18.4876 8 18.0304 8.48668 18.0664 9.06238L18.9414 23.0624C18.9743 23.5894 19.4114 24 19.9395 24H20.0605C20.5886 24 21.0257 23.5894 21.0586 23.0624L21.9336 9.06238C21.9696 8.48668 21.5124 8 20.9355 8H19.0645Z"
                  class="icon-fill"
                />
                <path
                  d="M20 31C21.1046 31 22 30.1046 22 29C22 27.8954 21.1046 27 20 27C18.8954 27 18 27.8954 18 29C18 30.1046 18.8954 31 20 31Z"
                  class="icon-fill"
                />
              </svg>
            </div>
            <h4 class="title">{{ 'COMPONENTS.IDEA_REPORT.HEADING' | translate }}</h4>
          </div>
          <div class="dialog_close">
            <button type="button" class="btn_dialog_close icon" dialogClose [aria-label]="'BTN_CLOSE' | translate">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z"
                  class="icon-path" />
              </svg>
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
                @if (data.idea.author?.imageUrl) {
                  <img class="profile_image" [src]="data.idea.author.imageUrl" alt="" />
                } @else {
                  <div class="profile_image_filler">
                    <cos-initials [name]="data.idea.author?.name || ''"></cos-initials>
                  </div>
                }
              </div>
              <div class="bold" [innerHTML]="data.idea.author?.name || ''"></div>
            </div>
          </div>

          <form [formGroup]="report">
            <cos-input [placeholder]="'COMPONENTS.IDEA_REPORT.LABLE_REASON' | translate">
              <cos-dropdown selection>
                <div selection class="selected_item">{{ 'TXT_REPORT_TYPES_' + report.get('type')?.value?.toUpperCase() | translate }}</div>
                <div options>
                  @for (type of reportTypes; track type) {
                    <div class="option" (click)="selectReportType(type)" (keydown.enter)="selectReportType(type)" role="option" tabindex="0" [attr.aria-selected]="report.get('type')?.value === type">
                      {{ 'TXT_REPORT_TYPES_' + type.toUpperCase() | translate }}
                    </div>
                  }
                </div>
              </cos-dropdown>
            </cos-input>

            <cos-input
              [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate"
              [hasError]="!!(report.get('text')?.touched && report.get('text')?.invalid)"
              [errorMessage]="'COMPONENTS.IDEA_REPORT.ERROR_TEXT' | translate"
            >
              <textarea formControlName="text" [placeholder]="'COMPONENTS.IDEA_REPORT.PLACEHOLDER_REPORT_TEXT' | translate" [maxlength]="2048" rows="5"></textarea>
            </cos-input>
          </form>
        </div>
        <div class="dialog_content no_footer">
          <div class="button_wrap">
            <button type="button" class="btn_big_submit" [class.disabled]="report.invalid" (click)="doReport()">
              {{ 'COMPONENTS.IDEA_REPORT.BTN_SUBMIT' | translate }}
            </button>
            <button type="button" class="btn_link" dialogClose>{{ 'COMPONENTS.IDEA_REPORT.BTN_CANCEL' | translate }}</button>
          </div>
        </div>
        <div class="dialog_footer"></div>
      </div>
    </div>
  `,
  styleUrls: ['./idea-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IdeaReportComponent {
  public data = inject<IdeaReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private TopicIdeationService = inject(TopicIdeationService);

  reportTypes = Object.keys(this.TopicIdeationService.IDEA_REPORT_TYPES);
  errors = signal<Record<string, string[]> | null>(null);

  report = new FormGroup({
    type: new FormControl(this.reportTypes[0], Validators.required),
    text: new FormControl('', Validators.required),
    topicId: new FormControl(this.data.topicId),
    ideaId: new FormControl(this.data.idea.id),
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
      ideaId: this.data.idea.id,
      ideationId: this.data.ideationId
    }).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (res) => {
        this.errors.set(res.errors);
      },
    });
  }
}

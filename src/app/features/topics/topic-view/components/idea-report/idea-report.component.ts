import { ChangeDetectionStrategy, Component, inject, signal, ViewEncapsulation } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef, DialogCloseDirective } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
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
              <svg width="40" height="40" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect width="40" height="40" rx="20" fill="#F39129" />
                <path
                  d="M19.0645 8C18.4876 8 18.0304 8.48668 18.0664 9.06238L18.9414 23.0624C18.9743 23.5894 19.4114 24 19.9395 24H20.0605C20.5886 24 21.0257 23.5894 21.0586 23.0624L21.9336 9.06238C21.9696 8.48668 21.5124 8 20.9355 8H19.0645Z"
                  fill="white"
                />
                <path
                  d="M20 31C21.1046 31 22 30.1046 22 29C22 27.8954 21.1046 27 20 27C18.8954 27 18 27.8954 18 29C18 30.1046 18.8954 31 20 31Z"
                  fill="white"
                />
              </svg>
            </div>
            <h4 class="title" [translate]="'COMPONENTS.IDEA_REPORT.HEADING'"></h4>
          </div>
          <div class="dialog_close">
            <a class="btn_dialog_close icon" dialogClose>
              <cos-icon name="nav-close"></cos-icon>
            </a>
          </div>
        </div>
        <div class="dialog_content">
          <div class="dialog_info_wrap">
            <div class="dialog_info row">
              <div class="delete_info_button_wrap">
                <div class="delete_info_text" [translate]="'COMPONENTS.IDEA_REPORT.MESSAGE_MAIN'"></div>
              </div>
              <div class="profile_image_wrap">
                @if (data.idea.author?.imageUrl) {
                  <img class="profile_image" [src]="data.idea.author?.imageUrl" />
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
                <div selection class="selected_item" [translate]="'TXT_REPORT_TYPES_' + report.get('type')?.value?.toUpperCase()"></div>
                <div options>
                  @for (type of reportTypes; track type) {
                    <div class="option" (click)="selectReportType(type)" [translate]="'TXT_REPORT_TYPES_' + type.toUpperCase()"></div>
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
            <button class="btn_big_submit" [class.disabled]="report.invalid" [translate]="'COMPONENTS.IDEA_REPORT.BTN_SUBMIT'" (click)="doReport()"></button>
            <a dialogClose [translate]="'COMPONENTS.IDEA_REPORT.BTN_CANCEL'"></a>
          </div>
        </div>
        <div class="dialog_footer"></div>
      </div>
    </div>
  `,
  styles: [`
    .dialog_wrap {
      max-width: 600px;
      width: 100%;
      background: white;
      border-radius: 4px;
      overflow: hidden;
    }

    .dialog_header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 16px 24px;
      background: #fdf2f2;
      border-bottom: 1px solid #f9dcdc;

      &.warning {
        background: #fff9f2;
        border-bottom: 1px solid #ffe8cc;
      }

      .header_with_icon {
        display: flex;
        align-items: center;
        gap: 16px;

        .icon_notification {
          flex-shrink: 0;
        }

        .title {
          margin: 0;
          font-size: 18px;
          font-weight: 700;
          color: #2c3b47;
        }
      }

      .dialog_close {
        cursor: pointer;
        color: #727c84;
        display: flex;

        &:hover {
          color: #2c3b47;
        }
      }
    }

    .dialog_content {
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 16px;

      .dialog_info_wrap {
        margin-bottom: 16px;

        .dialog_info {
          display: flex;
          align-items: center;
          gap: 12px;

          .delete_info_text {
            font-size: 14px;
            color: #727c84;
          }

          .profile_image_wrap {
            .profile_image {
              width: 32px;
              height: 32px;
              border-radius: 50%;
            }

            .profile_image_filler {
              cos-initials {
                width: 32px;
                height: 32px;
                font-size: 12px;
              }
            }
          }

          .bold {
            font-weight: 700;
            color: #2c3b47;
          }
        }
      }

      form {
        display: flex;
        flex-direction: column;
        gap: 16px;
      }

      &.no_footer {
        padding-top: 0;
      }

      .button_wrap {
        display: flex;
        justify-content: flex-end;
        align-items: center;
        gap: 24px;

        .btn_big_submit {
          background: #ef4025;
          color: white;
          border: none;
          padding: 12px 32px;
          border-radius: 4px;
          font-weight: 700;
          cursor: pointer;

          &:hover:not(.disabled) {
            background: #d33019;
          }

          &.disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }
        }

        a {
          cursor: pointer;
          color: #1168a8;
          font-weight: 600;
          text-decoration: underline;

          &:hover {
            text-decoration: none;
          }
        }
      }
    }

    .selected_item {
      font-size: 14px;
      color: #2c3b47;
    }

    .option {
      padding: 12px 16px;
      cursor: pointer;
      font-size: 14px;
      &:hover {
        background: #f4f6f8;
      }
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None
})
export class IdeaReportComponent {
  public data = inject<IdeaReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private TopicIdeationService = inject(TopicIdeationService);

  reportTypes = Object.keys(this.TopicIdeationService.IDEA_REPORT_TYPES);
  errors = signal<any>(null);

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

    this.TopicIdeationService.reportIdea(this.report.value as any).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (res) => {
        this.errors.set(res.errors);
      },
    });
  }
}

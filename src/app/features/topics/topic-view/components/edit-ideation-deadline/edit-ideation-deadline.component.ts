import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA, DialogRef } from '../../../../../shared/dialog';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { TopicService } from '../../../../../core/services/topic.service';
import { DeadlinePickerComponent } from '../../../../../shared/components/deadline-picker/deadline-picker.component';
import { Ideation } from '../../../../../core/interfaces/ideation';
import { Topic } from '../../../../../core/interfaces/topic';
import { take } from 'rxjs';

interface EditIdeationDeadlineDialogData {
  ideation: Ideation;
  topic: Topic;
}

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-edit-ideation-deadline',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    TranslateModule,
    DeadlinePickerComponent
  ],
  template: `
    <div class="overlay" (click)="dialogRef.close()" (keydown.enter)="dialogRef.close()" tabindex="0" role="button"></div>
    <div class="dialog_wrap">
      <div class="dialog">
        <div class="dialog_header ideation">
          <div class="header_text">
            <h1 class="title">{{ (dialogData.ideation.deadline ? 'COMPONENTS.TOPIC_IDEATION.OPT_EDIT_DEADLINE' : 'COMPONENTS.TOPIC_IDEATION.OPT_ADD_DEADLINE') | translate }}</h1>
            <div class="dialog_close">
              <button type="button" class="btn_dialog_close icon" (click)="dialogRef.close()" [aria-label]="'CONTROL.CLOSE' | translate">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path
                    d="M7.72152 6.29537C7.3277 5.90154 6.68919 5.90154 6.29537 6.29537C5.90154 6.68919 5.90154 7.3277 6.29537 7.72153L10.5738 12L6.29541 16.2785C5.90159 16.6723 5.90159 17.3108 6.29541 17.7046C6.68923 18.0985 7.32774 18.0985 7.72156 17.7046L12 13.4262L16.2784 17.7046C16.6723 18.0985 17.3108 18.0985 17.7046 17.7046C18.0984 17.3108 18.0984 16.6723 17.7046 16.2785L13.4262 12L17.7046 7.72153C18.0985 7.3277 18.0985 6.68919 17.7046 6.29537C17.3108 5.90154 16.6723 5.90154 16.2785 6.29537L12 10.5739L7.72152 6.29537Z"
                    fill="#2C3B47" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        <div class="dialog_content">
          <div class="content_section">
            <div class="section_content_wrap">
              <cos-deadline-picker
                [deadline]="deadline()"
                (deadlineChange)="onDeadlineChange($event)"
              ></cos-deadline-picker>
            </div>
          </div>
        </div>

        <div class="dialog_footer with_buttons">
          <button type="button" class="btn_link" (click)="dialogRef.close()">{{ 'COMPONENTS.ADD_IDEA_FOLDER.LNK_CANCEL' | translate }}</button>
          <button type="button" class="btn_big_submit" (click)="save()" [disabled]="loading()">
            {{ 'CONTROL.SAVE' | translate }}
          </button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .dialog_wrap {
      display: flex;
      align-items: center;
      justify-content: center;
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1000;
    }
    .overlay {
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background: rgba(0, 0, 0, 0.5);
    }
    .dialog {
      background: white;
      border-radius: 8px;
      width: 100%;
      max-width: 500px;
      max-height: 90vh;
      display: flex;
      flex-direction: column;
      z-index: 1001;
      overflow: hidden;
    }
    .dialog_header {
      padding: 24px;
      background: var(--color-ideation);
      color: white;
      .header_text {
        display: flex;
        justify-content: space-between;
        align-items: center;
        .title { font-size: 24px; font-weight: bold; }
      }
    }
    .dialog_content {
      padding: 24px;
      overflow-y: auto;
      flex: 1;
    }
    .dialog_footer {
      padding: 24px;
      display: flex;
      justify-content: flex-end;
      align-items: center;
      gap: 24px;
      border-top: 1px solid var(--color-border);
    }
    .btn_big_submit {
      background: var(--color-ideation);
      color: white;
      border: none;
      padding: 12px 24px;
      border-radius: 4px;
      font-weight: bold;
      cursor: pointer;
      &:disabled { opacity: 0.5; cursor: not-allowed; }
    }
  `]
})
export class EditIdeationDeadlineComponent {
  private ideationService = inject(TopicIdeationService);
  private notification = inject(NotificationService);
  private topicService = inject(TopicService);
  public dialogRef = inject(DialogRef<EditIdeationDeadlineComponent>);
  public dialogData = inject<EditIdeationDeadlineDialogData>(DIALOG_DATA);

  deadline = signal<Date | null>(this.dialogData.ideation.deadline ? new Date(this.dialogData.ideation.deadline) : null);
  loading = signal(false);

  onDeadlineChange(newDeadline: Date | null) {
    this.deadline.set(newDeadline);
  }

  save() {
    this.loading.set(true);
    const data = {
      topicId: this.dialogData.topic.id,
      ideationId: this.dialogData.ideation.id,
      deadline: this.deadline()
    };

    this.ideationService.update(data).pipe(take(1)).subscribe({
      next: () => {
        this.topicService.reloadTopic();
        this.dialogRef.close(true);
      },
      error: (res) => {
        this.loading.set(false);
        if (res.errors) {
            Object.values(res.errors).forEach((message) => {
                if (typeof message === 'string')
                  this.notification.error(message);
              });
        }
      }
    });
  }
}

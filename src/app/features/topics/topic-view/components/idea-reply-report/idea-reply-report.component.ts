import { Component, inject, signal, ChangeDetectionStrategy } from '@angular/core';
import { FormGroup, FormControl, Validators, ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../../shared/dialog/dialog-ref';
import { TopicIdeationService } from '../../../../../core/services/topic-ideation.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InitialsComponent } from '../../../../../shared/components/initials/initials.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';
import { IdeaComment } from '../../../../../core/interfaces/ideation';

export interface IdeaReplyReportData {
  argument: IdeaComment;
  topicId: string;
  ideaId: string;
  ideationId: string;
}

@Component({
  selector: 'cos-idea-reply-report',
  standalone: true,
  imports: [
    TranslateModule,
    ReactiveFormsModule,
    IconComponent,
    InitialsComponent,
    InputComponent,
    DropdownComponent
  ],
  templateUrl: './idea-reply-report.component.html',
  styleUrls: ['./idea-reply-report.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class IdeaReplyReportComponent {
  public data = inject<IdeaReplyReportData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private TopicIdeationService = inject(TopicIdeationService);

  reportTypes = Object.keys(this.TopicIdeationService.COMMENT_REPORT_TYPES);
  errors = signal<{ text?: string } | null>(null);

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

    this.TopicIdeationService.reportIdeaComment(this.report.value as { topicId: string; ideationId: string; ideaId: string; commentId: string; type: string; text: string }).subscribe({
      next: () => {
        this.dialogRef.close();
      },
      error: (res) => {
        this.errors.set(res.errors);
      },
    });
  }
}

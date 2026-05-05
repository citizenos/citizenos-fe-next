import { Component, input, output, signal, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';

import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';

@Component({
  selector: 'app-edit-argument',
  standalone: true,
  imports: [FormsModule, UpperCasePipe, TranslateModule, InputComponent],
  templateUrl: './edit-argument.component.html',
  styleUrls: ['./edit-argument.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class EditArgumentComponent implements OnInit {
  topicId = input.required<string>();
  argument = input.required<any>();
  showEdit = output<boolean | null>();

  private argumentService = inject(TopicArgumentService);

  readonly ARGUMENT_TYPES = Object.keys(this.argumentService.ARGUMENT_TYPES).filter(k => k !== 'reply');
  readonly ARGUMENT_SUBJECT_MAXLENGTH = this.argumentService.ARGUMENT_SUBJECT_MAXLENGTH;

  editSubject = signal('');
  editText = signal('');
  editType = signal('');
  errors: any = null;

  ngOnInit() {
    const arg = this.argument();
    this.editSubject.set(arg.subject || '');
    this.editText.set(arg.text || '');
    this.editType.set(arg.type || '');
  }

  argumentMaxLength(): number {
    return this.argumentService.ARGUMENT_TYPES_MAXLENGTH[this.editType()] || this.argumentService.ARGUMENT_TYPES_MAXLENGTH['pro'];
  }

  updateArgument() {
    const arg = this.argument();
    if (this.editType() === arg.type && arg.subject === this.editSubject() && arg.text === this.editText()) {
      return;
    }
    this.argumentService.update({
      id: arg.id,
      topicId: this.topicId(),
      discussionId: arg.discussionId,
      subject: this.editSubject(),
      text: this.editText(),
      type: this.editType(),
    }).pipe(take(1)).subscribe({
      next: () => this.showEdit.emit(null),
      error: (res) => { this.errors = res.errors; }
    });
  }

  argumentEditMode() {
    const arg = this.argument();
    this.editSubject.set(arg.subject || '');
    this.editText.set(arg.text || '');
    this.editType.set(arg.type || '');
    this.errors = null;
    this.showEdit.emit(false);
  }
}

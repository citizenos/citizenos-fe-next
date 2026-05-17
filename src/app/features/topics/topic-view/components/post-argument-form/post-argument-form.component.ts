import {
  Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit, model
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';

@Component({
  selector: 'cos-post-argument-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, InputComponent, ButtonComponent, IconComponent, MarkdownDirective],
  templateUrl: './post-argument-form.component.html',
  styleUrls: ['./post-argument-form.component.scss']
})
export class PostArgumentFormComponent implements OnInit {
  topicId = input.required<string>();
  discussionId = input.required<string>();
  isOpen = model<boolean>(false);
  posted = output<void>();

  argumentService = inject(TopicArgumentService);
  private notification = inject(NotificationService);

  types = ['pro', 'con', 'poi'];
  argumentType = signal<string>('pro');
  subject = signal('');
  text = signal('');
  errors = signal<string | null>(null);
  focusArgumentSubject = signal<boolean>(false);

  ARGUMENT_SUBJECT_MAXLENGTH = this.argumentService.ARGUMENT_SUBJECT_MAXLENGTH;

  ngOnInit() {
    this.argumentService.setParam('topicId', this.topicId());
    this.argumentService.setParam('discussionId', this.discussionId());
  }

  argumentMaxLength() {
    return (this.argumentService.ARGUMENT_TYPES_MAXLENGTH as any)[this.argumentType()] || this.argumentService.ARGUMENT_TYPES_MAXLENGTH.pro;
  }

  close() {
    this.isOpen.set(false);
  }

  clear() {
    this.subject.set('');
    this.text.set('');
    this.errors.set(null);
  }

  submit() {
    const argument = {
      type: this.argumentType(),
      subject: this.subject().trim(),
      text: this.text().trim(),
      topicId: this.topicId(),
      discussionId: this.discussionId(),
      parentVersion: 0,
    };

    this.argumentService.save(argument).pipe(take(1)).subscribe({
      next: () => {
        this.clear();
        this.isOpen.set(false);
        this.posted.emit();
      },
      error: (err) => {
        this.errors.set(err?.message || 'Error posting argument');
      }
    });
  }
}

import {
  Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { take } from 'rxjs';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-post-argument-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, InputComponent, ButtonComponent],
  templateUrl: './post-argument-form.component.html',
  styleUrls: ['./post-argument-form.component.scss']
})
export class PostArgumentFormComponent implements OnInit {
  topicId = input.required<string>();
  discussionId = input.required<string>();
  cancel = output<void>();
  posted = output<void>();

  argumentService = inject(TopicArgumentService);
  private notification = inject(NotificationService);

  types = ['pro', 'con', 'poi'];
  argumentType = signal<string>('pro');
  subject = signal('');
  text = signal('');
  errors = signal<string | null>(null);

  ngOnInit() {
    this.argumentService.setParam('topicId', this.topicId());
    this.argumentService.setParam('discussionId', this.discussionId());
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
        this.subject.set('');
        this.text.set('');
        this.errors.set(null);
        this.posted.emit();
      },
      error: (err) => {
        this.errors.set(err?.message || 'Error posting argument');
      }
    });
  }
}

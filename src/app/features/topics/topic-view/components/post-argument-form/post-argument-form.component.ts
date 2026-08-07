import {
  Component, input, output, signal, inject, ChangeDetectionStrategy, OnInit, model
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { take } from 'rxjs';
import { Argument } from '../../../../../core/interfaces/discussion';
import { Router } from '@angular/router';
import { TopicArgumentService } from '../../../../../core/services/topic-argument.service';
import { NotificationService } from '../../../../../core/services/notification.service';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { MarkdownDirective } from '../../../../../shared/directives/markdown.directive';

@Component({
  selector: 'cos-post-argument-form',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [FormsModule, TranslateModule, InputComponent, IconComponent, MarkdownDirective],
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
  private router = inject(Router);
  private translate = inject(TranslateService);

  types = ['pro', 'con', 'poi'];
  argumentType = signal<string>('pro');
  subject = signal('');
  text = signal('');
  subjectTouched = signal(false);
  textTouched = signal(false);
  errors = signal<string | null>(null);
  focusArgumentSubject = signal<boolean>(false);

  ARGUMENT_SUBJECT_MAXLENGTH = this.argumentService.ARGUMENT_SUBJECT_MAXLENGTH;

  ngOnInit() {
    this.argumentService.setParam('topicId', this.topicId());
    this.argumentService.setParam('discussionId', this.discussionId());
  }

  argumentMaxLength() {
    return (this.argumentService.ARGUMENT_TYPES_MAXLENGTH as Record<string, number>)[this.argumentType()] || this.argumentService.ARGUMENT_TYPES_MAXLENGTH.pro;
  }

  close() {
    this.isOpen.set(false);
  }

  clear() {
    this.subject.set('');
    this.text.set('');
    this.subjectTouched.set(false);
    this.textTouched.set(false);
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

    this.argumentService.save(argument as unknown as Parameters<typeof this.argumentService.save>[0]).pipe(take(1)).subscribe({
      next: (res: Argument) => {
        this.clear();
        this.isOpen.set(false);
        this.posted.emit();
        
        const argId = res.id;
        if (argId && typeof argId === 'string' && typeof window !== 'undefined') {
          this.router.navigate(['/', this.translate.currentLang, 'topics', this.topicId()], {
            queryParams: { argumentId: argId },
            fragment: 'discussion'
          });
        }
      },
      error: (err) => {
        this.errors.set(err?.message || 'Error posting argument');
      }
    });
  }
}

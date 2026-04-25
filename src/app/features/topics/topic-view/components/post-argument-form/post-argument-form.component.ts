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
  template: `
    <div class="post-argument-form">
      <div class="type-tabs">
        @for (t of types; track t) {
          <button
            class="type-tab"
            [class]="'type-' + t"
            [class.active]="argumentType() === t"
            (click)="argumentType.set(t)"
          >
            {{ 'COMPONENTS.POST_ARGUMENT.TYPE_' + t.toUpperCase() | translate }}
          </button>
        }
      </div>

      <div class="form-fields">
        <cos-input [placeholder]="'COMPONENTS.POST_ARGUMENT.SUBJECT_PLACEHOLDER' | translate">
          <input
            [ngModel]="subject()"
            (ngModelChange)="subject.set($event)"
            [maxlength]="argumentService.ARGUMENT_SUBJECT_MAXLENGTH"
          >
        </cos-input>

        <cos-input [placeholder]="'COMPONENTS.POST_ARGUMENT.TEXT_PLACEHOLDER' | translate">
          <textarea
            [ngModel]="text()"
            (ngModelChange)="text.set($event)"
            rows="4"
            [maxlength]="argumentService.ARGUMENT_TYPES_MAXLENGTH[argumentType()]"
          ></textarea>
        </cos-input>

        @if (errors()) {
          <p class="error-text">{{ errors() }}</p>
        }

        <div class="form-actions">
          <cos-button variant="secondary" (clicked)="cancel.emit()">
            {{ 'BTN_CANCEL' | translate }}
          </cos-button>
          <cos-button
            variant="primary"
            [isDisabled]="!subject().trim() || !text().trim()"
            (clicked)="submit()"
          >
            {{ 'COMPONENTS.POST_ARGUMENT.BTN_POST' | translate }}
          </cos-button>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .post-argument-form { display: flex; flex-direction: column; gap: 16px; }
    .type-tabs { display: flex; gap: 0; border-bottom: 2px solid var(--color-border); }
    .type-tab {
      background: none; border: none; border-bottom: 3px solid transparent;
      padding: 10px 20px; cursor: pointer; font-weight: 600; font-size: 14px;
      color: var(--color-text-muted); margin-bottom: -2px; transition: color .15s, border-color .15s;
      &.active { color: var(--color-text); }
      &.type-pro.active { border-bottom-color: var(--color-success, #5AB467); color: var(--color-success, #5AB467); }
      &.type-con.active { border-bottom-color: var(--color-error, #EF4025); color: var(--color-error, #EF4025); }
      &.type-poi.active { border-bottom-color: var(--color-primary); color: var(--color-primary); }
    }
    .form-fields { display: flex; flex-direction: column; gap: 12px; }
    .error-text { color: var(--color-error, #EF4025); font-size: 13px; margin: 0; }
    .form-actions { display: flex; justify-content: flex-end; gap: 12px; }
  `]
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

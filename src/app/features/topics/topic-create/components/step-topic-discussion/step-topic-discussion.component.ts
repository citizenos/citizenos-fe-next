import { Component, input, output, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../../../core/interfaces/topic';
import { MemberEditorsPanelComponent } from '../../../../../shared/components/member-editors-panel/member-editors-panel.component';
import { EtherpadDirective } from '../../../../../shared/directives/etherpad.directive';
import { AnyPipe } from '../../../../../shared/pipes/any.pipe';
import { ButtonComponent } from '../../../../../shared/components/button/button.component';

@Component({
  selector: 'cos-step-topic-discussion',
  standalone: true,
  imports: [TranslateModule, MemberEditorsPanelComponent, AnyPipe, EtherpadDirective, ButtonComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="step-container">
      <div class="section-desc">
        <h3 translate="VIEWS.TOPIC_CREATE.DISCUSSION_HEADING"></h3>
        <p translate="VIEWS.TOPIC_CREATE.DISCUSSION_DESC"></p>
      </div>

      @if (topic().padUrl) {
        <div class="etherpad-container">
          <iframe
            [src]="topic().padUrl | any"
            [cosEtherpad]="topic().padUrl"
            frameborder="0"
            width="100%"
            height="600"
          ></iframe>
        </div>
      }

      <cos-member-editors-panel
        [topic]="topic() | any"
        (inviteEditors)="onInviteEditors()"
      ></cos-member-editors-panel>

      <div class="actions">
        <cos-button
          variant="secondary"
          (clicked)="previous.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.BTN_PREVIOUS' | translate }}
        </cos-button>
        <cos-button
          variant="primary"
          (clicked)="next.emit()"
        >
          {{ 'VIEWS.TOPIC_CREATE.BTN_NEXT' | translate }}
        </cos-button>
      </div>
    </div>
  `,
  styles: [`
    .step-container {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section-desc {
      h3 { font-size: 18px; font-weight: 600; margin-bottom: 8px; }
      p { font-size: 14px; color: var(--color-text-muted); line-height: 1.5; }
    }

    .actions {
      display: flex;
      justify-content: space-between;
      margin-top: 20px;
    }

    .btn-primary, .btn-secondary {
      padding: 12px 32px;
      border-radius: var(--radius-md);
      font-weight: 600;
      cursor: pointer;
    }

    .btn-primary { background: var(--color-primary); color: white; border: none; }
    .btn-secondary { background: none; border: 1px solid var(--color-border); color: var(--color-text); }
  `]
})
export class StepTopicDiscussionComponent {
  topic = input<Partial<Topic>>({
    title: '',
    description: ''
  });
  topicUpdate = output<Partial<Topic>>();
  next = output<void>();
  previous = output<void>();

  onInviteEditors() {
    console.log('Invite editors clicked');
  }
}

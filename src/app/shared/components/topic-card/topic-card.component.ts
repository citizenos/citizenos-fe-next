import { Component, ChangeDetectionStrategy, input, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { Topic } from '../../../core/interfaces/topic';

@Component({
  selector: 'cos-topic-card',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, TranslateModule],
  template: `
    <a class="topic_card" [routerLink]="['/', translate.currentLang, 'topics', topic().id]">
      <div class="topic_image" [style.background-image]="topic().imageUrl ? 'url(' + topic().imageUrl + ')' : ''"></div>
      <div class="topic_body">
        <div class="topic_title">{{ topic().title || ('TOPIC.NO_TITLE' | translate) }}</div>
        <div class="topic_status">{{ topic().status }}</div>
      </div>
    </a>
  `,
  styles: [`
    :host { display: contents; }
    .topic_card {
      display: flex;
      flex-direction: column;
      min-width: 200px;
      max-width: 240px;
      background: var(--color-surfaces);
      border-radius: 16px;
      overflow: hidden;
      text-decoration: none;
      color: var(--color-text);
      flex-shrink: 0;
    }
    .topic_image {
      width: 100%;
      height: 120px;
      background: var(--color-surface-contrast);
      background-size: cover;
      background-position: center;
    }
    .topic_body {
      padding: 12px 16px;
      display: flex;
      flex-direction: column;
      gap: 4px;
    }
    .topic_title {
      font-weight: 600;
      font-size: 14px;
      line-height: 20px;
      overflow: hidden;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
    }
    .topic_status {
      font-size: 12px;
      color: var(--color-text-muted);
      text-transform: capitalize;
    }
  `]
})
export class TopicCardComponent {
  topic = input.required<Topic>();
  translate = inject(TranslateService);
}

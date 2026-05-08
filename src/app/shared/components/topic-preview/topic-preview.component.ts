import { Component, input, ChangeDetectionStrategy, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Topic } from '../../../core/interfaces/topic';
import { TopicMemberGroup } from '../topic-settings-panel/topic-settings-panel.component';
import { Ideation } from '../../../core/interfaces/ideation';
import { Vote } from '../../../core/interfaces/vote';

@Component({
  selector: 'cos-topic-preview',
  standalone: true,
  imports: [TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="topic-preview">
      @if (topic(); as t) {
        @if (t.imageUrl) {
          <div class="preview-image">
            <img [src]="t.imageUrl" alt="" />
          </div>
        }

        <div class="preview-header">
          <h2 class="preview-title">{{ t.title || ('VIEWS.TOPIC_CREATE.TITLE_HEADING' | translate) }}</h2>
          @if (t.intro) {
            <p class="preview-intro">{{ t.intro }}</p>
          }
        </div>

        @if (ideation(); as i) {
          <div class="preview-ideation">
            <h3>{{ 'COMPONENTS.TOPIC_VOTE_CREATE.OPTION_VOTING_IDEATION' | translate }}</h3>
            <p class="preview-question">{{ i.question }}</p>
          </div>
        }

        @if (vote(); as v) {
          <div class="preview-vote">
            <h3>{{ 'COMPONENTS.TOPIC_VOTE_CREATE.LBL_VOTING_QUESTION' | translate }}</h3>
            <p class="preview-question">{{ v.question }}</p>
            <div class="preview-options">
              @for (opt of v.options; track opt.value) {
                <div class="preview-option">
                  <span class="bullet">○</span>
                  <span>{{ opt.value }}</span>
                </div>
              }
            </div>
          </div>
        }

        <div class="preview-meta">
          @if (t.categories.length) {
            <div class="meta-row">
              <span class="meta-label">{{ 'VIEWS.TOPIC_CREATE.SETTINGS_HEADING_CATEGORY_AND_LOCALITY' | translate }}</span>
              <div class="category-tags">
                @for (cat of t.categories; track cat) {
                  <span class="category-tag">{{ cat }}</span>
                }
              </div>
            </div>
          }

          <div class="meta-row">
            <span class="meta-label">{{ 'VIEWS.TOPIC_CREATE.SETTINGS_HEADING_VISIBILITY' | translate }}</span>
            <span class="meta-value">{{ t.visibility }}</span>
          </div>

          @if (t.country) {
            <div class="meta-row">
              <span class="meta-label">{{ 'VIEWS.TOPIC_CREATE.SETTINGS_HEADING_LOCALITY' | translate }}</span>
              <span class="meta-value">{{ t.country }}</span>
            </div>
          }

          @if (t.language) {
            <div class="meta-row">
              <span class="meta-label">{{ 'VIEWS.TOPIC_CREATE.TOOLTIP_TOPIC_LOCALITY_TITLE' | translate }}</span>
              <span class="meta-value">{{ t.language }}</span>
            </div>
          }
        </div>

        @if (topicGroups().length) {
          <div class="preview-groups">
            <h3>{{ 'VIEWS.TOPIC_CREATE.SETTINGS_HEADING_GROUP_LIST' | translate }}</h3>
            @for (group of topicGroups(); track group.id) {
              <div class="group-chip">{{ group.name }}</div>
            }
          </div>
        }
      }
    </div>
  `,
  styles: [`
    .topic-preview {
      width: 100%;
      max-width: 720px;
    }

    .preview-image {
      margin-bottom: 24px;

      img {
        width: 100%;
        max-height: 300px;
        object-fit: cover;
        border-radius: var(--radius-md);
      }
    }

    .preview-header {
      margin-bottom: 24px;
    }

    .preview-title {
      font-size: 24px;
      font-weight: 700;
      margin: 0 0 8px;
    }

    .preview-intro {
      font-size: 16px;
      color: var(--color-text-muted);
      margin: 0;
      line-height: 1.5;
    }

    .preview-meta {
      display: flex;
      flex-direction: column;
      gap: 12px;
      margin-bottom: 24px;
      padding: 16px;
      background: var(--color-secondary);
      border-radius: var(--radius-md);
    }

    .meta-row {
      display: flex;
      align-items: center;
      gap: 12px;
    }

    .meta-label {
      font-size: 13px;
      color: var(--color-text-muted);
      min-width: 100px;
    }

    .meta-value {
      font-size: 14px;
      font-weight: 500;
    }

    .category-tags {
      display: flex;
      flex-wrap: wrap;
      gap: 6px;
    }

    .category-tag {
      padding: 2px 10px;
      background: var(--color-surfaces);
      border-radius: 12px;
      font-size: 13px;
    }

    .preview-groups {
      h3 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 12px;
      }
    }

    .group-chip {
      display: inline-block;
      padding: 4px 12px;
      margin: 0 6px 6px 0;
      background: var(--color-secondary);
      border-radius: var(--radius-md);
      font-size: 13px;
    }
    .preview-ideation {
      margin-bottom: 24px;
      h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--color-text-muted); }
      .preview-question { font-size: 18px; font-weight: 500; }
    }
    .preview-vote {
      margin-bottom: 24px;
      h3 { font-size: 14px; font-weight: 600; margin-bottom: 8px; color: var(--color-text-muted); }
      .preview-question { font-size: 18px; font-weight: 500; margin-bottom: 16px; }
      .preview-options { display: flex; flex-direction: column; gap: 8px; }
      .preview-option { display: flex; align-items: center; gap: 12px; font-size: 16px; }
      .bullet { color: var(--color-primary); font-weight: bold; }
    }
  `]
})
export class TopicPreviewComponent {
  topic = model.required<Topic>();
  topicGroups = model<TopicMemberGroup[]>([]);
  ideation = input<Partial<Ideation> | null>(null);
  vote = input<Partial<Vote> | null>(null);
}

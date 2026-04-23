import { Component, input, output, signal, inject, ChangeDetectionStrategy, effect } from '@angular/core';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { Topic } from '../../../core/interfaces/topic';
import { Group } from '../../../core/interfaces/group';
import { TopicService } from '../../../core/services/topic.service';
import { CountryService } from '../../../core/services/country.service';
import { LanguageService } from '../../../core/services/language.service';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IconComponent } from '../icon/icon.component';

export interface TopicMemberGroup {
  id: string;
  name: string;
  level?: string;
  visibility?: string;
  [key: string]: any;
}

@Component({
  selector: 'cos-topic-settings-panel',
  standalone: true,
  imports: [TranslateModule, FormsModule, UpperCasePipe, DropdownComponent, IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="settings-panel">
      <!-- Visibility -->
      <div class="settings-section">
        <div class="section-number">1</div>
        <div class="section-content">
          <div class="section-header">
            <h3 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_VISIBILITY"></h3>
            <p translate="VIEWS.TOPIC_CREATE.SETTINGS_VISIBILITY_DESC"></p>
          </div>
          <div class="visibility-options">
            <div
              class="radio-option"
              [class.active]="visibility() === 'private'"
              (click)="setVisibility('private')"
            >
              <label class="radio-box">
                <input type="radio" [checked]="visibility() === 'private'" name="visibility" value="private">
                <span class="radio-indicator"></span>
                <span class="radio-label" translate="VIEWS.TOPIC_CREATE.SETTINGS_VISIBILITY_PRIVATE"></span>
              </label>
              <p class="radio-description" translate="VIEWS.TOPIC_CREATE.SETTINGS_VISIBILITY_PRIVATE_DESC"></p>
            </div>
            <div
              class="radio-option"
              [class.active]="visibility() === 'public'"
              (click)="setVisibility('public')"
            >
              <label class="radio-box">
                <input type="radio" [checked]="visibility() === 'public'" name="visibility" value="public">
                <span class="radio-indicator"></span>
                <span class="radio-label" translate="VIEWS.TOPIC_CREATE.SETTINGS_VISIBILITY_PUBLIC"></span>
              </label>
              <p class="radio-description" translate="VIEWS.TOPIC_CREATE.SETTINGS_VISIBILITY_PUBLIC_DESC"></p>
            </div>
          </div>
        </div>
      </div>

      <!-- Categories & Locality -->
      <div class="settings-section">
        <div class="section-number">2</div>
        <div class="section-content">
          <div class="section-header">
            <h3 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_CATEGORY_AND_LOCALITY"></h3>
            <p translate="VIEWS.TOPIC_CREATE.SETTINGS_CATEGORY_SELECT_DESC"></p>
          </div>

          <cos-dropdown>
            <div selection translate="VIEWS.TOPIC_CREATE.SETTINGS_CATEGORY_SELECT"></div>
            <div options>
              @for (category of categoryKeys; track category) {
                <div class="option" (click)="toggleCategory(category)">
                  {{ 'TXT_TOPIC_CATEGORY_' + category | uppercase | translate }}
                </div>
              }
            </div>
          </cos-dropdown>

          <div class="selected-categories">
            @for (cat of categories(); track cat) {
              <a class="category-chip" (click)="toggleCategory(cat)">
                <span>{{ 'TXT_TOPIC_CATEGORY_' + cat | uppercase | translate }}</span>
                <cos-icon name="close" [size]="16"></cos-icon>
              </a>
            }
          </div>

          <div class="locality-section">
            <h4 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_LOCALITY"></h4>
            <p translate="VIEWS.TOPIC_CREATE.SETTINGS_LOCALITY_SELECT_DESC"></p>
            <div class="locality-row">
              <cos-dropdown>
                <div selection>
                  @if (!country()) {
                    <span translate="VIEWS.TOPIC_CREATE.SETTINGS_COUNTRY_SELECT"></span>
                  } @else {
                    <span>{{ country() }}</span>
                  }
                </div>
                <div options>
                  @for (c of countries; track c.name) {
                    <div class="option" (click)="onCountryChange(c.name)">{{ c.name }}</div>
                  }
                </div>
              </cos-dropdown>

              <cos-dropdown>
                <div selection>
                  @if (!language()) {
                    <span translate="VIEWS.TOPIC_CREATE.SETTINGS_LANGUAGE_SELECT"></span>
                  } @else {
                    <span>{{ language() }}</span>
                  }
                </div>
                <div options>
                  @for (l of languages; track l.name) {
                    <div class="option" (click)="onLanguageChange(l.name)">{{ l.name }}</div>
                  }
                </div>
              </cos-dropdown>
            </div>
          </div>
        </div>
      </div>

      <!-- Groups -->
      <div class="settings-section">
        <div class="section-number">3</div>
        <div class="section-content">
          <div class="section-header">
            <h3 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_ADD_TO_GROUP"></h3>
            <p translate="VIEWS.TOPIC_CREATE.SETTINGS_ADD_TO_GROUP_DESC"></p>
          </div>

          @if (availableGroups().length) {
            <cos-dropdown>
              <div selection translate="VIEWS.TOPIC_CREATE.SETTINGS_GROUP_SELECT"></div>
              <div options>
                @for (group of availableGroups(); track group.id) {
                  @if (!isGroupAdded(group)) {
                    <div class="option" (click)="addGroup(group)">{{ group.name }}</div>
                  }
                }
              </div>
            </cos-dropdown>

            @if (addedGroups().length) {
              <div class="group-list">
                <h4 translate="VIEWS.TOPIC_CREATE.SETTINGS_HEADING_GROUP_LIST"></h4>
                @for (group of addedGroups(); track group.id) {
                  <div class="group-row">
                    <span class="group-name">{{ group.name }}</span>
                    <button class="remove-group-btn" (click)="removeGroup(group)">
                      <cos-icon name="close" [size]="16"></cos-icon>
                    </button>
                  </div>
                }
              </div>
            }
          } @else {
            <div class="no-groups">
              <p translate="VIEWS.TOPIC_CREATE.NO_GROUPS_HEADING"></p>
              <p translate="VIEWS.TOPIC_CREATE.NO_GROUPS_DESCRIPTION"></p>
            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    .settings-panel {
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .settings-section {
      display: flex;
      gap: 16px;
    }

    .section-number {
      width: 32px;
      height: 32px;
      border-radius: 50%;
      background: var(--color-secondary);
      display: flex;
      align-items: center;
      justify-content: center;
      font-weight: 700;
      font-size: 14px;
      flex-shrink: 0;
    }

    .section-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section-header {
      h3 {
        font-size: 16px;
        font-weight: 600;
        margin: 0 0 4px;
      }
      p {
        font-size: 14px;
        color: var(--color-text-muted);
        margin: 0;
      }
    }

    .visibility-options {
      display: flex;
      gap: 12px;
    }

    .radio-option {
      flex: 1;
      padding: 16px;
      border: 2px solid var(--color-border);
      border-radius: var(--radius-md);
      cursor: pointer;
      transition: border-color 0.2s;

      &.active {
        border-color: var(--color-primary);
      }
    }

    .radio-box {
      display: flex;
      align-items: center;
      gap: 8px;
      cursor: pointer;
    }

    .radio-label {
      font-weight: 600;
    }

    .radio-description {
      font-size: 13px;
      color: var(--color-text-muted);
      margin: 8px 0 0;
    }

    .selected-categories {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .category-chip {
      display: inline-flex;
      align-items: center;
      gap: 4px;
      padding: 4px 12px;
      background: var(--color-secondary);
      border-radius: 16px;
      font-size: 13px;
      cursor: pointer;

      &:hover {
        background: var(--color-border);
      }
    }

    .locality-section {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 4px;
      }
      p {
        font-size: 13px;
        color: var(--color-text-muted);
        margin: 0 0 12px;
      }
    }

    .locality-row {
      display: flex;
      gap: 12px;

      cos-dropdown {
        flex: 1;
      }
    }

    .group-list {
      h4 {
        font-size: 14px;
        font-weight: 600;
        margin: 0 0 8px;
      }
    }

    .group-row {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 8px 12px;
      border-bottom: 1px solid var(--color-border);
    }

    .remove-group-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--color-text-muted);

      &:hover { color: var(--color-danger); }
    }

    .no-groups {
      text-align: center;
      padding: 24px;
      color: var(--color-text-muted);
    }

    @media (max-width: 768px) {
      .section-number { display: none; }
      .visibility-options { flex-direction: column; }
      .locality-row { flex-direction: column; }
    }
  `]
})
export class TopicSettingsPanelComponent {
  private topicService = inject(TopicService);
  private countryService = inject(CountryService);
  private languageService = inject(LanguageService);

  topic = input<Topic>({} as Topic);
  groups = input<Group[]>([]);

  visibilityChange = output<string>();
  categoriesChange = output<string[]>();
  countryChange = output<string>();
  languageChange = output<string>();
  groupsAdded = output<TopicMemberGroup[]>();
  groupRemoved = output<TopicMemberGroup>();

  visibility = signal('private');
  categories = signal<string[]>([]);
  country = signal<string | null>(null);
  language = signal<string | null>(null);
  addedGroups = signal<TopicMemberGroup[]>([]);

  categoryKeys = Object.keys(this.topicService.CATEGORIES);
  countries = this.countryService.countries;
  languages = this.languageService.languages;

  availableGroups = signal<Group[]>([]);

  constructor() {
    effect(() => {
      const t = this.topic();
      if (t && t.id) {
        this.visibility.set(t.visibility || 'private');
        this.categories.set([...(t.categories || [])]);
        this.country.set(t.country || null);
        this.language.set(t.language || null);
      }
    });

    effect(() => {
      this.availableGroups.set(this.groups());
    });
  }

  setVisibility(v: string) {
    this.visibility.set(v);
    this.visibilityChange.emit(v);
  }

  toggleCategory(category: string) {
    this.categories.update(cats => {
      const idx = cats.indexOf(category);
      if (idx > -1) {
        return cats.filter(c => c !== category);
      } else if (cats.length < this.topicService.CATEGORIES_COUNT_MAX) {
        return [...cats, category];
      }
      return cats;
    });
    this.categoriesChange.emit(this.categories());
  }

  onCountryChange(c: string) {
    this.country.set(c);
    this.countryChange.emit(c);
  }

  onLanguageChange(l: string) {
    this.language.set(l);
    this.languageChange.emit(l);
  }

  isGroupAdded(group: Group): boolean {
    return this.addedGroups().some(g => g.id === group.id);
  }

  addGroup(group: Group) {
    if (!this.isGroupAdded(group)) {
      this.addedGroups.update(gs => [...gs, { ...group, level: 'read' }]);
      this.groupsAdded.emit(this.addedGroups());
    }
  }

  removeGroup(group: TopicMemberGroup) {
    this.addedGroups.update(gs => gs.filter(g => g.id !== group.id));
    this.groupRemoved.emit(group);
  }
}

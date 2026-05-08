import { Component, output, signal, inject, ChangeDetectionStrategy, effect, model } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { FormsModule } from '@angular/forms';
import { UpperCasePipe } from '@angular/common';
import { Topic } from '../../../core/interfaces/topic';
import { Group } from '../../../core/interfaces/group';
import { TopicService } from '../../../core/services/topic.service';
import { CountryService } from '../../../core/services/country.service';
import { LanguageService } from '../../../core/services/language.service';
import { DropdownComponent } from '../dropdown/dropdown.component';
import { IconComponent } from '../icon/icon.component';
import { TooltipComponent } from '../tooltip/tooltip.component';

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
  imports: [TranslateModule, FormsModule, UpperCasePipe, DropdownComponent, IconComponent, TooltipComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './topic-settings-panel.component.html',
  styleUrl: './topic-settings-panel.component.scss'
})
export class TopicSettingsPanelComponent {
  private topicService = inject(TopicService);
  private countryService = inject(CountryService);
  private languageService = inject(LanguageService);

  topic = model<Topic>({} as Topic);
  groups = model<Group[]>([]);

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

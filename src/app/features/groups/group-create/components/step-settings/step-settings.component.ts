import { Component, input, output, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { Group } from '../../../../../core/interfaces/group';
import { CountryService } from '../../../../../core/services/country.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { IconComponent } from '../../../../../shared/components/icon/icon.component';
import { InputComponent } from '../../../../../shared/components/input/input.component';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-step-settings',
  standalone: true,
  imports: [
    FormsModule,
    TranslateModule,
    IconComponent,
    InputComponent,
    DropdownComponent
  ],
  templateUrl: './step-settings.component.html',
  styleUrl: './step-settings.component.scss'
})
export class StepSettingsComponent {
  group = input.required<Partial<Group>>();
  groupUpdate = output<Partial<Group>>();

  countryService = inject(CountryService);
  languageService = inject(LanguageService);

  countries = this.countryService.countries;
  languages = this.languageService.languages;

  rules = signal<{ rule: string }[]>([]);

  constructor() {
    // Initialize rules from group input if they exist
    // Note: group() is not available in constructor, so we'll use an effect or just handle it in ngOnChanges/OnInit
  }

  ngOnInit() {
    if (this.group().rules) {
      this.rules.set(this.group().rules!.map(r => ({ rule: r })));
    } else {
      this.addRule();
    }
  }

  updateVisibility(visibility: string) {
    this.groupUpdate.emit({ visibility });
  }

  updateCountry(country: string) {
    this.groupUpdate.emit({ country });
  }

  updateLanguage(language: string) {
    this.groupUpdate.emit({ language });
  }

  updateContact(contact: string) {
    this.groupUpdate.emit({ contact });
  }

  addRule() {
    this.rules.update(r => [...r, { rule: '' }]);
    this.emitRules();
  }

  removeRule(index: number) {
    this.rules.update(r => {
      const newRules = [...r];
      newRules.splice(index, 1);
      return newRules;
    });
    this.emitRules();
  }

  onRuleChange(index: number, value: string) {
    this.rules.update(r => {
      const newRules = [...r];
      newRules[index].rule = value;
      return newRules;
    });
    this.emitRules();
  }

  private emitRules() {
    this.groupUpdate.emit({ rules: this.rules().map(r => r.rule).filter(r => r.length > 0) });
  }
}

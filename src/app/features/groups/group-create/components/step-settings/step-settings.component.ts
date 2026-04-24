import { Component, ChangeDetectionStrategy, input, output, inject } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { Group } from '../../../../../core/interfaces/group';
import { CountryService } from '../../../../../core/services/country.service';
import { LanguageService } from '../../../../../core/services/language.service';
import { DropdownComponent } from '../../../../../shared/components/dropdown/dropdown.component';

@Component({
  selector: 'cos-step-settings',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, DropdownComponent],
  templateUrl: './step-settings.component.html',
  styleUrl: './step-settings.component.scss',
})
export class StepSettingsComponent {
  group = input.required<Partial<Group>>();
  groupUpdate = output<Partial<Group>>();

  countryService = inject(CountryService);
  languageService = inject(LanguageService);

  countries = this.countryService.countries;
  languages = this.languageService.languages;

  updateVisibility(visibility: string) {
    this.groupUpdate.emit({ visibility });
  }

  updateCountry(country: string) {
    this.groupUpdate.emit({ country });
  }

  updateLanguage(language: string) {
    this.groupUpdate.emit({ language });
  }
}

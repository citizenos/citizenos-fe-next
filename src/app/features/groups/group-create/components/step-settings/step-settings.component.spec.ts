import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { StepSettingsComponent } from './step-settings.component';
import { CountryService } from '../../../../../core/services/country.service';
import { LanguageService } from '../../../../../core/services/language.service';

const mockCountryService = { countries: [{ iso2: 'EE', name: 'Estonia' }] };
const mockLanguageService = { languages: [{ code: 'en', name: 'English' }] };

const baseGroup = { name: '', visibility: 'private' as const, members: { users: [], topics: { rows: [], count: 0 } } };

describe('StepSettingsComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: CountryService, useValue: mockCountryService },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp(): StepSettingsComponent {
    const comp = runInInjectionContext(injector, () => new StepSettingsComponent());
    Object.defineProperty(comp, 'group', { value: () => baseGroup });
    return comp;
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('updateVisibility emits groupUpdate', () => {
    const comp = makeComp();
    const spy = vi.fn();
    comp.groupUpdate.subscribe(spy);
    comp.updateVisibility('public');
    expect(spy).toHaveBeenCalledWith({ visibility: 'public' });
  });

  it('updateCountry emits groupUpdate', () => {
    const comp = makeComp();
    const spy = vi.fn();
    comp.groupUpdate.subscribe(spy);
    comp.updateCountry('Estonia');
    expect(spy).toHaveBeenCalledWith({ country: 'Estonia' });
  });

  it('updateLanguage emits groupUpdate', () => {
    const comp = makeComp();
    const spy = vi.fn();
    comp.groupUpdate.subscribe(spy);
    comp.updateLanguage('English');
    expect(spy).toHaveBeenCalledWith({ language: 'English' });
  });
});

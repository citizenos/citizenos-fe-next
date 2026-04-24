import { TestBed } from '@angular/core/testing';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { runInInjectionContext, EnvironmentInjector } from '@angular/core';
import { GroupSettingsDialogComponent } from './group-settings-dialog.component';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { GroupDetailService } from '../../../../core/services/group-detail.service';
import { CountryService } from '../../../../core/services/country.service';
import { LanguageService } from '../../../../core/services/language.service';
import { of } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';

const mockGroup = {
  id: 'g1',
  name: 'Test Group',
  description: 'Desc',
  visibility: 'public',
  rules: ['Rule 1'],
  country: 'EE',
  language: 'en',
  contact: '',
  imageUrl: null,
};
const mockDialogRef = { close: vi.fn() };
const mockGroupDetailService = {
  update: vi.fn().mockReturnValue(of({ ...mockGroup, name: 'Updated' })),
  uploadGroupImage: vi.fn().mockReturnValue(of({})),
};
const mockCountryService = { countries: [{ code: 'EE', name: 'Estonia' }] };
const mockLanguageService = { languages: [{ code: 'en', name: 'English' }] };

describe('GroupSettingsDialogComponent', () => {
  let injector: EnvironmentInjector;

  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        { provide: DIALOG_DATA, useValue: { group: mockGroup } },
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: GroupDetailService, useValue: mockGroupDetailService },
        { provide: CountryService, useValue: mockCountryService },
        { provide: LanguageService, useValue: mockLanguageService },
      ],
    });
    injector = TestBed.inject(EnvironmentInjector);
  });

  function makeComp() {
    return runInInjectionContext(injector, () => new GroupSettingsDialogComponent());
  }

  it('should instantiate', () => {
    expect(makeComp()).toBeTruthy();
  });

  it('initializes group from dialog data', () => {
    const comp = makeComp();
    expect(comp.group().name).toBe('Test Group');
  });

  it('initializes rules from dialog data', () => {
    const comp = makeComp();
    expect(comp.rules().length).toBe(1);
    expect(comp.rules()[0].rule).toBe('Rule 1');
  });

  it('addRule adds an empty rule', () => {
    const comp = makeComp();
    comp.addRule();
    expect(comp.rules().length).toBe(2);
    expect(comp.rules()[1].rule).toBe('');
  });

  it('removeRule removes rule at index', () => {
    const comp = makeComp();
    comp.removeRule(0);
    expect(comp.rules()).toEqual([]);
  });

  it('updateRule updates rule text', () => {
    const comp = makeComp();
    comp.updateRule(0, 'New Rule');
    expect(comp.rules()[0].rule).toBe('New Rule');
  });

  it('activeTab defaults to info', () => {
    expect(makeComp().activeTab()).toBe('info');
  });

  it('save calls groupDetailService.update and closes dialog', () => {
    const comp = makeComp();
    comp.save();
    expect(mockGroupDetailService.update).toHaveBeenCalled();
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('removeImage clears imageUrl', () => {
    const comp = makeComp();
    comp.group.update(g => ({ ...g, imageUrl: 'http://img.url' }));
    comp.removeImage();
    expect(comp.group().imageUrl).toBeNull();
    expect(comp.imageFile()).toBeNull();
  });
});

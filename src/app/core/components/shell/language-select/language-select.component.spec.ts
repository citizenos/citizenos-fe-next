import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { provideRouter } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { LanguageSelectComponent } from './language-select.component';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { UserStore } from '../../../state/user.store';
import { UserService } from '../../../services/user.service';
import { signal } from '@angular/core';
import { of } from 'rxjs';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockDialogRef = { close: vi.fn() };
const mockUserStore = { isAuthenticated: signal(false) };
const mockUserService = { updateLanguage: vi.fn().mockReturnValue(of({})) };
const mockTranslate = { use: vi.fn(), currentLang: 'en' };

describe('LanguageSelectComponent', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: DialogRef, useValue: mockDialogRef },
        { provide: UserStore, useValue: mockUserStore },
        { provide: UserService, useValue: mockUserService },
        { provide: TranslateService, useValue: mockTranslate },
      ],
    });
  });

  it('should create', () => {
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    expect(component).toBeTruthy();
  });

  it('should expose language entries', () => {
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    expect(component.languageEntries.length).toBeGreaterThan(0);
    expect(component.languageEntries[0]).toHaveProperty('key');
    expect(component.languageEntries[0]).toHaveProperty('value');
  });

  it('switchLanguage() should call translate.use with the new lang', async () => {
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    await component.switchLanguage('et');
    expect(mockTranslate.use).toHaveBeenCalledWith('et');
  });

  it('switchLanguage() should close the dialog', async () => {
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    await component.switchLanguage('et');
    expect(mockDialogRef.close).toHaveBeenCalled();
  });

  it('switchLanguage() should call updateLanguage when user is authenticated', async () => {
    mockUserStore.isAuthenticated.set(true);
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    await component.switchLanguage('et');
    expect(mockUserService.updateLanguage).toHaveBeenCalledWith('et');
  });

  it('switchLanguage() should not call updateLanguage when user is not authenticated', async () => {
    mockUserStore.isAuthenticated.set(false);
    const component = TestBed.runInInjectionContext(() => new LanguageSelectComponent());
    await component.switchLanguage('et');
    expect(mockUserService.updateLanguage).not.toHaveBeenCalled();
  });
});

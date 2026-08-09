import { vi, describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { provideRouter } from '@angular/router';
import { Component } from '@angular/core';
import { NO_ERRORS_SCHEMA } from '@angular/core';
import { ComponentFixture } from '@angular/core/testing';
import { TranslateModule } from '@ngx-translate/core';
import { ShellComponent } from './shell.component';
import { ConfigStore } from '../../state/config.store';
import { UiStateService } from '../../services/ui-state.service';

@Component({ template: '', standalone: true })
class EmptyComponent {}

const mockConfigStore = { isDarkTheme: signal(false) };
const mockUiState = { 
  accessibilityClasses: signal(''),
  showHelp: signal(false),
  showFeedback: signal(false),
  showOnboarding: signal(false),
  showAccessibility: signal(false)
};

describe('ShellComponent', () => {
  let component: ShellComponent;
  let fixture: ComponentFixture<ShellComponent>;

  beforeEach(async () => {
    vi.clearAllMocks();
    await TestBed.configureTestingModule({
      imports: [ShellComponent, TranslateModule.forRoot()],
      providers: [
        provideRouter([{ path: '**', component: EmptyComponent }]),
        { provide: ConfigStore, useValue: mockConfigStore },
        { provide: UiStateService, useValue: mockUiState },
      ],
    })
      .overrideComponent(ShellComponent, { set: { imports: [], schemas: [NO_ERRORS_SCHEMA] } })
      .compileComponents();

    fixture = TestBed.createComponent(ShellComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => expect(component).toBeTruthy());

  it('should expose configStore and uiState', () => {
    expect(component.configStore).toBe(mockConfigStore);
    expect(component.uiState).toBe(mockUiState);
  });

  it('should apply dark-theme class when isDarkTheme is true', () => {
    mockConfigStore.isDarkTheme.set(true);
    fixture.detectChanges();
    expect(fixture.nativeElement.querySelector('#content_root').classList).toContain('dark-theme');
  });
});

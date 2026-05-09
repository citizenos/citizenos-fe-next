import 'reflect-metadata';
import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideZonelessChangeDetection, importProvidersFrom } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { TranslateModule } from '@ngx-translate/core';
import { beforeEach } from 'vitest';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// ... production config
beforeEach(() => {
  getTestBed().configureTestingModule({
    providers: [
      provideZonelessChangeDetection(),
      provideAnimationsAsync(),
      importProvidersFrom(TranslateModule.forRoot())
    ],
  });
});

// Mock ResizeObserver
(globalThis as any).ResizeObserver = class {
  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
};

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
// eslint-disable-next-line @typescript-eslint/no-explicit-any
(globalThis as any).ResizeObserver = class {
  observe() { return; }
  unobserve() { return; }
  disconnect() { return; }
};

// Mock Range.getBoundingClientRect for CodeMirror in JSDOM
if (typeof document !== 'undefined' && document.createRange) {
  const OriginalRange = document.createRange;
  document.createRange = function (...args: any[]) {
    const range = OriginalRange.apply(document, args);
    range.getBoundingClientRect = function () {
      return { width: 0, height: 0, top: 0, left: 0, right: 0, bottom: 0 } as DOMRect;
    };
    range.getClientRects = function () {
      return { length: 0, item: () => null } as any;
    };
    return range;
  };
}

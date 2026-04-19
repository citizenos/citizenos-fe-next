import { getTestBed } from '@angular/core/testing';
import {
  BrowserTestingModule,
  platformBrowserTesting,
} from '@angular/platform-browser/testing';
import { provideZonelessChangeDetection } from '@angular/core';
import { beforeEach } from 'vitest';

getTestBed().initTestEnvironment(
  BrowserTestingModule,
  platformBrowserTesting(),
);

// Ensure zoneless change detection matches production config so
// signal inputs (input.required) behave identically in tests.
beforeEach(() => {
  getTestBed().configureTestingModule({
    providers: [provideZonelessChangeDetection()],
  });
});

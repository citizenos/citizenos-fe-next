import { describe, it, expect, beforeEach } from 'vitest';
import { TestBed } from '@angular/core/testing';
import { SafeHtmlPipe } from './safe-html.pipe';
import { BrowserModule } from '@angular/platform-browser';

describe('SafeHtmlPipe', () => {
  let pipe: SafeHtmlPipe;

  beforeEach(() => {
    TestBed.configureTestingModule({ imports: [BrowserModule] });
    pipe = TestBed.runInInjectionContext(() => new SafeHtmlPipe());
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should return a SafeValue for HTML input', () => {
    const result = pipe.transform('<b>Hello</b>');
    expect(result).toBeDefined();
    expect(typeof result).not.toBe('string');
  });
});

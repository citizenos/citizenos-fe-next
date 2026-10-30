import { describe, it, expect, beforeEach } from 'vitest';
import {
  loadExternalScript,
  loadExternalStylesheet,
  resetLoadedScriptsForTest,
} from './script-loader';

describe('loadExternalScript', () => {
  beforeEach(() => {
    resetLoadedScriptsForTest();
    document.querySelectorAll('script[data-test-script]').forEach(el => el.remove());
  });

  it('should append a script tag to document.body and resolve on load', async () => {
    const src = 'assets/libs/test-script.js';
    const promise = loadExternalScript(src);
    const scriptEl = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    expect(scriptEl).toBeTruthy();
    expect(scriptEl.async).toBe(true);

    scriptEl.dispatchEvent(new Event('load'));
    await expect(promise).resolves.toBeUndefined();
    expect(scriptEl.dataset['loaded']).toBe('true');
    scriptEl.remove();
  });

  it('should reuse in-flight promise for duplicate calls with same src', async () => {
    const src = 'assets/libs/test-dup.js';
    const p1 = loadExternalScript(src);
    const p2 = loadExternalScript(src);
    expect(p1).toBe(p2);

    const scriptEl = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    scriptEl.dispatchEvent(new Event('load'));
    await p1;
    scriptEl.remove();
  });

  it('should reject and clear cache when script fails to load', async () => {
    const src = 'assets/libs/test-err.js';
    const promise = loadExternalScript(src);
    const scriptEl = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement;
    scriptEl.dispatchEvent(new Event('error'));
    await expect(promise).rejects.toThrow(`Failed to load script: ${src}`);
    scriptEl.remove();
  });

  it('should append a stylesheet link to document.head only once', () => {
    const href = '/assets/styles/easymde.css';
    loadExternalStylesheet(href);
    loadExternalStylesheet(href);
    const links = document.querySelectorAll(`link[rel="stylesheet"][href="${href}"]`);
    expect(links.length).toBe(1);
    links.forEach(el => el.remove());
  });
});

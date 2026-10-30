const loadedScripts = new Map<string, Promise<void>>();

export function loadExternalScript(src: string): Promise<void> {
  if (typeof document === 'undefined') {
    return Promise.resolve();
  }
  const existingPromise = loadedScripts.get(src);
  if (existingPromise) {
    return existingPromise;
  }
  const existingEl = document.querySelector(`script[src="${src}"]`) as HTMLScriptElement | null;
  if (existingEl?.dataset['loaded'] === 'true') {
    return Promise.resolve();
  }

  const promise = new Promise<void>((resolve, reject) => {
    const script = existingEl ?? document.createElement('script');
    script.type = 'text/javascript';
    script.src = src;
    script.async = true;
    script.onload = () => {
      script.dataset['loaded'] = 'true';
      resolve();
    };
    script.onerror = () => {
      loadedScripts.delete(src);
      reject(new Error(`Failed to load script: ${src}`));
    };
    if (!existingEl) {
      document.body.appendChild(script);
    }
  });

  loadedScripts.set(src, promise);
  return promise;
}

export function loadExternalStylesheet(href: string): void {
  if (typeof document === 'undefined') {
    return;
  }
  if (document.querySelector(`link[rel="stylesheet"][href="${href}"]`)) {
    return;
  }
  const link = document.createElement('link');
  link.rel = 'stylesheet';
  link.href = href;
  document.head.appendChild(link);
}

export function resetLoadedScriptsForTest(): void {
  loadedScripts.clear();
}

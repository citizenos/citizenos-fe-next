import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

interface ConfigState {
  language: string;
  theme: 'light' | 'dark';
  api: {
    baseUrl: string;
  };
  etherpad: {
    baseUrl: string;
  };
}

const initialState: ConfigState = {
  language: 'en',
  theme: 'light',
  api: {
    baseUrl: 'https://dev.api.citizenos.com:3003'
  },
  etherpad: {
    baseUrl: 'https://dev.p.citizenos.com:9001'
  }
};

export const ConfigStore = signalStore(
  { providedIn: 'root' },
  withState(initialState),
  withComputed((store) => ({
    isDarkTheme: computed(() => store.theme() === 'dark'),
  })),
  withMethods((store) => {
    const translate = inject(TranslateService);

    return {
      setLanguage(lang: string) {
        patchState(store, { language: lang });
        translate.use(lang);
      },
      toggleTheme() {
        patchState(store, { theme: store.theme() === 'light' ? 'dark' : 'light' });
      }
    };
  })
);

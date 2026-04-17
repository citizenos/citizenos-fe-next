import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

interface ConfigState {
  language: string;
  theme: 'light' | 'dark';
}

const initialState: ConfigState = {
  language: 'en',
  theme: 'light',
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

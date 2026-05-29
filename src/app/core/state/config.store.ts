import { computed, inject } from '@angular/core';
import { signalStore, withState, withMethods, patchState, withComputed } from '@ngrx/signals';
import { TranslateService } from '@ngx-translate/core';

export type FontSize = 'medium' | 'large' | 'extra_large';

interface ConfigState {
  language: string;
  theme: 'light' | 'dark';
  fontSize: FontSize;
  showIssueNotification: boolean;
  api: {
    baseUrl: string;
  };
  etherpad: {
    baseUrl: string;
  };
  links: {
    help: Record<string, string>;
    faq: Record<string, string>;
    about: string;
    donate: Record<string, string>;
  };
  attachments: {
    dropbox: { appKey: string; };
    oneDrive: { clientId: string; };
    googleDrive: { developerKey: string; clientId: string; appId: string; };
  };
  plausible: { domain: string; api: string; };
  socialMentions: { systemNotificationEmail: string; };
}

const initialState: ConfigState = {
  language: 'en',
  theme: 'light',
  fontSize: 'medium',
  showIssueNotification: false,
  api: {
    baseUrl: 'https://dev.api.citizenos.com:3003'
  },
  etherpad: {
    baseUrl: 'https://dev.p.citizenos.com:9001'
  },
  links: {
    help: {
      en: 'https://app.citizenos.com/en/topics/c6b6d06a-e8cf-4297-9654-8c1cf01b133b',
      et: 'https://app.citizenos.com/en/topics/fd8c4e13-6c5f-4423-9408-cf97c30727d7',
      ru: 'https://app.citizenos.com/en/topics/bd15b9e8-7de4-42c2-a394-78ed95a735cd'
    },
    faq: {
      en: 'https://citizenos.com/faq/',
      et: 'https://citizenos.com/et/kkk/'
    },
    about: 'https://citizenos.com/platform/',
    donate: {
      en: 'https://citizenos.com/donate/',
      et: 'https://citizenos.com/et/toeta/',
      ru: 'https://citizenos.com/ru/pomoch-proektu/'
    }
  },
  attachments: {
    dropbox: { appKey: '' },
    oneDrive: { clientId: '' },
    googleDrive: { developerKey: '', clientId: '', appId: '' }
  },
  plausible: { domain: '', api: '' },
  socialMentions: { systemNotificationEmail: '' }
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
      },
      setFontSize(size: FontSize) {
        patchState(store, { fontSize: size });
      }
    };
  })
);

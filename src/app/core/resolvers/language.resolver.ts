import { inject } from '@angular/core';
import { ResolveFn, Router } from '@angular/router';
import { ConfigStore } from '../state/config.store';

// Define supported languages as in the legacy app
export const SUPPORTED_LANGUAGES = ['en', 'et', 'ru', 'lv', 'lt']; // Add more if necessary

export const languageResolver: ResolveFn<string> = (route) => {
  const configStore = inject(ConfigStore);
  const router = inject(Router);
  
  const lang = route.paramMap.get('lang');

  if (lang && SUPPORTED_LANGUAGES.includes(lang)) {
    // Update the config store with the selected language
    configStore.setLanguage(lang);
    return lang;
  }

  // If the language is unsupported, fallback to 'en'
  // and manually navigate away or throw an error
  router.navigate(['/en/404'], { skipLocationChange: true });
  return 'en';
};

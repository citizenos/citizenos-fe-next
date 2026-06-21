import { ApplicationConfig, provideBrowserGlobalErrorListeners, provideZonelessChangeDetection, provideAppInitializer, inject } from '@angular/core';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import { provideHttpClient } from '@angular/common/http';
import { provideRouter } from '@angular/router';
import { provideTranslateService, provideTranslateCompiler, MissingTranslationHandler } from '@ngx-translate/core';
import { provideTranslateHttpLoader } from '@ngx-translate/http-loader';

import { routes } from './app.routes';
import { JSONPointerCompiler } from './core/translate/json-pointer.compiler';
import { CosMissingTranslationHandler } from './core/translate/missing-translation.handler';
import { UserStore } from './core/state/user.store';
import { ConfigStore } from './core/state/config.store';
import { lastValueFrom } from 'rxjs';
import { HttpClient } from '@angular/common/http';

export const appConfig: ApplicationConfig = {
  providers: [
    provideAnimationsAsync(),
    provideZonelessChangeDetection(),
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(),
    provideTranslateService({
      fallbackLang: 'en',
      missingTranslationHandler: {
        provide: MissingTranslationHandler,
        useClass: CosMissingTranslationHandler
      }
    }),
    provideTranslateHttpLoader(),
    provideTranslateCompiler(JSONPointerCompiler),
    provideAppInitializer(async () => {
      const userStore = inject(UserStore);
      const configStore = inject(ConfigStore);
      const http = inject(HttpClient);
      try {
        const config = await lastValueFrom(http.get<any>('assets/config/config.json'));
        configStore.loadConfig(config);
      } catch (err) {
        console.error('Failed to load config.json', err);
      }
      return userStore.checkStatus();
    })
  ]
};

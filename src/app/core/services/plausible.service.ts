import { Injectable, inject, isDevMode } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { take } from 'rxjs';
import { ConfigStore } from '../state/config.store';

@Injectable({
  providedIn: 'root'
})
export class PlausibleService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  /**
   * Post a custom event to Plausible
   * @param data Event data (e.g., { name: 'signup', props: { method: 'google' } })
   */
  post(data: { name: string; props?: Record<string, string | number | boolean | null> }) {
    const plausibleConfig = this.configStore.plausible();
    if (!plausibleConfig?.api) return;

    const path = `${plausibleConfig.api}/api/event`;
    const domain = plausibleConfig.domain || window.location.hostname;

    const postData = {
      domain: domain,
      url: window.location.href,
      ...data
    };

    return this.http.post(path, postData, { responseType: 'json', observe: 'body' })
      .pipe(take(1))
      .subscribe({
        next: (res) => {
          if (isDevMode()) {
            console.log('Plausible event tracked:', res);
          }
        },
        error: (err) => {
          console.error('Plausible tracking error:', err);
        }
      });
  }
}

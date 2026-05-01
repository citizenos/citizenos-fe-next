import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class GlobalSearchService {
  showSearch = signal(false);
}

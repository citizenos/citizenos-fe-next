import { Service, signal } from '@angular/core';

@Service()
export class GlobalSearchService {
  showSearch = signal(false);
}

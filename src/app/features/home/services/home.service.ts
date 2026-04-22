import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { ConfigStore } from '../../../core/state/config.store';

export interface PlatformStats {
  ideasProposed: number;
  topicsCreated: number;
  votesCast: number;
  usersCreated: number;
}

@Injectable({
  providedIn: 'root'
})
export class HomeService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  getStats(): Observable<PlatformStats> {
    const url = `${this.configStore.api.baseUrl()}/api/stats`;
    return this.http.get<{ data: PlatformStats }>(url, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }
}

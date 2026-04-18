import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigStore } from '../state/config.store';
import { map, Observable } from 'rxjs';
import { User } from '../interfaces/user';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  status(): Observable<User | null> {
    return this.http.get<any>(`${this.apiUrl}/api/auth/status`, {
      withCredentials: true
    }).pipe(
      map(res => res.data || null)
    );
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/login`, {
      email,
      password
    }, {
      withCredentials: true
    });
  }

  logout(): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/logout`, {}, {
      withCredentials: true
    });
  }

  signUp(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/signup`, data);
  }

  getPartnerLoginUrl(partnerId: string, redirectSuccess?: string): string {
    let url = `${this.apiUrl}/api/auth/${partnerId}`;
    if (redirectSuccess) {
      url += `?redirectSuccess=${encodeURIComponent(redirectSuccess)}`;
    } else {
      url += `?redirectSuccess=${encodeURIComponent(window.location.origin + '/')}`;
    }
    return url;
  }
}

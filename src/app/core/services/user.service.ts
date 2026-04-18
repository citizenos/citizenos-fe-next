import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigStore } from '../state/config.store';
import { map, Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { UploadService } from './upload.service';

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private uploadService = inject(UploadService);

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

  sendPasswordReset(email: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/password/reset/send`, { email });
  }

  resetPassword(password: string, passwordResetToken: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/password/reset`, {
      password,
      passwordResetToken
    });
  }

  // Mobiil-ID
  loginMobiilIdInit(pid: string, phoneNumber: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/mobile/init`, { pid, phoneNumber });
  }

  loginMobiilIdStatus(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/auth/mobile/status`, { params: { token } });
  }

  // Smart-ID
  loginSmartIdInit(pid: string, countryCode: string): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/smartid/init`, { pid, countryCode });
  }

  loginSmartIdStatus(token: string): Observable<any> {
    return this.http.get(`${this.apiUrl}/api/auth/smartid/status`, { params: { token } });
  }

  // ID-card
  loginIdCard(data: any): Observable<any> {
    return this.http.post(`${this.apiUrl}/api/auth/id`, data);
  }

  update(params: {
    name?: string;
    email?: string;
    password?: string;
    company?: string;
    imageUrl?: string;
    preferences?: any;
    language?: string;
    newPassword?: string;
  }): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/users/self`, {
      ...params,
      redirectSuccess: window.location.origin + '/'
    }, { withCredentials: true });
  }

  updateLanguage(language: string): Observable<any> {
    return this.http.put(`${this.apiUrl}/api/users/self`, { language }, { withCredentials: true });
  }

  deleteUser(): Observable<any> {
    return this.http.delete(`${this.apiUrl}/api/users/self`, { withCredentials: true });
  }

  uploadUserImage(file: File): Observable<any> {
    const path = `${this.apiUrl}/api/users/self/upload`;
    return this.uploadService.upload(path, file);
  }
}

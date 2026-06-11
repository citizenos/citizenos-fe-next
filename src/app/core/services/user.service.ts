import { inject, Service } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ConfigStore } from '../state/config.store';
import { map, Observable } from 'rxjs';
import { User } from '../interfaces/user';
import { UploadService } from './upload.service';
import { ApiResponse } from '../interfaces/api-response';

export interface UserConnection {
  id: string;
  userId: string;
  connectionId: string;
  [key: string]: unknown;
}

@Service()
export class UserService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private uploadService = inject(UploadService);

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  status(): Observable<User | null> {
    return this.http.get<ApiResponse<User>>(`${this.apiUrl}/api/auth/status`, {
      withCredentials: true
    }).pipe(
      map(res => res.data || null)
    );
  }

  login(email: string, password: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/login`, {
      email,
      password
    }, {
      withCredentials: true
    });
  }

  logout(): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/logout`, {}, {
      withCredentials: true
    });
  }

  signUp(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/signup`, data, { withCredentials: true });
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

  sendPasswordReset(email: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/password/reset/send`, { email });
  }

  resetPassword(password: string, passwordResetToken: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/password/reset`, {
      password,
      passwordResetToken
    });
  }

  // Mobiil-ID
  loginMobiilIdInit(pid: string, phoneNumber: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/mobile/init`, { pid, phoneNumber }, { withCredentials: true });
  }

  loginMobiilIdStatus(token: string): Observable<unknown> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/mobile/status`, { params: { token }, withCredentials: true });
  }

  // Smart-ID
  loginSmartIdInit(pid: string, countryCode: string): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/smartid/init`, { pid, countryCode }, { withCredentials: true });
  }

  loginSmartIdStatus(token: string): Observable<unknown> {
    return this.http.get<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/smartid/status`, { params: { token }, withCredentials: true });
  }

  // ID-card
  loginIdCard(data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(`${this.apiUrl}/api/auth/id`, data, { withCredentials: true });
  }

  update(params: {
    name?: string;
    email?: string;
    password?: string;
    company?: string;
    imageUrl?: string;
    preferences?: Record<string, unknown>;
    language?: string;
    newPassword?: string;
  }): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(`${this.apiUrl}/api/users/self`, {
      ...params,
      redirectSuccess: window.location.origin + '/'
    }, { withCredentials: true });
  }

  updateLanguage(language: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(`${this.apiUrl}/api/users/self`, { language }, { withCredentials: true });
  }

  deleteUser(): Observable<unknown> {
    return this.http.delete<ApiResponse<unknown>>(`${this.apiUrl}/api/users/self`, { withCredentials: true });
  }

  updateTermsVersion(termsVersion: string): Observable<unknown> {
    return this.http.put<ApiResponse<unknown>>(`${this.apiUrl}/api/users/self`, { termsVersion }, { withCredentials: true });
  }

  listUserConnections(userId: string): Observable<UserConnection[]> {
    return this.http.get<ApiResponse<UserConnection[]>>(`${this.apiUrl}/api/users/${userId}/userconnections`, { withCredentials: true }).pipe(
      map(res => res.data)
    );
  }

  uploadUserImage(file: File): Observable<unknown> {
    const path = `${this.apiUrl}/api/users/self/upload`;
    return this.uploadService.upload(path, file);
  }
}

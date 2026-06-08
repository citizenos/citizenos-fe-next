import { Service, inject  } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicReport {
  id: string;
  topicId: string;
  type: string;
  text: string;
  moderatedReasonType?: string;
  moderatedReasonText?: string;
  status?: string;
}

@Service()
export class TopicReportService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  private get baseUrl() {
    return this.configStore.api.baseUrl();
  }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.baseUrl}${prefix}${path}`;
  }

  public readonly TYPES = {
    abuse: 'abuse',
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  loadItems(topicId: string, params: Record<string, string> = {}): Observable<TopicReport[]> {
    return this.http.get<ApiResponse<TopicReport[]>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/reports`),
      { withCredentials: true, params }
    ).pipe(map(res => res.data ?? []));
  }

  get(topicId: string, reportId: string): Observable<TopicReport> {
    return this.http.get<ApiResponse<TopicReport>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/reports/${reportId}`),
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  save(data: { topicId: string; type: string; text: string }): Observable<TopicReport> {
    return this.http.post<ApiResponse<TopicReport>>(
      this.getAbsoluteUrlApi(`/topics/${data.topicId}/reports`),
      data,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  moderate(topicId: string, reportId: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/reports/${reportId}/moderate`),
      data,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  review(topicId: string, reportId: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/reports/${reportId}/review`),
      data,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }

  resolve(topicId: string, reportId: string, data: Record<string, unknown>): Observable<unknown> {
    return this.http.post<ApiResponse<unknown>>(
      this.getAbsoluteUrlApi(`/topics/${topicId}/reports/${reportId}/resolve`),
      data,
      { withCredentials: true }
    ).pipe(map(res => res.data));
  }
}

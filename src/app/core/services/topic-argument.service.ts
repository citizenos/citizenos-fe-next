import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, EMPTY, BehaviorSubject } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Argument, ArgumentCount, ArgumentReport } from '../interfaces/discussion';

export interface TopicArgumentParams extends ListParams {
  topicId?: string | null;
  discussionId?: string | null;
  types?: string | string[] | null;
  sortOrder?: string | null;
}

interface ArgumentListResponse {
  rows: Argument[];
  count: ArgumentCount;
  countTotal: number;
}

type ParamValue = string | number | boolean | null | undefined | Record<string, unknown> | Date;

@Injectable({
  providedIn: 'root'
})
export class TopicArgumentService extends ItemsListService<TopicArgumentParams, Argument> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  readonly ARGUMENT_TYPES = {
    pro: 'pro',
    con: 'con',
    poi: 'poi',
    reply: 'reply'
  };

  readonly ARGUMENT_TYPES_MAXLENGTH = {
    pro: 2048,
    con: 2048,
    poi: 2048,
    reply: 2048
  };

  readonly ARGUMENT_REPORT_TYPES = {
    abuse: 'abuse',
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  readonly ARGUMENT_SUBJECT_MAXLENGTH = 128;
  readonly ARGUMENT_VERSION_SEPARATOR = '_v';

  public loadArguments$ = new Subject<void>();
  public count = new BehaviorSubject<ArgumentCount>({ total: 0, pro: 0, con: 0, poi: 0, reply: 0 });

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  constructor() {
    super();
    this.setDefaults({ limit: 10, offset: 0, orderBy: 'createdAt', order: 'DESC' });
  }

  override getItems(params: TopicArgumentParams): Observable<{ rows: Argument[]; countTotal: number }> {
    return this.query(params).pipe(
      map(res => ({
        rows: res.data?.rows ?? [],
        countTotal: res.data?.count?.total ?? 0
      }))
    );
  }

  query(params: TopicArgumentParams): Observable<ApiResponse<{ rows: Argument[]; count: ArgumentCount }>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const val = (params as any)[key];
      if (val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          val.forEach(v => httpParams = httpParams.append(key, String(v)));
        } else {
          httpParams = httpParams.set(key, String(val));
        }
      }
    });

    if (!params.topicId || !params.discussionId) {
      return EMPTY;
    }
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/discussions/${params.discussionId}/comments`);
    return this.http.get<ApiResponse<{ rows: Argument[]; count: ArgumentCount }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' });
  }

  getArguments(params?: TopicArgumentParams): Observable<ArgumentListResponse> {
    return this.query(params ?? this.params.value).pipe(
      map((res: ApiResponse<{ rows: Argument[]; count: ArgumentCount }>) => {
        if (res.data?.count) {
          this.count.next(res.data.count);
        }
        return {
          rows: res.data?.rows ?? [],
          count: res.data?.count ?? { total: 0, pro: 0, con: 0, poi: 0, reply: 0 },
          countTotal: res.data?.count?.total ?? 0
        };
      })
    );
  }

  get(data: { topicId: string; discussionId: string; commentId: string }): Observable<Argument> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}`);
    return this.http.get<ApiResponse<Argument>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: { topicId: string; discussionId: string; [key: string]: ParamValue }): Observable<Argument> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments`, true);
    return this.http.post<ApiResponse<Argument>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: { topicId: string; discussionId: string; commentId: string; [key: string]: ParamValue }): Observable<Argument> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}`, true);
    return this.http.put<ApiResponse<Argument>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: { topicId: string; discussionId: string; commentId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  vote(data: { topicId: string; discussionId: string; commentId: string; value: number }): Observable<Argument['votes']> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}/votes`, true);
    return this.http.post<ApiResponse<Argument['votes']>>(path, { value: data.value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  votes(data: { topicId: string; discussionId: string; commentId?: string; id?: string; [key: string]: ParamValue }): Observable<{ rows: { id: string; name: string; value: number; imageUrl?: string | null }[]; count: number }> {
    const commentId = data.commentId || data.id;
    let httpParams = new HttpParams();
    Object.keys(data).forEach(key => {
      const val = (data as Record<string, ParamValue>)[key];
      if (key !== 'topicId' && key !== 'discussionId' && key !== 'commentId' && key !== 'id' && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/votes`);
    return this.http.get<ApiResponse<{ rows: { id: string; name: string; value: number; imageUrl?: string | null }[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  moderate(data: { topicId: string; discussionId: string; commentId: string; [key: string]: any }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}/moderate`, true);
    return this.http.post<ApiResponse<unknown>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  report(data: { topicId: string; discussionId: string; commentId?: string; id?: string; type: string; text?: string }): Observable<ArgumentReport> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/reports`, true);
    return this.http.post<ApiResponse<ArgumentReport>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getReport(params: { topicId: string; commentId: string; reportId: string; token?: string }): Observable<ArgumentReport> {
    let httpParams = new HttpParams();
    if (params.token) httpParams = httpParams.set('token', params.token);
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/comments/${params.commentId}/reports/${params.reportId}`, true);
    return this.http.get<ApiResponse<ArgumentReport>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getArgumentIdWithVersion(argumentId: string, version: number): string {
    return argumentId + this.ARGUMENT_VERSION_SEPARATOR + version;
  }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/comments')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }
}

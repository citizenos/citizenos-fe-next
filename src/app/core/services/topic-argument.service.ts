import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay, combineLatest, switchMap, catchError, EMPTY, distinct } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
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

  readonly ARGUMENT_TYPES = {
    pro: 'pro',
    con: 'con',
    poi: 'poi',
    reply: 'reply'
  };

  readonly ARGUMENT_SUBJECT_MAXLENGTH = 128;
  readonly ARGUMENT_TYPES_MAXLENGTH: { pro: number; con: number; poi: number; reply: number; [key: string]: number } = {
    'pro': 2048,
    'con': 2048,
    'poi': 2048,
    'reply': 2048
  };

  readonly ARGUMENT_REPORT_TYPES = {
    abuse: 'abuse',
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  readonly ARGUMENT_ORDER_BY = {
    popularity: 'popularity',
    date: 'date'
  };

  readonly ARGUMENT_VERSION_SEPARATOR = '_v';

  ArgumentIds: string[] = [];

  count = new BehaviorSubject<ArgumentCount>({
    total: 0,
    con: 0,
    pro: 0,
    poi: 0,
    reply: 0
  });

  public loadArguments$ = new Subject<void>();

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadArguments() {
    return this.loadArguments$.pipe(
      exhaustMap(() => this.loadItems()),
      shareReplay(1)
    );
  }

  override getItems(params: TopicArgumentParams): Observable<ArgumentListResponse> {
    return this.getArguments(params);
  }

  query(params: TopicArgumentParams): Observable<ApiResponse<{ rows: Argument[]; count: ArgumentCount }>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const val = (params as unknown as Record<string, ParamValue>)[key];
      if (key !== 'topicId' && key !== 'discussionId' && val !== null && val !== undefined) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    if (!params.topicId || !params.discussionId) {
      return EMPTY;
    }
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/discussions/${params.discussionId}/comments`);
    return this.http.get<ApiResponse<{ rows: Argument[]; count: ArgumentCount }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' });
  }

  getArguments(params?: TopicArgumentParams): Observable<ArgumentListResponse> {
    return this.query(params ?? this.params.value).pipe(
      map((res: ApiResponse<{ rows: Argument[]; count: ArgumentCount }>) => {
        if (res.data?.count) {
          this.count.next(res.data.count);
        }
        this.ArgumentIds = [];
        const rows = res.data?.rows || [];
        rows.forEach((argument: Argument) => {
          this.ArgumentIds.push(argument.id);
          if (argument.replies?.count) {
            argument.replies.rows.forEach((reply: Argument) => this.ArgumentIds.push(reply.id));
          }
        });

        const countData = res.data?.count || { total: 0, pro: 0, con: 0, poi: 0, reply: 0 };
        return {
          rows: rows,
          count: countData,
          countTotal: ((countData.total || 0) - (countData.reply || 0)) || 0
        };
      }),
      distinct(),
      catchError(() => EMPTY)
    );
  }

  override loadItems(): Observable<Argument[]> {
    return combineLatest([this.page, this.params]).pipe(
      shareReplay(1),
      switchMap(([page, paramsValue]) => {
        const offset = (page - 1) * paramsValue.limit;
        return this.getItems({ ...paramsValue, offset });
      }),
      map((res: ArgumentListResponse) => {
        const paramsValue = this.params.value;
        this.countTotal.next(res.countTotal || res.count?.total || 0);
        if (paramsValue.types?.length) {
          let totalCount = 0;
          const types = (!Array.isArray(paramsValue.types)) ? [paramsValue.types] : paramsValue.types;
          types.forEach((type: string) => totalCount += ((res.count as unknown as Record<string, number>)?.[type] || 0));
          this.countTotal.next(totalCount);
        }

        const limit = paramsValue.limit;
        const total = Math.ceil(this.countTotal.value / limit);
        this.totalPages.next(total);

        const currentPage = this.page.value;
        this.hasMore.next(total > 0 && currentPage < total);

        return Array.isArray(res.rows) ? res.rows : Array.from(res.rows || []);
      })
    );
  }

  save(data: { topicId: string; discussionId: string; [key: string]: ParamValue }): Observable<Argument> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments`);
    return this.http.post<ApiResponse<Argument>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: { topicId: string; discussionId: string; commentId?: string; id?: string; [key: string]: ParamValue }): Observable<Argument> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}`);
    return this.http.put<ApiResponse<Argument>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: { topicId: string; discussionId: string; commentId?: string; id?: string }): Observable<unknown> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  vote(data: { topicId: string; discussionId: string; commentId?: string; id?: string; value: number }): Observable<Argument['votes']> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/votes`);
    return this.http.post<ApiResponse<Argument['votes']>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
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

    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/votes`);
    return this.http.get<ApiResponse<{ rows: { id: string; name: string; value: number; imageUrl?: string | null }[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  report(data: { topicId: string; discussionId: string; commentId?: string; id?: string; type: string; text?: string }): Observable<ArgumentReport> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/reports`);
    return this.http.post<ApiResponse<ArgumentReport>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getReport(data: { topicId: string; commentId: string; reportId: string; token: string }): Observable<ArgumentReport> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/comments/${data.commentId}/reports/${data.reportId}`);
    return this.http.get<ApiResponse<ArgumentReport>>(path, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  moderate(data: { token: string; topicId: string; discussionId: string; commentId: string; reportId: string; report: { type: string; text: string } }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/discussions/${data.discussionId}/comments/${data.commentId}/reports/${data.reportId}/moderate`);
    return this.http.post<ApiResponse<unknown>>(path, data.report, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  getArgumentIdWithVersion(argumentId: string, version: number): string {
    return argumentId + this.ARGUMENT_VERSION_SEPARATOR + version;
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}

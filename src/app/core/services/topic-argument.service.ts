import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay, combineLatest, switchMap, catchError, EMPTY, distinct } from 'rxjs';
import { BehaviorSubject } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

export interface TopicArgumentParams extends ListParams {
  topicId?: string | null;
  discussionId?: string | null;
  types?: string | string[] | null;
  sortOrder?: string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TopicArgumentService extends ItemsListService<TopicArgumentParams> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);

  readonly ARGUMENT_TYPES = {
    pro: 'pro',
    con: 'con',
    poi: 'poi',
    reply: 'reply'
  };

  readonly ARGUMENT_SUBJECT_MAXLENGTH = 128;
  readonly ARGUMENT_TYPES_MAXLENGTH: any = {
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

  count = new BehaviorSubject({
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

  override getItems(params: TopicArgumentParams): Observable<any> {
    return this.getArguments(params);
  }

  query(params: any): Observable<ApiResponse<any>> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (key !== 'topicId' && key !== 'discussionId' && params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, params[key]);
      }
    });

    if (!params.topicId || !params.discussionId) {
      return EMPTY;
    }
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/discussions/${params.discussionId}/comments`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' });
  }

  getArguments(params?: any): Observable<any> {
    return this.query(params).pipe(
      map((res: any) => {
        if (res.data?.count) {
          this.count.next(res.data.count);
        }
        this.ArgumentIds = [];
        const rows = res.data?.rows || [];
        rows.forEach((argument: any) => {
          this.ArgumentIds.push(argument.id)
          if (argument.replies?.count) {
            argument.replies.rows.forEach((reply: any) => this.ArgumentIds.push(reply.id))
          }
        });
        
        const countData = res.data?.count || {};
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

  override loadItems(): Observable<any[]> {
    return combineLatest([this.page, this.params]).pipe(
      shareReplay(1),
      switchMap(([page, paramsValue]) => {
        const offset = (page - 1) * paramsValue.limit;
        return this.getItems({ ...paramsValue, offset });
      }),
      map((res: any) => {
        const paramsValue: any = this.params.value;
        this.countTotal.next(res.countTotal || res.count || 0);
        if (paramsValue.types?.length) {
          let totalCount = 0;
          let types = (!Array.isArray(paramsValue.types)) ? [paramsValue.types] : paramsValue.types;
          types.forEach((type: string) => totalCount += (res.count?.[type] || 0));
          this.countTotal.next(totalCount);
        }
        
        const limit = paramsValue.limit;
        const total = Math.ceil(this.countTotal.value / limit);
        this.totalPages.next(total);
        
        const currentPage = this.page.value;
        this.hasMore.next(total > 0 && currentPage < total);
        
        return Array.isArray(res.rows) ? res.rows : Array.from<any>(res.rows || []);
      })
    );
  }

  save(data: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: any): Observable<any> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}`);
    return this.http.put<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: any): Observable<any> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  vote(data: any): Observable<any> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/votes`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  votes(data: any): Observable<any> {
    const commentId = data.commentId || data.id;
    let httpParams = new HttpParams();
    Object.keys(data).forEach(key => {
      if (key !== 'topicId' && key !== 'discussionId' && key !== 'commentId' && key !== 'id' && data[key] !== null) {
        httpParams = httpParams.set(key, data[key]);
      }
    });

    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/votes`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  report(data: any): Observable<any> {
    const commentId = data.commentId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/discussions/${data.discussionId}/comments/${commentId}/reports`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getArgumentIdWithVersion(argumentId: string, version: number): string {
    return argumentId + this.ARGUMENT_VERSION_SEPARATOR + version;
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}

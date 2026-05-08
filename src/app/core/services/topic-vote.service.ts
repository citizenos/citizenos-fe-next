import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, exhaustMap, shareReplay, Subject, map, tap } from 'rxjs';

import { Topic } from '../interfaces/topic';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class TopicVoteService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private topicService = inject(TopicService);

  readonly VOTE_TYPES = {
    regular: 'regular',
    multiple: 'multiple'
  };

  readonly VOTE_AUTH_TYPES = {
    soft: 'soft',
    hard: 'hard'
  };

  readonly STATUSES = this.topicService.STATUSES;

  public loadVote$ = new Subject<void>();

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadVote(params?: any): Observable<any> {
    return this.loadVote$.pipe(
      exhaustMap(() => this.get(params)),
      shareReplay(1)
    );
  }

  reloadVote(): void {
    this.loadVote$.next();
  }

  query(params: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/votes`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  get(params?: any): Observable<any> {
    const voteId = params?.voteId || params?.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params?.topicId}/votes/${voteId}`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: any): Observable<any> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);
    return this.http.put<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: any): Observable<any> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  cast(data: any): Observable<any> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);

    return this.http.post<any>(path, data, { withCredentials: true, observe: 'response', responseType: 'json' })
      .pipe(
        tap((res: any) => {
          if (res.status === 205) {
            window.location.reload();
          }
        }),
        map((res: any) => res?.body?.data || res.body)
      );
  }

  status(params: any): Observable<ApiResponse<any>> {
    const voteId = params.voteId || params.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/votes/${voteId}/status`);
    return this.http.get<ApiResponse<any>>(path, { params: { token: params.token }, withCredentials: true, observe: 'body', responseType: 'json' });
  }

  sign(data: any): Observable<any> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}/sign`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getVoteCountTotal(vote: any): number {
    let voteCountTotal = 0;
    if (vote?.options?.rows) {
      const options = vote.options.rows;
      for (const option of options) {
        if (option.voteCount) {
          voteCountTotal += option.voteCount;
        }
      }
    }
    return voteCountTotal;
  }

  hasVoteEnded(topic: Topic, vote: any): boolean {
    if ([this.STATUSES.followUp, this.STATUSES.closed].indexOf(topic.status) > -1) {
      return true;
    }
    return !!(vote && vote.endsAt && new Date() > new Date(vote.endsAt));
  }

  hasVoteEndedExpired(topic: Topic, vote: any): boolean {
    return [this.STATUSES.followUp, this.STATUSES.closed].indexOf(topic.status) > -1 || !!(vote?.endsAt && new Date() > new Date(vote.endsAt));
  }

  canVote(topic: Topic): boolean {
    return !!topic.vote && ((topic.permission.level !== 'none' || (topic.visibility === this.topicService.VISIBILITY.public)) && topic.status === this.STATUSES.voting);
  }

  canDelegate(topic: Topic): boolean {
    return this.canVote(topic) && topic.vote?.['delegationIsAllowed'] === true;
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}

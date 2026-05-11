import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpResponse } from '@angular/common/http';
import { Observable, exhaustMap, shareReplay, Subject, map, tap } from 'rxjs';

import { Topic } from '../interfaces/topic';
import { Vote, VoteOption, VoteWithOptions } from '../interfaces/vote';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';

interface VoteStatusData {
  status: string;
  message?: string;
}

interface VoteCastResponse {
  challengeID?: string;
  sessionCode?: string;
  bdocUri?: string;
  signedInfoDigest?: string;
  signedInfoHashType?: string;
  token?: string;
  [key: string]: unknown;
}

interface VoteParams { topicId: string; voteId?: string; id?: string; [key: string]: string | number | boolean | null | undefined }

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

  loadVote(params?: VoteParams): Observable<VoteWithOptions> {
    return this.loadVote$.pipe(
      exhaustMap(() => this.get(params)),
      shareReplay(1)
    );
  }

  reloadVote(): void {
    this.loadVote$.next();
  }

  query(params: VoteParams): Observable<VoteWithOptions[]> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/votes`);
    return this.http.get<ApiResponse<VoteWithOptions[]>>(path, { withCredentials: true, params: params as Record<string, string | number>, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  get(params?: VoteParams): Observable<VoteWithOptions> {
    const voteId = params?.voteId || params?.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params?.topicId}/votes/${voteId}`);
    return this.http.get<ApiResponse<VoteWithOptions>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: (Partial<Vote> | Partial<VoteWithOptions>) & { topicId: string }): Observable<VoteWithOptions> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes`);
    return this.http.post<ApiResponse<VoteWithOptions>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: (Partial<Vote> | Partial<VoteWithOptions>) & { topicId: string; voteId?: string; id?: string }): Observable<VoteWithOptions> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);
    return this.http.put<ApiResponse<VoteWithOptions>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: { topicId: string; voteId?: string; id?: string }): Observable<unknown> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  cast(data: { topicId: string; voteId?: string; id?: string; options?: VoteOption[]; [key: string]: unknown }): Observable<VoteCastResponse> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}`);

    return this.http.post<ApiResponse<VoteCastResponse>>(path, data, { withCredentials: true, observe: 'response', responseType: 'json' })
      .pipe(
        tap((res: HttpResponse<ApiResponse<VoteCastResponse>>) => {
          if (res.status === 205) {
            window.location.reload();
          }
        }),
        map((res: HttpResponse<ApiResponse<VoteCastResponse>>) => res?.body?.data ?? res.body as unknown as VoteCastResponse)
      );
  }

  status(params: { topicId: string; voteId?: string; id?: string; token: string }): Observable<ApiResponse<VoteStatusData>> {
    const voteId = params.voteId || params.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/votes/${voteId}/status`);
    return this.http.get<ApiResponse<VoteStatusData>>(path, { params: { token: params.token }, withCredentials: true, observe: 'body', responseType: 'json' });
  }

  sign(data: { topicId: string; voteId?: string; id?: string; [key: string]: unknown }): Observable<VoteCastResponse> {
    const voteId = data.voteId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/votes/${voteId}/sign`);
    return this.http.post<ApiResponse<VoteCastResponse>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getVoteCountTotal(vote: VoteWithOptions): number {
    let voteCountTotal = 0;
    const options = vote?.options;
    const rows = (options as { rows: VoteOption[] })?.rows ?? (Array.isArray(options) ? options : []);
    for (const option of rows) {
      if (option.voteCount) {
        voteCountTotal += option.voteCount;
      }
    }
    return voteCountTotal;
  }

  hasVoteEnded(topic: Topic, vote: { endsAt?: string | Date | null } | null | undefined): boolean {
    if ([this.STATUSES.followUp, this.STATUSES.closed].indexOf(topic.status) > -1) {
      return true;
    }
    return !!(vote && vote.endsAt && new Date() > new Date(vote.endsAt));
  }

  hasVoteEndedExpired(topic: Topic, vote: { endsAt?: string | Date | null } | null | undefined): boolean {
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

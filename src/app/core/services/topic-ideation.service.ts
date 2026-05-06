import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';
import { Idea, IdeaStatus } from '../interfaces/idea';

export { IdeaStatus };

export interface TopicIdeationParams extends ListParams {
  topicId?: string | null;
  ideationId?: string | null;
  types?: string | string[] | null;
  sortOrder?: string | null;
  authorId?: string | null;
  showModerated?: boolean | string | null;
  favourite?: boolean | string | null;
}

@Injectable({
  providedIn: 'root'
})
export class TopicIdeationService extends ItemsListService {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private topicService = inject(TopicService);
  public readonly IDEA_REPORT_TYPES = {
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  public readonly COMMENT_TYPES = {
    reply: 'reply'
  };

  public readonly COMMENT_TYPES_MAXLENGTH = {
    reply: 2048
  };

  public readonly COMMENT_REPORT_TYPES = {
    abuse: 'abuse',
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  readonly STATUSES = this.topicService.STATUSES;

  public loadIdeations$ = new Subject<void>();

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  loadIdeation(params?: any): Observable<any[]> {
    return this.loadIdeations$.pipe(
      exhaustMap(() => this.getItems(params)),
      shareReplay(1)
    );
  }

  override getItems(params: TopicIdeationParams): Observable<any> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));
    
    Object.keys(params).forEach(key => {
      if (key !== 'limit' && key !== 'offset' && key !== 'topicId' && key !== 'ideationId' && (params as any)[key] !== null) {
        httpParams = httpParams.set(key, (params as any)[key]);
      }
    });

    const ideationPath = params.ideationId ? `/${params.ideationId}` : '';
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations${ideationPath}`);
    
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? res.data ?? [], countTotal: res.data?.count ?? 0 })));
  }

  query(params: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  get(params?: any): Observable<any> {
    const ideationId = params?.ideationId || params?.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params?.topicId}/ideations/${ideationId}`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: any): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations`);
    return this.http.post<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  participants(data: any): Observable<any> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}/participants`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: any): Observable<any> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}`);
    return this.http.put<ApiResponse<any>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: any): Observable<any> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  downloadIdeas(topicId: string, ideationId: string): string {
    return this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/download`);
  }

  // --- Idea methods ---

  getIdeas(params: { topicId: string; ideationId: string; [key: string]: any }): Observable<{ rows: Idea[]; count: any }> {
    const { topicId, ideationId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  getIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<Idea> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`);
    return this.http.get<ApiResponse<Idea>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  createIdea(data: { topicId: string; ideationId: string; [key: string]: any }): Observable<Idea> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas`);
    return this.http.post<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  updateIdea(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: any }): Observable<Idea> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}`);
    return this.http.put<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  deleteIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdea(params: { topicId: string; ideationId: string; ideaId: string; value: number }): Observable<any> {
    const { topicId, ideationId, ideaId, value } = params;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`);
    return this.http.post<ApiResponse<any>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaVotes(params: { topicId: string; ideationId: string; ideaId: string; [key: string]: any }): Observable<{ rows: any[]; countTotal: number }> {
    const { topicId, ideationId, ideaId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`);

    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({
        rows: res.data?.rows ?? [],
        countTotal: res.data?.count ?? 0
      })));
  }

  addIdeaToFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`);
    return this.http.post<ApiResponse<any>>(path, {}, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  reportIdea(data: { topicId: string; ideationId: string; ideaId: string; type: string; text?: string }): Observable<any> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/reports`);
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  // --- Folder methods ---

  getFolders(params: { topicId: string; ideationId: string; [key: string]: any }): Observable<{ rows: any[]; count: any }> {
    const { topicId, ideationId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  getFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  createFolder(data: { topicId: string; ideationId: string; name: string; description?: string }): Observable<any> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders`);
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  updateFolder(data: { topicId: string; ideationId: string; folderId: string; name?: string; description?: string }): Observable<any> {
    const { topicId, ideationId, folderId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders/${folderId}`);
    return this.http.put<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  deleteFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addIdeaToFolder(params: { topicId: string; ideationId: string; folderId: string }, ideaIds: string[] | string): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas`);
    const body = Array.isArray(ideaIds) ? ideaIds.map(id => ({ id })) : [{ id: ideaIds }];
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFolder(params: { topicId: string; ideationId: string; folderId: string; ideaId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas/${params.ideaId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addFoldersToIdea(params: { topicId: string; ideationId: string; ideaId: string }, folderIds: string[] | string): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`);
    const body = Array.isArray(folderIds) ? folderIds.map(id => ({ id })) : [{ id: folderIds }];
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaFolders(params: { topicId: string; ideationId: string; ideaId: string }): Observable<{ rows: any[]; count: any }> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  // --- Idea Comment (Reply) methods ---

  getIdeaComments(params: { topicId: string; ideationId: string; ideaId: string; [key: string]: any }): Observable<{ rows: any[]; count: any }> {
    const { topicId, ideationId, ideaId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments`);
    return this.http.get<ApiResponse<any>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  saveIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: any }): Observable<any> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments`);
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  updateIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; [key: string]: any }): Observable<any> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}`);
    return this.http.put<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  deleteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/comments/${params.commentId}`);
    return this.http.delete<ApiResponse<any>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string; value: number }): Observable<any> {
    const { topicId, ideationId, ideaId, commentId, value } = params;
    const path = this.getAbsoluteUrlApi(`/api/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/votes`);
    return this.http.post<ApiResponse<any>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  reportIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; type: string; text?: string }): Observable<any> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/reports`);
    return this.http.post<ApiResponse<any>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaReport(data: { topicId: string; ideationId: string; ideaId: string; reportId: string; token: string }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/reports/${data.reportId}`);
    return this.http.get<ApiResponse<any>>(path, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  moderateIdea(data: { topicId: string; ideationId: string; ideaId: string; reportId: string; token: string; report: any }): Observable<any> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/reports/${data.reportId}/moderate`);
    return this.http.post<ApiResponse<any>>(path, data.report, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  hasIdeationEnded(topic: Topic, ideation: any): boolean {
    if ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) {
      return true;
    }
    return !!(ideation && ideation.deadline && new Date() > new Date(ideation.deadline));
  }

  hasIdeationEndedExpired(topic: Topic, ideation: any): boolean {
    return ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) || !!(ideation?.deadline && new Date() > new Date(ideation.deadline));
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}

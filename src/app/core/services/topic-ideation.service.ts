import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';
import { Idea, IdeaStatus } from '../interfaces/idea';
import { Ideation, IdeationFolder, IdeaComment, IdeaReport, IdeaVoter } from '../interfaces/ideation';

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

type ParamValue = string | number | boolean | null | undefined | string[] | number[] | Record<string, any>;

@Injectable({
  providedIn: 'root'
})
export class TopicIdeationService extends ItemsListService<TopicIdeationParams, Ideation> {
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

  loadIdeation(params?: TopicIdeationParams): Observable<{ rows: Ideation[]; countTotal: number }> {
    return this.loadIdeations$.pipe(
      exhaustMap(() => this.getItems(params ?? this.params.value)),
      shareReplay(1)
    );
  }

  override getItems(params: TopicIdeationParams): Observable<{ rows: Ideation[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    Object.entries(params).forEach(([key, val]) => {
      if (key !== 'limit' && key !== 'offset' && key !== 'topicId' && key !== 'ideationId' && val != null) {
        if (Array.isArray(val)) {
          val.forEach(v => {
            httpParams = httpParams.append(key, String(v));
          });
        } else {
          httpParams = httpParams.set(key, String(val));
        }
      }
    });

    const ideationPath = params.ideationId ? `/${params.ideationId}` : '';
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations${ideationPath}`);

    return this.http.get<ApiResponse<{ rows: Ideation[]; count: number } | Ideation[]>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => {
        const data = res.data;
        if (data && 'rows' in data) {
          return { rows: data.rows, countTotal: data.count };
        }
        return { rows: (data as Ideation[]) ?? [], countTotal: (data as Ideation[])?.length ?? 0 };
      }));
  }

  query(params: TopicIdeationParams): Observable<Ideation[]> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations`);
    let httpParams = new HttpParams();
    Object.entries(params).forEach(([key, val]) => {
      if (val != null) {
        if (Array.isArray(val)) {
          val.forEach(v => {
            httpParams = httpParams.append(key, String(v));
          });
        } else {
          httpParams = httpParams.set(key, String(val));
        }
      }
    });

    return this.http.get<ApiResponse<Ideation[]>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  get(params?: { topicId?: string; ideationId?: string; id?: string }): Observable<Ideation> {
    const ideationId = params?.ideationId || params?.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params?.topicId}/ideations/${ideationId}`);
    return this.http.get<ApiResponse<Ideation>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  save(data: { topicId: string; [key: string]: ParamValue }): Observable<Ideation> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations`);
    return this.http.post<ApiResponse<Ideation>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  participants(data: { topicId: string; ideationId?: string; id?: string }): Observable<{ rows: IdeaVoter[]; count: number }> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}/participants`);
    return this.http.get<ApiResponse<{ rows: IdeaVoter[]; count: number }>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  update(data: { topicId: string; ideationId?: string; id?: string; [key: string]: ParamValue }): Observable<Ideation> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}`);
    return this.http.put<ApiResponse<Ideation>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(data: { topicId: string; ideationId?: string; id?: string }): Observable<unknown> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${data.topicId}/ideations/${ideationId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  downloadIdeas(topicId: string, ideationId: string): string {
    return this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/download`);
  }

  // --- Idea methods ---

  getIdeas(params: { topicId: string; ideationId: string; [key: string]: ParamValue }): Observable<{ rows: Idea[]; count: number }> {
    const { topicId, ideationId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas`);
    return this.http.get<ApiResponse<{ rows: Idea[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  getIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<Idea> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`);
    return this.http.get<ApiResponse<Idea>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  createIdea(data: { topicId: string; ideationId: string; [key: string]: ParamValue }): Observable<Idea> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas`);
    return this.http.post<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  updateIdea(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<Idea> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}`);
    return this.http.put<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data as Idea));
  }

  deleteIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdea(params: { topicId: string; ideationId: string; ideaId: string; value: number }): Observable<unknown> {
    const { topicId, ideationId, ideaId, value } = params;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`);
    return this.http.post<ApiResponse<unknown>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaVotes(params: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<{ rows: IdeaVoter[]; countTotal: number }> {
    const { topicId, ideationId, ideaId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`);

    return this.http.get<ApiResponse<{ rows: IdeaVoter[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({
        rows: res.data?.rows ?? [],
        countTotal: res.data?.count ?? 0
      })));
  }

  addIdeaToFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`);
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  reportIdea(data: { topicId: string; ideationId: string; ideaId: string; type: string; text?: string }): Observable<IdeaReport> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/reports`);
    return this.http.post<ApiResponse<IdeaReport>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  // --- Folder methods ---

  getFolders(params: { topicId: string; ideationId: string; [key: string]: ParamValue }): Observable<{ rows: IdeationFolder[]; count: number }> {
    const { topicId, ideationId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders`);
    return this.http.get<ApiResponse<{ rows: IdeationFolder[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  getFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<IdeationFolder> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`);
    return this.http.get<ApiResponse<IdeationFolder>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  createFolder(data: { topicId: string; ideationId: string; name: string; description?: string }): Observable<IdeationFolder> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders`);
    return this.http.post<ApiResponse<IdeationFolder>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  updateFolder(data: { topicId: string; ideationId: string; folderId: string; name?: string; description?: string }): Observable<IdeationFolder> {
    const { topicId, ideationId, folderId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/folders/${folderId}`);
    return this.http.put<ApiResponse<IdeationFolder>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  deleteFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addIdeaToFolder(params: { topicId: string; ideationId: string; folderId: string }, ideaIds: string[] | string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas`);
    const body = Array.isArray(ideaIds) ? ideaIds.map(id => ({ id })) : [{ id: ideaIds }];
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFolder(params: { topicId: string; ideationId: string; folderId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas/${params.ideaId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addFoldersToIdea(params: { topicId: string; ideationId: string; ideaId: string }, folderIds: string[] | string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`);
    const body = Array.isArray(folderIds) ? folderIds.map(id => ({ id })) : [{ id: folderIds }];
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaFolders(params: { topicId: string; ideationId: string; ideaId: string }): Observable<{ rows: IdeationFolder[]; count: number }> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`);
    return this.http.get<ApiResponse<{ rows: IdeationFolder[]; count: number }>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  // --- Idea Comment (Reply) methods ---

  getIdeaComments(params: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<{ rows: IdeaComment[]; count: number }> {
    const { topicId, ideationId, ideaId, ...rest } = params;
    let httpParams = new HttpParams();
    Object.entries(rest).forEach(([k, v]) => {
      if (v !== null && v !== undefined) httpParams = httpParams.set(k, String(v));
    });
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments`);
    return this.http.get<ApiResponse<{ rows: IdeaComment[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], count: res.data?.count ?? 0 })));
  }

  saveIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<IdeaComment> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments`);
    return this.http.post<ApiResponse<IdeaComment>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  updateIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; [key: string]: ParamValue }): Observable<IdeaComment> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}`);
    return this.http.put<ApiResponse<IdeaComment>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  deleteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/comments/${params.commentId}`);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string; value: number }): Observable<unknown> {
    const { topicId, ideationId, ideaId, commentId, value } = params;
    const path = this.getAbsoluteUrlApi(`/api/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/votes`);
    return this.http.post<ApiResponse<unknown>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  reportIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; type: string; text?: string }): Observable<IdeaReport> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/api/users/self/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/reports`);
    return this.http.post<ApiResponse<IdeaReport>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaReport(data: { topicId: string; ideationId: string; ideaId: string; reportId: string; token: string }): Observable<IdeaReport> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/reports/${data.reportId}`);
    return this.http.get<ApiResponse<IdeaReport>>(path, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  moderateIdea(data: { topicId: string; ideationId: string; ideaId: string; reportId: string; token: string; report: { type: string; text: string } }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/reports/${data.reportId}/moderate`);
    return this.http.post<ApiResponse<unknown>>(path, data.report, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  getIdeaCommentReport(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; reportId: string; token: string }): Observable<IdeaReport> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/comments/${data.commentId}/reports/${data.reportId}`);
    return this.http.get<ApiResponse<IdeaReport>>(path, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  moderateIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; reportId: string; token: string; report: { type: string; text: string } }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/api/topics/${data.topicId}/ideations/${data.ideationId}/ideas/${data.ideaId}/comments/${data.commentId}/reports/${data.reportId}/moderate`);
    return this.http.post<ApiResponse<unknown>>(path, data.report, {
      headers: { Authorization: `Bearer ${data.token}` },
      withCredentials: true, observe: 'body', responseType: 'json'
    }).pipe(map(res => res.data));
  }

  hasIdeationEnded(topic: Topic, ideation: Ideation): boolean {
    if ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) {
      return true;
    }
    return !!(ideation && ideation.deadline && new Date() > new Date(ideation.deadline));
  }

  hasIdeationEndedExpired(topic: Topic, ideation: Ideation): boolean {
    return ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) || !!(ideation?.deadline && new Date() > new Date(ideation.deadline));
  }

  private getAbsoluteUrlApi(path: string): string {
    return `${this.apiUrl}${path}`;
  }
}

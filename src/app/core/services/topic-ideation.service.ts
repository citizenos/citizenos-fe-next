import { Service, inject  } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, Subject, map, exhaustMap, shareReplay, of } from 'rxjs';

import { ItemsListService, ListParams } from './items-list.service';
import { TopicService } from './topic.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { Topic } from '../interfaces/topic';
import { Idea } from '../interfaces/idea';
import { Ideation, IdeationFolder, IdeaComment, IdeaReport as IdeaReportInterface, IdeaVoter } from '../interfaces/ideation';

export interface TopicIdeationParams extends ListParams {
  topicId: string;
  ideationId?: string;
  showModerated?: boolean;
}

export interface IdeaReport {
  id: string;
  type: string;
  text?: string;
}

type ParamValue = string | number | boolean | null | undefined | Record<string, unknown> | Date;

@Service()
export class TopicIdeationService extends ItemsListService<TopicIdeationParams, Ideation> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private topicService = inject(TopicService);
  private userStore = inject(UserStore);

  public readonly IDEA_REPORT_TYPES = {
    obscene: 'obscene',
    spam: 'spam',
    hate: 'hate',
    duplicate: 'duplicate',
    other: 'other'
  };

  public readonly COMMENT_REPORT_TYPES = this.IDEA_REPORT_TYPES;

  public readonly STATUSES = {
    draft: 'draft',
    ideation: 'ideation'
  };

  readonly COMMENT_TYPES_MAXLENGTH = {
    reply: 2048
  };

  public loadIdeations$ = new Subject<void>();

  constructor() {
    super();
    this.setDefaults({ limit: 10, offset: 0 });
  }

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/ideations') ||
      path.includes('/ideas') ||
      path.includes('/folders') ||
      path.includes('/comments')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }

  loadIdeation(params?: TopicIdeationParams): Observable<{ rows: Ideation[]; countTotal: number }> {
    return this.loadIdeations$.pipe(
      exhaustMap(() => this.getItems(params ?? this.params())),
      shareReplay(1)
    );
  }

  reloadIdeation(): void {
    this.loadIdeations$.next();
  }

  override getItems(params: TopicIdeationParams): Observable<{ rows: Ideation[]; countTotal: number }> {
    let httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    if (params.showModerated !== undefined) {
      httpParams = httpParams.set('showModerated', String(params.showModerated));
    }

    const ideationPath = params.ideationId ? `/${params.ideationId}` : '';
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations${ideationPath}`);

    return this.http.get<ApiResponse<{ rows: Ideation[]; count: number } | Ideation[]>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => {
        const data = res.data;
        if (data && 'rows' in data) {
          return { rows: data.rows, countTotal: data.count };
        } else if (Array.isArray(data)) {
          return { rows: data, countTotal: data.length };
        }
        return { rows: [], countTotal: 0 };
      }));
  }

  query(params: TopicIdeationParams): Observable<Ideation[]> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations`);
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const val = (params as any)[key];
      if (val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    return this.http.get<ApiResponse<Ideation[]>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  get(params?: { topicId?: string; ideationId?: string; id?: string }): Observable<Ideation> {
    const ideationId = params?.ideationId || params?.id;
    const path = this.getAbsoluteUrlApi(`/topics/${params?.topicId}/ideations/${ideationId}`);
    return this.http.get<ApiResponse<Ideation>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  save(data: { topicId: string; [key: string]: ParamValue }): Observable<Ideation> {
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/ideations`, true);
    return this.http.post<ApiResponse<Ideation>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  participants(data: { topicId: string; ideationId?: string; id?: string }): Observable<{ rows: IdeaVoter[]; count: number }> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/ideations/${ideationId}/participants`);
    return this.http.get<ApiResponse<{ rows: IdeaVoter[]; count: number }>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  update(data: { topicId: string; ideationId?: string; id?: string; [key: string]: ParamValue }): Observable<Ideation> {
    const extractedId = (data.ideationId && data.ideationId !== 'undefined') ? data.ideationId : ((data.id && data.id !== 'undefined') ? data.id : '');
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/ideations/${extractedId}`, true);
    return this.http.put<ApiResponse<Ideation>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  delete(data: { topicId: string; ideationId?: string; id?: string }): Observable<unknown> {
    const ideationId = data.ideationId || data.id;
    const path = this.getAbsoluteUrlApi(`/topics/${data.topicId}/ideations/${ideationId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  downloadIdeas(topicId: string, ideationId: string): string {
    return this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/download`);
  }

  getIdeas(topicId: string | { topicId: string; ideationId: string; [key: string]: ParamValue }, ideationId?: string, params: Record<string, ParamValue> = {}): Observable<{ rows: Idea[]; count: number }> {
    let tId: string;
    let iId: string;
    let rest: Record<string, ParamValue>;

    if (typeof topicId === 'object') {
      tId = topicId.topicId;
      iId = topicId.ideationId;
      rest = topicId;
    } else {
      tId = topicId;
      iId = ideationId!;
      rest = params;
    }

    let httpParams = new HttpParams();
    Object.keys(rest).forEach(key => {
      const val = rest[key];
      if (key !== 'topicId' && key !== 'ideationId' && val !== undefined && val !== null) {
        if (Array.isArray(val)) {
          val.forEach(v => httpParams = httpParams.append(key, String(v)));
        } else {
          httpParams = httpParams.set(key, String(val));
        }
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${tId}/ideations/${iId}/ideas`);
    return this.http.get<ApiResponse<{ rows: Idea[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<Idea> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`);
    return this.http.get<ApiResponse<Idea>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  createIdea(data: { topicId: string; ideationId: string; [key: string]: ParamValue }): Observable<Idea> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas`, true);
    return this.http.post<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  updateIdea(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<Idea> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}`, true);
    return this.http.put<ApiResponse<Idea>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  deleteIdea(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdea(params: { topicId: string; ideationId: string; ideaId: string; value: number }): Observable<unknown> {
    const { topicId, ideationId, ideaId, value } = params;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`, true);
    return this.http.post<ApiResponse<unknown>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaVoters(topicId: string | { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }, ideationId?: string, ideaId?: string, params: Record<string, ParamValue> = {}): Observable<{ rows: IdeaVoter[]; count: number }> {
    let tId: string;
    let iId: string;
    let idId: string;
    let rest: Record<string, ParamValue>;

    if (typeof topicId === 'object') {
      tId = topicId.topicId;
      iId = topicId.ideationId;
      idId = (topicId as any).ideaId || (topicId as any).id;
      rest = topicId;
    } else {
      tId = topicId;
      iId = ideationId!;
      idId = ideaId!;
      rest = params;
    }

    let httpParams = new HttpParams();
    Object.keys(rest).forEach(key => {
      const val = rest[key];
      if (key !== 'topicId' && key !== 'ideationId' && key !== 'ideaId' && key !== 'id' && val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${tId}/ideations/${iId}/ideas/${idId}/votes`);

    return this.http.get<ApiResponse<{ rows: IdeaVoter[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getIdeaVotersPublic(topicId: string, ideationId: string, ideaId: string, params: Record<string, ParamValue> = {}): Observable<{ rows: IdeaVoter[]; count: number }> {
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      const val = params[key];
      if (val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/votes`);

    return this.http.get<ApiResponse<{ rows: IdeaVoter[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  addIdeaToFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`, true);
    return this.http.post<ApiResponse<unknown>>(path, {}, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFavourites(params: { topicId: string; ideationId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/favourite`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  reportIdea(data: { topicId: string; ideationId: string; ideaId: string; type: string; text?: string }): Observable<IdeaReportInterface> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/reports`, true);
    return this.http.post<ApiResponse<IdeaReportInterface>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  moderateIdea(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: any }): Observable<unknown> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/moderate`, true);
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaReport(params: { topicId: string; ideationId: string; ideaId: string; reportId: string; token?: string }): Observable<IdeaReportInterface> {
    let httpParams = new HttpParams();
    if (params.token) httpParams = httpParams.set('token', params.token);
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/reports/${params.reportId}`, true);
    return this.http.get<ApiResponse<IdeaReportInterface>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getFolders(topicId: string | { topicId: string; ideationId: string; [key: string]: ParamValue }, ideationId?: string, params: Record<string, ParamValue> = {}): Observable<{ rows: IdeationFolder[]; count: number }> {
    let tId: string;
    let iId: string;
    let rest: Record<string, ParamValue>;

    if (typeof topicId === 'object') {
      tId = topicId.topicId;
      iId = topicId.ideationId;
      rest = topicId;
    } else {
      tId = topicId;
      iId = ideationId!;
      rest = params;
    }

    let httpParams = new HttpParams();
    Object.keys(rest).forEach(key => {
      const val = rest[key];
      if (key !== 'topicId' && key !== 'ideationId' && val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${tId}/ideations/${iId}/folders`);
    return this.http.get<ApiResponse<{ rows: IdeationFolder[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<IdeationFolder> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`);
    return this.http.get<ApiResponse<IdeationFolder>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  createFolder(data: { topicId: string; ideationId: string; name: string; description?: string }): Observable<IdeationFolder> {
    const { topicId, ideationId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/folders`, true);
    return this.http.post<ApiResponse<IdeationFolder>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  updateFolder(data: { topicId: string; ideationId: string; folderId: string; name?: string; description?: string }): Observable<IdeationFolder> {
    const { topicId, ideationId, folderId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/folders/${folderId}`, true);
    return this.http.put<ApiResponse<IdeationFolder>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  deleteFolder(params: { topicId: string; ideationId: string; folderId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addIdeaToFolder(params: { topicId: string; ideationId: string; folderId: string }, ideaIds: string[] | string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas`, true);
    const body = Array.isArray(ideaIds) ? ideaIds.map(id => ({ id })) : [{ id: ideaIds }];
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  removeIdeaFromFolder(params: { topicId: string; ideationId: string; folderId: string; ideaId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/folders/${params.folderId}/ideas/${params.ideaId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  addFoldersToIdea(params: { topicId: string; ideationId: string; ideaId: string }, folderIds: string[] | string): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`, true);
    const body = Array.isArray(folderIds) ? folderIds.map(id => ({ id })) : [{ id: folderIds }];
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  getIdeaFolders(params: { topicId: string; ideationId: string; ideaId: string }): Observable<{ rows: IdeationFolder[]; count: number }> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/folders`);
    return this.http.get<ApiResponse<{ rows: IdeationFolder[]; count: number }>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getIdeaComments(topicId: string | { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }, ideationId?: string, ideaId?: string, params: Record<string, ParamValue> = {}): Observable<{ rows: IdeaComment[]; count: number }> {
    let tId: string;
    let iId: string;
    let idId: string;
    let rest: Record<string, ParamValue>;

    if (typeof topicId === 'object') {
      tId = topicId.topicId;
      iId = topicId.ideationId;
      idId = topicId.ideaId;
      rest = topicId;
    } else {
      tId = topicId;
      iId = ideationId!;
      idId = ideaId!;
      rest = params;
    }

    let httpParams = new HttpParams();
    Object.keys(rest).forEach(key => {
      const val = rest[key];
      if (key !== 'topicId' && key !== 'ideationId' && key !== 'ideaId' && val !== undefined && val !== null) {
        httpParams = httpParams.set(key, String(val));
      }
    });

    const path = this.getAbsoluteUrlApi(`/topics/${tId}/ideations/${iId}/ideas/${idId}/comments`);
    return this.http.get<ApiResponse<{ rows: IdeaComment[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  getIdeaCommentReport(params: { topicId: string; ideationId: string; ideaId: string; commentId: string; reportId: string; token?: string }): Observable<IdeaReportInterface> {
     let httpParams = new HttpParams();
     if (params.token) httpParams = httpParams.set('token', params.token);
     const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/comments/${params.commentId}/reports/${params.reportId}`, true);
     return this.http.get<ApiResponse<IdeaReportInterface>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
       .pipe(map(res => res.data!));
  }

  saveIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; [key: string]: ParamValue }): Observable<IdeaComment> {
    const { topicId, ideationId, ideaId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments`, true);
    return this.http.post<ApiResponse<IdeaComment>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  updateIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; [key: string]: ParamValue }): Observable<IdeaComment> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}`, true);
    return this.http.put<ApiResponse<IdeaComment>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  deleteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string }): Observable<unknown> {
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/comments/${params.commentId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  voteIdeaComment(params: { topicId: string; ideationId: string; ideaId: string; commentId: string; value: number }): Observable<IdeaComment['votes']> {
    const { topicId, ideationId, ideaId, commentId, value } = params;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/votes`, true);
    return this.http.post<ApiResponse<IdeaComment['votes']>>(path, { value }, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  reportIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; type: string; text?: string }): Observable<IdeaReportInterface> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/reports`, true);
    return this.http.post<ApiResponse<IdeaReportInterface>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data!));
  }

  moderateIdeaComment(data: { topicId: string; ideationId: string; ideaId: string; commentId: string; [key: string]: any }): Observable<unknown> {
    const { topicId, ideationId, ideaId, commentId, ...body } = data;
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/comments/${commentId}/moderate`, true);
    return this.http.post<ApiResponse<unknown>>(path, body, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  hasIdeationEnded(topic: Topic, ideation: Ideation): boolean {
    return ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) || !!(ideation?.deadline && new Date() > new Date(ideation.deadline));
  }

  hasIdeationEndedExpired(topic: Topic, ideation: Ideation): boolean {
    return ([this.STATUSES.draft, this.STATUSES.ideation].indexOf(topic.status) === -1) || !!(ideation?.deadline && new Date() > new Date(ideation.deadline));
  }
}

import { Service, inject  } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';
import { Attachment } from '../interfaces/attachment';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ItemsListService, ListParams } from './items-list.service';

export interface IdeaAttachmentParams extends ListParams {
  topicId: string;
  ideationId: string;
  ideaId: string;
}

@Service()
export class IdeaAttachmentService extends ItemsListService<IdeaAttachmentParams> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  public readonly SOURCES = {
    upload: 'upload',
    dropbox: 'dropbox',
    onedrive: 'onedrive',
    googledrive: 'googledrive'
  };

  private get apiUrl() {
    return this.configStore.api.baseUrl();
  }

  constructor() {
    super();
    this.setDefaults({ limit: 10, offset: 0 });
  }

  override getItems(params: IdeaAttachmentParams): Observable<{ rows: Attachment[]; countTotal: number }> {
    const httpParams = new HttpParams()
      .set('limit', String(params.limit))
      .set('offset', String(params.offset ?? 0));

    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/ideations/${params.ideationId}/ideas/${params.ideaId}/attachments`);
    return this.http.get<ApiResponse<{ rows: Attachment[]; count: number }>>(path, { withCredentials: true, params: httpParams, observe: 'body', responseType: 'json' })
      .pipe(map(res => ({ rows: res.data?.rows ?? [], countTotal: res.data?.count ?? 0 })));
  }

  save(topicId: string, ideationId: string, ideaId: string, data: Attachment): Observable<Attachment> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/attachments`, true);
    return this.http.post<ApiResponse<Attachment>>(path, data, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  delete(params: { topicId: string; ideationId: string; ideaId: string; attachmentId: string }): Observable<unknown>;
  delete(topicId: string, ideationId: string, ideaId: string, attachmentId: string): Observable<unknown>;
  delete(topicIdOrParams: { topicId: string; ideationId: string; ideaId: string; attachmentId: string } | string, ideationId?: string, ideaId?: string, attachmentId?: string): Observable<unknown> {
    let tId: string;
    let iId: string;
    let idId: string;
    let aId: string;

    if (typeof topicIdOrParams === 'object' && topicIdOrParams !== null) {
      tId = topicIdOrParams.topicId;
      iId = topicIdOrParams.ideationId;
      idId = topicIdOrParams.ideaId;
      aId = topicIdOrParams.attachmentId;
    } else {
      tId = topicIdOrParams;
      iId = ideationId!;
      idId = ideaId!;
      aId = attachmentId!;
    }

    const path = this.getAbsoluteUrlApi(`/topics/${tId}/ideations/${iId}/ideas/${idId}/attachments/${aId}`, true);
    return this.http.delete<ApiResponse<unknown>>(path, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  upload(topicId: string, ideationId: string, ideaId: string, file: File): Observable<Attachment> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/ideations/${ideationId}/ideas/${ideaId}/attachments/upload`, true);
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post<ApiResponse<Attachment>>(path, formData, { withCredentials: true, observe: 'body', responseType: 'json' })
      .pipe(map(res => res.data));
  }

  private getAbsoluteUrlApi(path: string, forceAuthorized = false): string {
    const isPublicPath = !forceAuthorized && (
      path.includes('/attachments')
    );
    const prefix = (this.userStore.isAuthenticated() && !isPublicPath) ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }
}

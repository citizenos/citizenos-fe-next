import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, of } from 'rxjs';
import { ItemsListService, ListParams } from './items-list.service';
import { ConfigStore } from '../state/config.store';
import { UserStore } from '../state/user.store';
import { ApiResponse } from '../interfaces/api-response';
import { TopicAttachment } from '../interfaces/topic';

export interface TopicAttachmentParams extends ListParams {
  topicId: string;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let google: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let gapi: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let Dropbox: any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
declare let OneDrive: any;

@Injectable({
  providedIn: 'root'
})
export class TopicAttachmentService extends ItemsListService<TopicAttachmentParams, TopicAttachment> {
  private http = inject(HttpClient);
  private configStore = inject(ConfigStore);
  private userStore = inject(UserStore);

  readonly SOURCES = {
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
    this.setDefaults({ limit: 100, offset: 0 });
  }

  override getItems(params: TopicAttachmentParams): Observable<{ rows: TopicAttachment[]; countTotal: number }> {
    if (!params.topicId) return of({ rows: [], countTotal: 0 });
    const path = this.getAbsoluteUrlApi(`/topics/${params.topicId}/attachments`);
    let httpParams = new HttpParams();
    Object.keys(params).forEach(key => {
      if (params[key] !== null && params[key] !== undefined) {
        httpParams = httpParams.set(key, String(params[key]));
      }
    });

    return this.http.get<ApiResponse<TopicAttachment[]>>(path, { withCredentials: true, params: httpParams }).pipe(
      map(res => ({
        rows: res.data ?? [],
        countTotal: res.data?.length ?? 0
      }))
    );
  }

  save(topicId: string, data: Partial<TopicAttachment>): Observable<TopicAttachment> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/attachments`);
    return this.http.post<ApiResponse<TopicAttachment>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  update(topicId: string, attachment: TopicAttachment): Observable<TopicAttachment> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/attachments/${attachment.id}`);
    const { id: _, ...data } = attachment;
    return this.http.put<ApiResponse<TopicAttachment>>(path, data, { withCredentials: true }).pipe(
      map(res => res.data!)
    );
  }

  delete(topicId: string, attachmentId: string): Observable<void> {
    const path = this.getAbsoluteUrlApi(`/topics/${topicId}/attachments/${attachmentId}`);
    return this.http.delete<ApiResponse<void>>(path, { withCredentials: true }).pipe(
      map(() => void 0)
    );
  }

  private getAbsoluteUrlApi(path: string): string {
    const prefix = this.userStore.isAuthenticated() ? '/api/users/self' : '/api';
    return `${this.apiUrl}${prefix}${path}`;
  }

  /* Cloud Storage Selection Methods */

  googleDriveSelect(): Promise<Partial<TopicAttachment> | null> {
    if (typeof gapi === 'undefined' || typeof google === 'undefined') return Promise.resolve(null);
    const config = this.configStore.attachments().googleDrive;

    let googlePickerApiLoaded = false;
    let oauthToken: string;

    const createPicker = (): Promise<Partial<TopicAttachment> | null> => {
      return new Promise((resolve) => {
        const pickerCallback = (data: Record<string, unknown>) => {
          if (data[google.picker.Response.ACTION] === google.picker.Action.PICKED) {
            const doc = (data[google.picker.Response.DOCUMENTS] as unknown as Record<string, string | number>[])[0];
            const attachment: Partial<TopicAttachment> = {
              name: doc[google.picker.Document.NAME] as string,
              type: (doc[google.picker.Document.TYPE] as string) || (doc[google.picker.Document.NAME] as string).split('.').pop(),
              source: this.SOURCES.googledrive,
              size: (doc['sizeBytes'] as number) || 0,
              link: doc[google.picker.Document.URL] as string
            };
            resolve(attachment);
          }
          if (data[google.picker.Response.ACTION] === google.picker.Action.CANCEL) {
            resolve(null);
          }
        };

        const picker = new google.picker.PickerBuilder()
          .addView(google.picker.ViewId.DOCS)
          .setOAuthToken(oauthToken)
          .setDeveloperKey(config.developerKey)
          .setCallback(pickerCallback)
          .setOrigin(window.location.origin)
          .setSize(600, 400)
          .build();
        picker.setVisible(true);
      });
    };

    return new Promise((resolve) => {
      const onAuthApiLoad = () => {
        gapi.auth.authorize(
          {
            'client_id': config.clientId,
            'scope': ['https://www.googleapis.com/auth/drive.file'],
            'immediate': false
          },
          (authResult: { access_token: string; error?: unknown }) => {
            if (authResult && !authResult.error) {
              oauthToken = authResult.access_token;
              if (googlePickerApiLoaded) {
                resolve(createPicker());
              } else {
                gapi.load('picker', { 'callback': () => resolve(createPicker()) });
              }
            } else {
              resolve(null);
            }
          }
        );
      };

      gapi.load('client', { 'callback': onAuthApiLoad });
      gapi.load('picker', { 'callback': () => { googlePickerApiLoaded = true; } });
    });
  }

  dropboxSelect(): Promise<Partial<TopicAttachment> | null> {
    if (typeof Dropbox === 'undefined') return Promise.resolve(null);
    const config = this.configStore.attachments().dropbox;
    Dropbox.appKey = config.appKey;

    return new Promise((resolve) => {
      Dropbox.choose({
        success: (files: { name: string; bytes: number; link: string }[]) => {
          if (files && files.length > 0) {
            const attachment: Partial<TopicAttachment> = {
              name: files[0].name,
              type: files[0].name.split('.').pop(),
              source: this.SOURCES.dropbox,
              size: files[0].bytes,
              link: files[0].link
            };
            resolve(attachment);
          } else {
            resolve(null);
          }
        },
        cancel: () => resolve(null),
        linkType: 'preview',
        multiselect: false
      });
    });
  }

  oneDriveSelect(): Promise<Partial<TopicAttachment> | null> {
    if (typeof OneDrive === 'undefined') return Promise.resolve(null);
    const config = this.configStore.attachments().oneDrive;

    return new Promise((resolve) => {
      OneDrive.open({
        clientId: config.clientId,
        action: 'share',
        advanced: {
          redirectUri: window.location.origin + '/onedrive'
        },
        success: (res: { value: { name: string; size: number; permissions: { link: { webUrl: string } }[] }[] }) => {
          if (res && res.value && res.value.length > 0) {
            const attachment: Partial<TopicAttachment> = {
              name: res.value[0].name,
              type: res.value[0].name.split('.').pop(),
              source: this.SOURCES.onedrive,
              size: res.value[0].size,
              link: res.value[0].permissions[0].link.webUrl
            };
            resolve(attachment);
          } else {
            resolve(null);
          }
        },
        cancel: () => resolve(null),
        error: (err: unknown) => {
          console.error('OneDrive error:', err);
          resolve(null);
        }
      });
    });
  }
}

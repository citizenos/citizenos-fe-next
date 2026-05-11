import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent, HttpResponse } from '@angular/common/http';
import { filter, map, Observable } from 'rxjs';
import { ApiResponse } from '../interfaces/api-response';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);

  upload<T = unknown>(path: string, file: File, data?: Record<string, unknown>): Observable<T> {
    const formData: FormData = new FormData();
    formData.append('file', file);
    
    if (data) {
      for (const [key, value] of Object.entries(data)) {
        formData.append(key, String(value));
      }
    }

    const req = new HttpRequest('POST', path, formData, {
      withCredentials: true,
      reportProgress: true,
      responseType: 'json',
    });

    return this.http.request<ApiResponse<T>>(req).pipe(
      filter((event): event is HttpResponse<ApiResponse<T>> => event.type === HttpEventType.Response),
      map((event: HttpResponse<ApiResponse<T>>) => {
        return (event.body?.data || event.body) as T;
      })
    );
  }
}

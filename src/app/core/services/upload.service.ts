import { inject, Injectable } from '@angular/core';
import { HttpClient, HttpRequest, HttpEventType, HttpEvent } from '@angular/common/http';
import { map, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class UploadService {
  private http = inject(HttpClient);

  upload(path: string, file: File, data?: any): Observable<any> {
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

    return this.http.request(req).pipe(
      map((event: HttpEvent<any>) => {
        if (event.type === HttpEventType.Response) {
          return event.body?.data || event.body;
        }
        return event;
      })
    );
  }
}

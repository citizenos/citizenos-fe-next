import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { UserGroupService } from './user-group.service';
import { ConfigStore } from '../state/config.store';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

describe('UserGroupService', () => {
  let service: UserGroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        UserGroupService,
        ConfigStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserGroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch groups with default params', () => {
    TestBed.flushEffects();

    const req = httpMock.expectOne((request) => request.url.endsWith('/api/users/self/groups'));
    expect(req.request.params.get('limit')).toBe('10');
    expect(req.request.params.get('offset')).toBe('0');
    req.flush({ data: { rows: [{ id: '1', name: 'Test Group' }], count: 1 } });
    
    TestBed.flushEffects();
    const groups = service.items();
    expect(groups.length).toBe(1);
    expect(groups[0].name).toBe('Test Group');
  });

  it('should apply filters', () => {
    TestBed.flushEffects();
    const initialReq = httpMock.expectOne((request) => request.url.endsWith('/api/users/self/groups'));
    initialReq.flush({ data: { rows: [], count: 0 } });
    TestBed.flushEffects();

    service.setParam('visibility', 'private');
    service.setParam('search', 'query');
    
    TestBed.flushEffects();

    // Only one request should be sent for both param changes due to debounceTime(0)
    const req = httpMock.expectOne((request) => 
        request.url.endsWith('/api/users/self/groups') && 
        request.params.get('visibility') === 'private' &&
        request.params.get('search') === 'query'
    );
    req.flush({ data: { rows: [], count: 0 } });
    TestBed.flushEffects();
  });

  it('should getPreview with specific limit', async () => {
    const promise = firstValueFrom(service.getPreview(5));
    
    const req = httpMock.expectOne((request) => request.url.endsWith('/api/users/self/groups') && request.params.get('limit') === '5');
    req.flush({ data: { rows: [{ id: '1', name: 'Preview Group' }] } });

    const groups = await promise;
    expect(groups.length).toBe(1);
  });
});

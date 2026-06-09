import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { PublicGroupService } from './public-group.service';
import { ConfigStore } from '../state/config.store';
import { TranslateModule } from '@ngx-translate/core';
import { firstValueFrom } from 'rxjs';

describe('PublicGroupService', () => {
  let service: PublicGroupService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [TranslateModule.forRoot()],
      providers: [
        PublicGroupService,
        ConfigStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(PublicGroupService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should fetch public groups', () => {
    TestBed.flushEffects();
    const req = httpMock.expectOne((request) => request.url.endsWith('/api/groups'));
    req.flush({ data: { rows: [{ id: '1', name: 'Public Group' }], count: 1 } });
    TestBed.flushEffects();
    
    const groups = service.items();
    expect(groups.length).toBe(1);
  });

  it('should getPreview', async () => {
    const promise = firstValueFrom(service.getPreview(3));
    const req = httpMock.expectOne((request) => request.url.endsWith('/api/groups') && request.params.get('limit') === '3');
    req.flush({ data: { rows: [] } });
    await promise;
  });
});

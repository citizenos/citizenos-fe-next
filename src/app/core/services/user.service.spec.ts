import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserService } from './user.service';
import { ConfigStore } from '../state/config.store';

describe('UserService', () => {
  let service: UserService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        UserService,
        ConfigStore,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    service = TestBed.inject(UserService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should call loginMobiilIdInit', () => {
    service.loginMobiilIdInit('12345678901', '+3725555555').subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/mobile/init');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pid: '12345678901', phoneNumber: '+3725555555' });
    req.flush({ data: { challengeID: 1234, token: 'xxx' } });
  });

  it('should call loginSmartIdInit', () => {
    service.loginSmartIdInit('12345678901', 'EE').subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/smartid/init');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual({ pid: '12345678901', countryCode: 'EE' });
    req.flush({ data: { challengeID: 1234, token: 'xxx' } });
  });

  it('should call loginIdCard', () => {
    const mockData = { some: 'cert-data' };
    service.loginIdCard(mockData).subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/id');
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(mockData);
    req.flush({ data: { success: true } });
  });
});

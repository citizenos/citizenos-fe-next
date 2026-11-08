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

  it('should call update profile', () => {
    const params = { name: 'New Name', company: 'New Company' };
    service.update(params).subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/users/self');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ ...params, redirectSuccess: 'http://localhost:3000/' });
    req.flush({ data: { success: true } });
  });

  it('should call updateLanguage', () => {
    service.updateLanguage('et').subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/users/self');
    expect(req.request.method).toBe('PUT');
    expect(req.request.body).toEqual({ language: 'et' });
    req.flush({ data: { success: true } });
  });

  it('should call deleteUser', () => {
    service.deleteUser().subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/users/self');
    expect(req.request.method).toBe('DELETE');
    req.flush({ data: { success: true } });
  });

  it('should call uploadUserImage', () => {
    const file = new File([''], 'test.png', { type: 'image/png' });
    service.uploadUserImage(file).subscribe();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/users/self/upload');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.get('file')).toBe(file);
    req.flush({ data: { imageUrl: 'some-url' } });
  });

  describe('getPartnerLoginUrl', () => {
    it('should convert relative redirectSuccess to absolute URL with origin', () => {
      const url = service.getPartnerLoginUrl('google', '/en/topics/03099901-b668-45bc-b700-117565495c0c');
      expect(url).toBe(
        `https://dev.api.citizenos.com:3003/api/auth/google?redirectSuccess=${encodeURIComponent(window.location.origin + '/en/topics/03099901-b668-45bc-b700-117565495c0c')}`
      );
    });

    it('should preserve absolute redirectSuccess', () => {
      const target = 'https://dev.citizenos.com/en/topics/vote/create';
      const url = service.getPartnerLoginUrl('facebook', target);
      expect(url).toBe(
        `https://dev.api.citizenos.com:3003/api/auth/facebook?redirectSuccess=${encodeURIComponent(target)}`
      );
    });

    it('should fallback to current page URL when redirectSuccess is omitted on content pages', () => {
      const originalLocation = window.location;
      vi.stubGlobal('location', {
        ...originalLocation,
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000/en/topics/my-topic',
        pathname: '/en/topics/my-topic'
      });

      const url = service.getPartnerLoginUrl('google');
      expect(url).toBe(
        `https://dev.api.citizenos.com:3003/api/auth/google?redirectSuccess=${encodeURIComponent('http://localhost:3000/en/topics/my-topic')}`
      );

      vi.unstubAllGlobals();
    });

    it('should fallback to root when on login or signup pages and redirectSuccess is omitted', () => {
      const originalLocation = window.location;
      vi.stubGlobal('location', {
        ...originalLocation,
        origin: 'http://localhost:3000',
        href: 'http://localhost:3000/en/account/login',
        pathname: '/en/account/login'
      });

      const url = service.getPartnerLoginUrl('google');
      expect(url).toBe(
        `https://dev.api.citizenos.com:3003/api/auth/google?redirectSuccess=${encodeURIComponent('http://localhost:3000/')}`
      );

      vi.unstubAllGlobals();
    });
  });
});

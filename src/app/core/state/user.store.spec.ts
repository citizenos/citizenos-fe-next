import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from './user.store';
import { ConfigStore } from './config.store';
import { UserService } from '../services/user.service';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('UserStore', () => {
  let store: InstanceType<typeof UserStore>;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        TranslateModule.forRoot()
      ],
      providers: [
        UserStore,
        ConfigStore,
        UserService,
        provideHttpClient(),
        provideHttpClientTesting()
      ]
    });
    
    httpMock = TestBed.inject(HttpTestingController);
    store = TestBed.inject(UserStore);

    // Call initial checkStatus() manually as we removed onInit hook
    store.checkStatus();
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/status');
    req.flush({ data: null });
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should initialize with default state', () => {
    expect(store.user()).toBeNull();
    expect(store.isAuthenticated()).toBeFalsy();
    expect(store.isLoading()).toBeFalsy();
  });

  it('should call loginSmartIdInit and update loading state', async () => {
    const promise = store.loginSmartIdInit('12345678901');
    
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/smartid/init');
    expect(store.isLoading()).toBeTruthy();
    
    req.flush({ data: { challengeID: 1234, token: 'tok' } });
    const res = await promise;
    
    expect(res.challengeID).toBe(1234);
    expect(store.isLoading()).toBeFalsy();
  });

  it('should call loginSmartIdStatus', async () => {
    const promise = store.loginSmartIdStatus('tok');
    
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/auth/smartid/status') && r.params.get('token') === 'tok');
    req.flush({ status: { code: 20001 } });
    
    const res = await promise;
    expect(res.status.code).toBe(20001);
  });

  it('should call loginMobiilIdInit and update loading state', async () => {
    const promise = store.loginMobiilIdInit('12345678901', '+372555');
    
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/auth/mobile/init'));
    expect(store.isLoading()).toBeTruthy();
    
    req.flush({ data: { challengeID: 1234, token: 'tok' } });
    const res = await promise;
    
    expect(res.challengeID).toBe(1234);
    expect(store.isLoading()).toBeFalsy();
  });

  it('should call loginMobiilIdStatus', async () => {
    const promise = store.loginMobiilIdStatus('tok');
    
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/auth/mobile/status') && r.params.get('token') === 'tok');
    req.flush({ status: { code: 20001 } });
    
    const res = await promise;
    expect(res.status.code).toBe(20001);
  });

  it('should call loginIdCard', async () => {
    const authResponse = { response: 'test' };
    const promise = store.loginIdCard(authResponse);
    
    const req = httpMock.expectOne((r) => r.url.endsWith('/api/auth/id'));
    expect(req.request.method).toBe('POST');
    expect(req.request.body).toEqual(authResponse);
    
    req.flush({ status: { code: 200 } });
    
    await new Promise(resolve => setTimeout(resolve, 0)); // Wait for second request to be triggered
    
    const statusReq = httpMock.expectOne((r) => r.url.includes('/api/auth/status'));
    statusReq.flush({ data: null });
    
    await promise;
  });
});

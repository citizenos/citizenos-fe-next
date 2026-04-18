import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting, HttpTestingController } from '@angular/common/http/testing';
import { TranslateModule } from '@ngx-translate/core';
import { UserStore } from './user.store';
import { ConfigStore } from './config.store';
import { UserService } from '../services/user.service';

describe('UserStore', () => {
  let store: any;
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

    // Handle initial checkStatus() call from withHooks onInit
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
    const promise = store.loginSmartIdInit('12345678901', 'EE');
    
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/smartid/init');
    expect(store.isLoading()).toBeTruthy();
    
    req.flush({ challengeID: 1234, token: 'tok' });
    const res = await promise;
    
    expect(res.challengeID).toBe(1234);
    expect(store.isLoading()).toBeFalsy();
  });

  it('should call loginMobiilIdInit and update loading state', async () => {
    const promise = store.loginMobiilIdInit('12345678901', '+372555');
    
    const req = httpMock.expectOne('https://dev.api.citizenos.com:3003/api/auth/mobile/init');
    expect(store.isLoading()).toBeTruthy();
    
    req.flush({ challengeID: 1234, token: 'tok' });
    const res = await promise;
    
    expect(res.challengeID).toBe(1234);
    expect(store.isLoading()).toBeFalsy();
  });
});

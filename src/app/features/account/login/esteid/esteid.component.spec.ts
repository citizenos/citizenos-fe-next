import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { EstEidComponent } from './esteid.component';
import { UserStore } from '../../../../core/state/user.store';
import { of } from 'rxjs';
import * as webeid from '@web-eid/web-eid-library/web-eid';
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MockButtonComponent, MockInputComponent, MockIconComponent } from '../../../../shared/testing/mocks';

vi.mock('@web-eid/web-eid-library/web-eid', () => ({
  authenticate: vi.fn()
}));
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { InputComponent } from '../../../../shared/components/input/input.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

describe('EstEidComponent', () => {
  let component: EstEidComponent;
  let fixture: ComponentFixture<EstEidComponent>;
  let mockUserStore: unknown;

  beforeEach(async () => {
    mockUserStore = {
      isLoading: vi.fn(() => false),
      loginMobiilIdInit: vi.fn(),
      loginMobiilIdStatus: vi.fn(),
      loginIdCard: vi.fn(),
      checkStatus: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        EstEidComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore }
      ]
    })
    .overrideComponent(EstEidComponent, {
      remove: { imports: [ButtonComponent, InputComponent, IconComponent] },
      add: { imports: [MockButtonComponent, MockInputComponent, MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(EstEidComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should validate Mobile-ID form', () => {
    expect(component.mobileIdForm.valid).toBeFalsy();
    
    component.mobileIdForm.controls.pid.setValue('12345678901');
    component.mobileIdForm.controls.phoneNumber.setValue('+3725555555');
    expect(component.mobileIdForm.valid).toBeTruthy();
  });

  it('should call loginMobiilIdInit and start polling', async () => {
    vi.useFakeTimers();
    const initResponse = { challengeID: 1234, token: 'test-token' };
    (mockUserStore as { loginMobiilIdInit: vi.Mock }).loginMobiilIdInit.mockResolvedValue(initResponse);
    (mockUserStore as { loginMobiilIdStatus: vi.Mock }).loginMobiilIdStatus.mockReturnValue(of({ status: { code: 20001 } }));

    component.mobileIdForm.controls.pid.setValue('12345678901');
    component.mobileIdForm.controls.phoneNumber.setValue('+3725555555');
    await component.onMobileSubmit();
    
    expect((mockUserStore as { loginMobiilIdInit: vi.Mock }).loginMobiilIdInit).toHaveBeenCalledWith('12345678901', '+3725555555');
    expect(component.challengeID()).toBe(1234);
    
    await vi.advanceTimersByTimeAsync(3001);
    expect(mockUserStore.loginMobiilIdStatus).toHaveBeenCalledWith('test-token');
    vi.useRealTimers();
  });

  it('should call authIdCard', async () => {
    (webeid.authenticate as vi.Mock).mockResolvedValue({ response: 'test' });
    (mockUserStore as { loginIdCard: vi.Mock }).loginIdCard.mockResolvedValue(undefined);

    await component.authIdCard();

    expect(webeid.authenticate).toHaveBeenCalled();
    expect((mockUserStore as { loginIdCard: vi.Mock }).loginIdCard).toHaveBeenCalledWith({ response: 'test' });
  });

  it('should handle ID-card authentication error', async () => {
    (webeid.authenticate as vi.Mock).mockRejectedValue(new Error('Auth failed'));

    await component.authIdCard();

    expect(component.error()).toBe('Auth failed');
    expect(component.isLoadingIdCard()).toBeFalsy();
  });
});

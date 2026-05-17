import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { RouterModule } from '@angular/router';
import { SmartIdComponent } from './smart-id.component';
import { UserStore } from '../../../../core/state/user.store';
import { of } from 'rxjs';
import { vi, describe, it, expect, beforeEach, afterEach, Mock } from 'vitest';
import { MockButtonComponent, MockIconComponent } from '../../../../shared/testing/mocks';
import { ButtonComponent } from '../../../../shared/components/button/button.component';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

describe('SmartIdComponent', () => {
  let component: SmartIdComponent;
  let fixture: ComponentFixture<SmartIdComponent>;
  let mockUserStore: unknown;

  beforeEach(async () => {
    mockUserStore = {
      isLoading: vi.fn(() => false),
      loginSmartIdInit: vi.fn(),
      loginSmartIdStatus: vi.fn(),
      checkStatus: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [
        SmartIdComponent,
        ReactiveFormsModule,
        TranslateModule.forRoot(),
        RouterModule.forRoot([])
      ],
      providers: [
        { provide: UserStore, useValue: mockUserStore }
      ]
    })
    .overrideComponent(SmartIdComponent, {
      remove: { imports: [ButtonComponent, IconComponent] },
      add: { imports: [MockButtonComponent, MockIconComponent] }
    })
    .compileComponents();

    fixture = TestBed.createComponent(SmartIdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should have invalid form when pid is empty', () => {
    expect(component.smartIdForm.valid).toBeFalsy();
  });

  it('should have invalid form when pid is not 11 digits', () => {
    component.smartIdForm.controls.pid.setValue('123');
    expect(component.smartIdForm.valid).toBeFalsy();
  });

  it('should have valid form when pid is 11 digits', () => {
    component.smartIdForm.controls.pid.setValue('12345678901');
    expect(component.smartIdForm.valid).toBeTruthy();
  });

  it('should call loginSmartIdInit on submit and start polling', async () => {
    vi.useFakeTimers();
    const initResponse = { challengeID: 1234, token: 'test-token' };
    (mockUserStore as { loginSmartIdInit: Mock }).loginSmartIdInit.mockResolvedValue(initResponse);
    (mockUserStore as { loginSmartIdStatus: Mock }).loginSmartIdStatus.mockReturnValue(of({ status: { code: 20001 } }));

    component.smartIdForm.controls.pid.setValue('12345678901');
    await component.onSubmit();
    
    expect((mockUserStore as { loginSmartIdInit: Mock }).loginSmartIdInit).toHaveBeenCalledWith('12345678901');
    expect(component.challengeID()).toBe(1234);
    
    await vi.advanceTimersByTimeAsync(3001);
    expect((mockUserStore as { loginSmartIdStatus: Mock }).loginSmartIdStatus).toHaveBeenCalledWith('test-token');
    vi.useRealTimers();
  });

  it('should show error when init fails', async () => {
    (mockUserStore as { loginSmartIdInit: Mock }).loginSmartIdInit.mockRejectedValue({ error: { status: { message: 'Error' } } });

    component.smartIdForm.controls.pid.setValue('12345678901');
    await component.onSubmit();
    
    expect(component.error()).toBe('Error');
    expect(component.challengeID()).toBeNull();
  });
});

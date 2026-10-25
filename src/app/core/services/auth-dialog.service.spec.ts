import { TestBed } from '@angular/core/testing';
import { AuthDialogService } from './auth-dialog.service';
import { DialogService, DialogRef } from '../../shared/dialog';
import { LoginDialogComponent } from '../../features/account/components/login-dialog/login-dialog.component';
import { RegisterDialogComponent } from '../../features/account/components/register-dialog/register-dialog.component';

describe('AuthDialogService', () => {
  let service: AuthDialogService;
  let dialogServiceMock: { open: ReturnType<typeof vi.fn> };
  let dialogRefMock: Partial<DialogRef<unknown, boolean>>;

  beforeEach(() => {
    dialogRefMock = {
      close: vi.fn(),
      afterClosed: vi.fn(),
    };
    dialogServiceMock = {
      open: vi.fn().mockReturnValue(dialogRefMock),
    };

    TestBed.configureTestingModule({
      providers: [
        AuthDialogService,
        { provide: DialogService, useValue: dialogServiceMock },
      ],
    });

    service = TestBed.inject(AuthDialogService);
  });

  it('should open LoginDialogComponent with redirectSuccess data', () => {
    const ref = service.openLogin('https://example.com/topic');
    expect(dialogServiceMock.open).toHaveBeenCalledWith(LoginDialogComponent, {
      data: { redirectSuccess: 'https://example.com/topic' },
    });
    expect(ref).toBe(dialogRefMock as unknown as DialogRef<LoginDialogComponent, boolean>);
  });

  it('should open RegisterDialogComponent with redirectSuccess and inviteId', () => {
    const ref = service.openRegister('https://example.com/join', 'invite-123');
    expect(dialogServiceMock.open).toHaveBeenCalledWith(RegisterDialogComponent, {
      data: { redirectSuccess: 'https://example.com/join', inviteId: 'invite-123' },
    });
    expect(ref).toBe(dialogRefMock as unknown as DialogRef<RegisterDialogComponent, boolean>);
  });
});

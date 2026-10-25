import { inject, Service } from '@angular/core';
import { DialogService, DialogRef } from '../../shared/dialog';
import { LoginDialogComponent, LoginDialogData } from '../../features/account/components/login-dialog/login-dialog.component';
import { RegisterDialogComponent, RegisterDialogData } from '../../features/account/components/register-dialog/register-dialog.component';

@Service()
export class AuthDialogService {
  private dialog = inject(DialogService);

  openLogin(redirectSuccess?: string): DialogRef<LoginDialogComponent, boolean> {
    return this.dialog.open<LoginDialogComponent, boolean>(LoginDialogComponent, {
      data: { redirectSuccess } as LoginDialogData,
    });
  }

  openRegister(redirectSuccess?: string, inviteId?: string): DialogRef<RegisterDialogComponent, boolean> {
    return this.dialog.open<RegisterDialogComponent, boolean>(RegisterDialogComponent, {
      data: { redirectSuccess, inviteId } as RegisterDialogData,
    });
  }
}

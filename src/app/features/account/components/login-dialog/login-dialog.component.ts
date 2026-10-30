import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { LoginFormComponent } from '../login-form/login-form.component';
import { RegisterDialogComponent } from '../register-dialog/register-dialog.component';

export interface LoginDialogData {
  redirectSuccess?: string;
}

@Component({
  selector: 'app-login-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent, LoginFormComponent],
  template: `
    <div class="auth-dialog-card">
      <div class="auth-dialog-header">
        <h2 class="dialog-title">{{ 'VIEWS.LOGIN.LOGIN_TITLE' | translate }}</h2>
        <button
          type="button"
          class="btn-dialog-close"
          (click)="close()"
          [attr.aria-label]="'BTN_CLOSE' | translate"
        >
          <cos-icon name="close" [size]="20"></cos-icon>
        </button>
      </div>

      <app-login-form
        [isDialog]="true"
        [redirectSuccess]="data.redirectSuccess"
        (loggedIn)="onLoggedIn()"
        (switchToRegister)="openRegister()"
      />
    </div>
  `,
  styleUrl: './login-dialog.component.scss'
})
export class LoginDialogComponent {
  private dialogRef = inject(DialogRef);
  private dialogService = inject(DialogService);
  readonly data = inject<LoginDialogData>(DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }

  onLoggedIn() {
    this.dialogRef.close(true);
  }

  openRegister() {
    this.dialogRef.close();
    this.dialogService.open(RegisterDialogComponent, {
      data: { redirectSuccess: this.data?.redirectSuccess }
    });
  }
}

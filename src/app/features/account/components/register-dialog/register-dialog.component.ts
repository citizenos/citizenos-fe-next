import { Component, inject, ChangeDetectionStrategy } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';
import { RegisterFormComponent } from '../register-form/register-form.component';
import { LoginDialogComponent } from '../login-dialog/login-dialog.component';

export interface RegisterDialogData {
  redirectSuccess?: string;
  inviteId?: string;
}

@Component({
  selector: 'app-register-dialog',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [TranslateModule, IconComponent, RegisterFormComponent],
  template: `
    <div class="auth-dialog-card">
      <div class="auth-dialog-header">
        <div class="title-wrap">
          <h2 class="dialog-title">{{ 'COMPONENTS.REGISTER_FORM.HEADING' | translate }}</h2>
          <p class="dialog-subtitle">{{ 'COMPONENTS.REGISTER_FORM.HEADING_DESCRIPTION' | translate }}</p>
        </div>
        <button
          type="button"
          class="btn-dialog-close"
          (click)="close()"
          [attr.aria-label]="'BTN_CLOSE' | translate"
        >
          <cos-icon name="close" [size]="20"></cos-icon>
        </button>
      </div>

      <app-register-form
        [isDialog]="true"
        [redirectSuccess]="data.redirectSuccess"
        [inviteId]="data.inviteId"
        (registered)="onRegistered()"
        (switchToLogin)="openLogin()"
      />
    </div>
  `,
  styleUrl: './register-dialog.component.scss'
})
export class RegisterDialogComponent {
  private dialogRef = inject(DialogRef);
  private dialogService = inject(DialogService);
  readonly data = inject<RegisterDialogData>(DIALOG_DATA);

  close() {
    this.dialogRef.close();
  }

  onRegistered() {
    this.dialogRef.close(true);
  }

  openLogin() {
    this.dialogRef.close();
    this.dialogService.open(LoginDialogComponent, {
      data: { redirectSuccess: this.data?.redirectSuccess }
    });
  }
}

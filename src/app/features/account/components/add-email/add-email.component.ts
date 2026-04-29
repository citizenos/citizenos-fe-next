import { Component, inject } from '@angular/core';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { take } from 'rxjs';
import { TranslateModule } from '@ngx-translate/core';
import { DIALOG_DATA } from '../../../../shared/dialog/dialog-tokens';
import { DialogRef } from '../../../../shared/dialog/dialog-ref';
import { DialogService } from '../../../../shared/dialog/dialog.service';
import { DialogCloseDirective } from '../../../../shared/dialog/dialog-ref';
import { UserStore } from '../../../../core/state/user.store';
import { UserService } from '../../../../core/services/user.service';
import { NotificationService } from '../../../../core/services/notification.service';
import { NotificationComponent } from '../../../../shared/components/notification/notification.component';
import { User } from '../../../../core/interfaces/user';

export interface AddEmailData {
  user: User;
}

@Component({
  selector: 'app-add-email',
  standalone: true,
  imports: [TranslateModule, ReactiveFormsModule, DialogCloseDirective, NotificationComponent],
  templateUrl: './add-email.component.html',
  styleUrl: './add-email.component.scss',
})
export class AddEmailComponent {
  readonly data = inject<AddEmailData>(DIALOG_DATA);
  private dialogRef = inject(DialogRef);
  private dialog = inject(DialogService);
  private userStore = inject(UserStore);
  private userService = inject(UserService);
  private notification = inject(NotificationService);
  private router = inject(Router);

  form = new FormGroup({
    email: new FormControl('', [Validators.email]),
  });

  errors?: any;

  doUpdateProfile() {
    this.errors = null;
    const email = this.form.value.email;
    if (email) {
      this.userService.update({ email }).pipe(take(1)).subscribe(() => {
        this.notification.info('MSG_INFO_CHECK_EMAIL_TO_VERIFY_YOUR_NEW_EMAIL_ADDRESS');
        this.dialogRef.close(true);
        this.dialog.closeAll();
      });
    } else {
      this.errors = { email: 'MODALS.ADD_EMAIL_ERROR_MSG_INVALID' };
    }
  }

  logout() {
    this.userStore.logout().then(() => {
      this.dialogRef.close(false);
      this.dialog.closeAll();
      this.router.navigate(['account', 'login']);
    });
  }
}

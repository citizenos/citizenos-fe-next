import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule } from '@ngx-translate/core';
import { AuthDialogService } from '../../services/auth-dialog.service';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, TranslateModule],
  template: `
    <div class="page_unauthorized">
      <h2>401 - Unauthorized</h2>
      <p>You are not authorized to access this page.</p>
      <button type="button" class="btn_big_submit" (click)="openLogin()">{{ 'VIEWS.401.BTN_LOGIN' | translate }}</button>
      <a routerLink="/dashboard">Go to Dashboard</a>
    </div>
  `,
})
export class PageUnauthorizedComponent {
  private authDialog = inject(AuthDialogService);
  private router = inject(Router);

  openLogin() {
    this.authDialog.openLogin(this.router.url);
  }
}

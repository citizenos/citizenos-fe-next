import { Component, ChangeDetectionStrategy, inject } from '@angular/core';
import { RouterLink, Router } from '@angular/router';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { UserStore } from '../../state/user.store';
import { IconComponent } from '../../../shared/components/icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink, TranslateModule, IconComponent],
  templateUrl: './page-unauthorized.component.html',
  styleUrl: './page-unauthorized.component.scss'
})
export class PageUnauthorizedComponent {
  readonly userStore = inject(UserStore);
  readonly translate = inject(TranslateService);
  private readonly router = inject(Router);

  openLogin() {
    const queryParams: Record<string, string> = {};
    if (this.router.url && !this.router.url.includes('/account/')) {
      queryParams['redirectSuccess'] = this.router.url;
    }
    this.router.navigate(['/', this.translate.currentLang, 'account', 'login'], { queryParams });
  }

  openRegister() {
    const queryParams: Record<string, string> = {};
    if (this.router.url && !this.router.url.includes('/account/')) {
      queryParams['redirectSuccess'] = this.router.url;
    }
    this.router.navigate(['/', this.translate.currentLang, 'account', 'signup'], { queryParams });
  }
}

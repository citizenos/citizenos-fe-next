import { Component, ViewEncapsulation } from '@angular/core';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-terms-links',
  standalone: true,
  imports: [TranslateModule, IconComponent],
  template: `
    <ul class="links_wrapper">
      <li>
        <a class="link" href="https://citizenos.com/legal/api/" target="_blank">
          <cos-icon name="arrow-next"></cos-icon>
          <span translate="MODALS.PRIVACY_POLICY_LNK_TERMS_OF_USE"></span>
        </a>
      </li>
      <li>
        <a class="link" href="https://citizenos.com/legal/privacy/" target="_blank">
          <cos-icon name="arrow-next"></cos-icon>
          <span translate="MODALS.PRIVACY_POLICY_LNK_PRIVACY_POLICY"></span>
        </a>
      </li>
      <li>
        <a class="link" href="https://citizenos.com/legal/statute/" target="_blank">
          <cos-icon name="arrow-next"></cos-icon>
          <span translate="MODALS.PRIVACY_POLICY_LNK_ARTICLES_OF_ASSOCIATION"></span>
        </a>
      </li>
    </ul>
  `,
  styles: [`
    .links_wrapper {
      display: flex;
      flex-direction: column;
      align-items: flex-start;
      list-style: none;
      margin: 0;
      padding: 0;
      gap: 8px;

      .link {
        display: flex;
        gap: 8px;
        align-items: center;
        color: var(--color-link);
        text-decoration: none;
        font-weight: 600;
        cursor: pointer;

        span {
          text-decoration: underline;
        }

        &:hover span {
          text-decoration: none;
        }
      }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class TermsLinksComponent {}

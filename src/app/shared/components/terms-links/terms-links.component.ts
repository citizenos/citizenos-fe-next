import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-terms-links',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <ul class="links_wrapper">
      <li>
        <a class="link" href="https://citizenos.com/legal/api/" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12V14L19 11.5L15 9V11H6V12H15Z" fill="#2C3B47" />
          </svg>
          <span translate="MODALS.PRIVACY_POLICY_LNK_TERMS_OF_USE"></span>
        </a>
      </li>
      <li>
        <a class="link" href="https://citizenos.com/legal/privacy/" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12V14L19 11.5L15 9V11H6V12H15Z" fill="#2C3B47" />
          </svg>
          <span translate="MODALS.PRIVACY_POLICY_LNK_PRIVACY_POLICY"></span>
        </a>
      </li>
      <li>
        <a class="link" href="https://citizenos.com/legal/statute/" target="_blank">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M15 12V14L19 11.5L15 9V11H6V12H15Z" fill="#2C3B47" />
          </svg>
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

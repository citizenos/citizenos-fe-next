import { Component, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';

@Component({
  selector: 'cos-terms-links',
  standalone: true,
  imports: [CommonModule, TranslateModule],
  template: `
    <div class="terms-links">
      <a href="https://citizenos.com/terms/" target="_blank" translate="VIEWS.ACCOUNT.LNK_TERMS">Terms of Service</a>
      <a href="https://citizenos.com/privacy/" target="_blank" translate="VIEWS.ACCOUNT.LNK_PRIVACY">Privacy Policy</a>
    </div>
  `,
  styles: [`
    .terms-links {
      display: flex;
      flex-direction: column;
      gap: var(--spacing-sm);
    }
    
    .terms-links a {
      color: var(--color-link);
      font-weight: 600;
      text-decoration: underline;
      
      &:hover {
        text-decoration: none;
      }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class TermsLinksComponent {}

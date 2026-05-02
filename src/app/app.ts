import { Component, effect, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from './core/state/config.store';
import { TranslateModule } from '@ngx-translate/core';
import { DOCUMENT } from '@angular/common';
import { SeoService } from './core/services/seo.service';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, TranslateModule],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  private configStore = inject(ConfigStore);
  private document = inject(DOCUMENT);
  private seoService = inject(SeoService);

  constructor() {
    this.seoService.setPageTitle();
    this.seoService.updateMeta();
    effect(() => {
      const fontSize = this.configStore.fontSize();
      const theme = this.configStore.theme();
      
      const body = this.document.body;
      // Remove existing font size classes
      body.classList.remove('large', 'extra_large');
      
      if (fontSize !== 'medium') {
        body.classList.add(fontSize);
      }

      // Handle theme
      body.setAttribute('data-theme', theme);
    });
  }
}

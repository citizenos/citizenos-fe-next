import { Component, effect, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from './core/state/config.store';
import { DOCUMENT } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet],
  templateUrl: './app.html',
  styleUrl: './app.scss'
})
export class App {
  protected readonly title = signal('citizenos-fe-next');
  private configStore = inject(ConfigStore);
  private document = inject(DOCUMENT);

  constructor() {
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

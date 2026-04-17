import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from '../state/config.store';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet],
  template: `
    <div id="content_root" [class.dark-theme]="configStore.isDarkTheme()">
      <div id="content_header">
        <!-- Site Header / Navigation will go here -->
        <nav>
          <span>Citizenos FE Next (Lang: {{ configStore.language() }})</span>
        </nav>
      </div>

      <div id="content">
        <!-- Nested routes will be rendered here -->
        <router-outlet></router-outlet>
      </div>
    </div>
  `,
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  configStore = inject(ConfigStore);
}

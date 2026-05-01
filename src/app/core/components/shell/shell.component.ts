import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { ConfigStore } from '../../state/config.store';
import { NavComponent } from './nav/nav.component';
import { GlobalSearchPanelComponent } from './global-search-panel/global-search-panel.component';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, NavComponent, GlobalSearchPanelComponent],
  template: `
    <div id="content_root" [class.dark-theme]="configStore.isDarkTheme()">
      <cos-nav />
      <div id="main-content" tabindex="-1">
        <router-outlet></router-outlet>
      </div>
      <cos-global-search-panel></cos-global-search-panel>
    </div>
  `,
  styleUrl: './shell.component.scss'
})
export class ShellComponent {
  configStore = inject(ConfigStore);
}

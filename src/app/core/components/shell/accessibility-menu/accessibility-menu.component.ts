import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TranslateModule } from '@ngx-translate/core';
import { ConfigStore, FontSize } from '../../../state/config.store';
import { UiStateService } from '../../../services/ui-state.service';
import { IconComponent } from '../../../../shared/components/icon/icon.component';

@Component({
  selector: 'cos-accessibility-menu',
  standalone: true,
  imports: [CommonModule, TranslateModule, IconComponent],
  template: `
    @if (uiState.showAccessibility()) {
      <div class="accessibility_overlay" (click)="uiState.showAccessibility.set(false)"></div>
      <div id="accessibility_panel" class="open">
        <div class="accessibility_header">
          <div class="accessibility_title" translate="COMPONENTS.ACCESSIBILITY.TITLE"></div>
          <button class="accessibility_close" (click)="uiState.showAccessibility.set(false)">
            <cos-icon name="close" [size]="24"></cos-icon>
          </button>
        </div>

        <div class="accessibility_content">
          <div class="section">
            <div class="section_title" translate="COMPONENTS.ACCESSIBILITY.HEADING_CONTRAST"></div>
            <div class="options_grid">
              <button class="option_btn" [class.active]="configStore.theme() === 'light'" (click)="configStore.toggleTheme()">
                <div class="preview light">A</div>
                <span translate="COMPONENTS.ACCESSIBILITY.OPT_CONTRAST_DEFAULT"></span>
              </button>
              <button class="option_btn" [class.active]="configStore.theme() === 'dark'" (click)="configStore.toggleTheme()">
                <div class="preview dark">A</div>
                <span translate="COMPONENTS.ACCESSIBILITY.OPT_CONTRAST_HIGH"></span>
              </button>
            </div>
          </div>

          <div class="section">
            <div class="section_title" translate="COMPONENTS.ACCESSIBILITY.HEADING_TEXT_SIZE"></div>
            <div class="options_grid">
              <button class="option_btn" [class.active]="configStore.fontSize() === 'medium'" (click)="configStore.setFontSize('medium')">
                <div class="preview size_medium">Aa</div>
                <span translate="COMPONENTS.ACCESSIBILITY.OPT_SIZE_MEDIUM"></span>
              </button>
              <button class="option_btn" [class.active]="configStore.fontSize() === 'large'" (click)="configStore.setFontSize('large')">
                <div class="preview size_large">Aa</div>
                <span translate="COMPONENTS.ACCESSIBILITY.OPT_SIZE_LARGE"></span>
              </button>
              <button class="option_btn" [class.active]="configStore.fontSize() === 'extra_large'" (click)="configStore.setFontSize('extra_large')">
                <div class="preview size_extra_large">Aa</div>
                <span translate="COMPONENTS.ACCESSIBILITY.OPT_SIZE_EXTRA_LARGE"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    }
  `,
  styles: [`
    .accessibility_overlay {
      position: fixed;
      inset: 0;
      z-index: 99;
      background-color: rgba(44, 59, 71, 0.8);
    }

    #accessibility_panel {
      position: fixed;
      right: -400px;
      top: 0;
      width: 400px;
      height: 100%;
      background: var(--color-background);
      z-index: 100;
      display: flex;
      flex-direction: column;
      transition: right 0.3s ease;
      box-shadow: -2px 0 10px rgba(0,0,0,0.1);
    }

    #accessibility_panel.open {
      right: 0;
    }

    .accessibility_header {
      display: flex;
      align-items: center;
      padding: 16px;
      border-bottom: 1px solid var(--color-border);
      gap: 16px;
    }

    .accessibility_title {
      flex: 1;
      font-weight: 600;
      font-size: 18px;
    }

    .accessibility_close {
      background: none;
      border: none;
      cursor: pointer;
      padding: 4px;
      color: var(--color-text);
      display: flex;
      align-items: center;
    }

    .accessibility_content {
      flex: 1;
      overflow-y: auto;
      padding: 24px;
      display: flex;
      flex-direction: column;
      gap: 32px;
    }

    .section {
      display: flex;
      flex-direction: column;
      gap: 16px;
    }

    .section_title {
      font-weight: 600;
      font-size: 16px;
      color: var(--color-text-muted);
    }

    .options_grid {
      display: grid;
      grid-template-columns: repeat(2, 1fr);
      gap: 12px;
    }

    .option_btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: 8px;
      padding: 16px;
      background: var(--color-surfaces);
      border: 2px solid transparent;
      border-radius: 8px;
      cursor: pointer;
      transition: all 0.2s ease;
    }

    .option_btn:hover {
      background: var(--color-border);
    }

    .option_btn.active {
      border-color: var(--color-primary);
      background: var(--color-background);
    }

    .preview {
      width: 60px;
      height: 60px;
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 4px;
      font-size: 24px;
      font-weight: 700;
    }

    .preview.light {
      background: white;
      color: #2C3B47;
      border: 1px solid #ddd;
    }

    .preview.dark {
      background: #2C3B47;
      color: white;
    }

    .preview.size_medium { font-size: 16px; }
    .preview.size_large { font-size: 20px; }
    .preview.size_extra_large { font-size: 24px; }

    @media (max-width: 560px) {
      #accessibility_panel {
        width: 100%;
        right: -100%;
      }
    }
  `]
})
export class AccessibilityMenuComponent {
  public configStore = inject(ConfigStore);
  public uiState = inject(UiStateService);
}

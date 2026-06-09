import { Component, input, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-dropdown',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="dropdown-wrapper" [class.open]="isOpen()">
      <div class="dropdown-selection"
           [class.with_label]="placeholder()"
           (click)="toggle()"
           (keydown.enter)="toggle()"
           (keydown.space)="toggle(); $event.preventDefault()"
           role="combobox"
           tabindex="0"
           aria-haspopup="listbox"
           [attr.aria-expanded]="isOpen()"
           aria-controls="dropdown-options-panel"
           [attr.aria-label]="placeholder() || 'Toggle dropdown'">
        <div class="dropdown-content">
          @if (placeholder()) {
            <span class="dropdown-label">{{ placeholder() }}</span>
          }
          <div class="dropdown-value">
            <ng-content select="[selection]"></ng-content>
          </div>
        </div>
        <div class="dropdown-arrow">
          <cos-icon name="chevron-down"></cos-icon>
        </div>
      </div>
      @if (isOpen()) {
        <div id="dropdown-options-panel" class="dropdown-options" role="listbox" (click)="isOpen.set(false)" (keydown.escape)="isOpen.set(false)" tabindex="-1">
          <ng-content select="[options]"></ng-content>
        </div>
      }
    </div>
  `,
  styles: [`
    .dropdown-wrapper {
      position: relative;
      width: 100%;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast), box-shadow var(--transition-fast);

      &.open {
        border-color: var(--color-border-active);
        box-shadow: 0 0 0 3px var(--color-focus-ring);
      }
    }

    .dropdown-selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 16px;
      min-height: 48px;
      cursor: pointer;
      gap: 8px;
      position: relative;
      box-sizing: border-box;
    }

    .dropdown-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .dropdown-label {
      position: absolute;
      font-size: 12px;
      line-height: 16px;
      top: 4px;
      left: 16px;
      color: #727C84;
      pointer-events: none;
      font-family: 'Noto Sans', sans-serif;
    }

    .dropdown-value {
      font-size: 14px;
      color: var(--color-text);
      line-height: 20px;
      font-weight: 600;
      padding: 14px 0px 5px;
    }

    .dropdown-arrow {
      flex-shrink: 0;
      transition: transform 0.2s;
      color: var(--color-text-muted);
    }

    .open .dropdown-arrow {
      transform: rotate(180deg);
    }

    .dropdown-options {
      position: absolute;
      top: 100%;
      left: 0;
      right: 0;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      margin-top: 4px;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-height: 350px;
      overflow-y: auto;
    }

    ::ng-deep .dropdown-options .option,
    ::ng-deep .dropdown-options [role="option"] {
      padding: 10px 16px;
      cursor: pointer;
      font-size: 14px;
      color: var(--color-text);
      outline: none;
    }

    ::ng-deep .dropdown-options .option:hover,
    ::ng-deep .dropdown-options .option:focus,
    ::ng-deep .dropdown-options [role="option"]:hover,
    ::ng-deep .dropdown-options [role="option"]:focus {
      background: var(--color-secondary);
    }
  `],
})
export class DropdownComponent {
  placeholder = input<string>('');
  isOpen = signal<boolean>(false);

  toggle() {
    this.isOpen.set(!this.isOpen());
  }

  @HostListener('document:click', ['$event'])
  onDocumentClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    if (!target.closest('.dropdown-wrapper')) {
      this.isOpen.set(false);
    }
  }

  @HostListener('keydown.escape')
  onEscape() {
    this.isOpen.set(false);
  }
}

import { Component, input, signal, HostListener, ChangeDetectionStrategy } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-dropdown',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="dropdown-wrapper" [class.open]="isOpen()"
         role="combobox"
         [attr.aria-expanded]="isOpen()"
         aria-haspopup="listbox"
         aria-controls="dropdown-options-panel">
      <div class="dropdown-selection"
           (click)="toggle()"
           (keydown.enter)="toggle()"
           (keydown.space)="toggle(); $event.preventDefault()"
           role="button"
           tabindex="0"
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
      transition: border-color var(--transition-fast);

      &.open {
        border-color: var(--color-border-active);
      }
    }

    .dropdown-selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 6px 12px;
      cursor: pointer;
      gap: 8px;
    }

    .dropdown-content {
      flex: 1;
      display: flex;
      flex-direction: column;
      min-width: 0;
    }

    .dropdown-label {
      font-size: 12px;
      color: var(--color-text-muted);
      line-height: 16px;
    }

    .dropdown-value {
      font-size: 14px;
      color: var(--color-text);
      line-height: 20px;
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

    /* option item styles live in the parent component that projects them */
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

import { Component, signal, HostListener, ViewEncapsulation } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'cos-dropdown',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="dropdown-wrapper" [class.open]="isOpen()" 
         role="combobox" 
         [attr.aria-expanded]="isOpen()" 
         aria-haspopup="listbox">
      <div class="dropdown-selection" 
           (click)="toggle()" 
           (keydown.enter)="toggle()" 
           (keydown.space)="toggle(); $event.preventDefault()"
           tabindex="0">
        <ng-content select="[selection]"></ng-content>
        <div class="dropdown-arrow">
          <cos-icon name="chevron-down"></cos-icon>
        </div>
      </div>
      @if (isOpen()) {
        <div class="dropdown-options" role="listbox">
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
      border: 1px solid var(--color-border-bold);
      border-radius: var(--radius-md);
    }

    .dropdown-selection {
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 12px 16px;
      cursor: pointer;
      min-height: 48px;
    }

    .dropdown-arrow {
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
      border: 1px solid var(--color-border-bold);
      border-radius: var(--radius-md);
      margin-top: 4px;
      z-index: 100;
      box-shadow: 0 4px 12px rgba(0,0,0,0.1);
      max-height: 200px;
      overflow-y: auto;
    }

    .dropdown-options .option {
      padding: 12px 16px;
      cursor: pointer;
      transition: background 0.1s;
      
      &:hover {
        background: var(--color-secondary);
      }
    }
  `],
  encapsulation: ViewEncapsulation.None
})
export class DropdownComponent {
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

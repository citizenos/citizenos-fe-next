import { Component, input, output, signal, HostListener, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'cos-dropdown',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="dropdown-wrapper" [class.open]="isOpen()">
      <div class="dropdown-selection" (click)="toggle()">
        <ng-content select="[selection]"></ng-content>
        <div class="dropdown-arrow">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M17 10L12 15L7 10" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
          </svg>
        </div>
      </div>
      @if (isOpen()) {
        <div class="dropdown-options">
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
      border: 1px solid var(--color-border);
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
}

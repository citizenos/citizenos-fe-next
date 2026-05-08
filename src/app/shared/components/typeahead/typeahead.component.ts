import {
  Component,
  input,
  output,
  signal,
  HostListener,
  ElementRef,
  inject,
  ChangeDetectionStrategy,
  ViewEncapsulation,
  model,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';

export interface TypeaheadItem {
  id: string | number;
  [key: string]: unknown;
}

@Component({
  selector: 'cos-typeahead',
  standalone: true,
  imports: [FormsModule, TranslateModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (label()) {
      <div class="typeahead-label">{{ label() }}</div>
    }

    <div
      class="typeahead-input-wrap"
      [class.focused]="focused()"
      [class.has-results]="items().length"
    >
      @if (!focused()) {
        <span class="typeahead-search-icon" aria-hidden="true">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path fill-rule="evenodd" clip-rule="evenodd"
              d="M14.1922 15.6064C13.0236 16.4816 11.5723 17 10 17C6.13401 17 3 13.866 3 10C3 6.13401 6.13401 3 10 3C13.866 3 17 6.13401 17 10C17 11.5723 16.4816 13.0236 15.6064 14.1922L19.7071 18.2929C20.0976 18.6834 20.0976 19.3166 19.7071 19.7071C19.3166 20.0976 18.6834 20.0976 18.2929 19.7071L14.1922 15.6064ZM15 10C15 12.7614 12.7614 15 10 15C7.23858 15 5 12.7614 5 10C5 7.23858 7.23858 5 10 5C12.7614 5 15 7.23858 15 10Z"
              fill="#727C84"/>
          </svg>
        </span>
      }

      <input
        type="text"
        autocomplete="off"
        [placeholder]="placeholder() || ''"
        [(ngModel)]="term"
        (ngModelChange)="onQuery()"
        (focus)="onFocus()"
        (blur)="onBlur()"
      />

      @if (showEnterHint()) {
        <button class="typeahead-enter-hint" (click)="doEnterAction()" translate>
          COMPONENTS.TYPEAHEAD.PRESS_ENTER_TO_ADD
        </button>
      }
    </div>

    <ng-content></ng-content>
  `,
  styles: [`
    .typeahead-label {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-bottom: 4px;
    }

    .typeahead-input-wrap {
      display: flex;
      align-items: center;
      gap: 8px;
      padding: 0 12px;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: var(--radius-md);
      transition: border-color var(--transition-fast);

      &.focused {
        border-color: var(--color-link);

        &.has-results {
          border-radius: var(--radius-md) var(--radius-md) 0 0;
        }
      }

      input {
        flex: 1;
        border: none;
        height: 48px;
        width: 100%;
        font-size: 14px;
        font-family: var(--font-family-base);
        background: transparent;
        color: var(--color-text);
        outline: none;

        &::placeholder { color: var(--color-text-muted); }
      }
    }

    .typeahead-search-icon {
      display: flex;
      width: 24px;
      height: 24px;
      flex-shrink: 0;
    }

    .typeahead-enter-hint {
      font-size: 12px;
      color: var(--color-link);
      background: none;
      border: none;
      cursor: pointer;
      white-space: nowrap;
      padding: 0;
      font-family: var(--font-family-base);
    }
  `]
})
export class TypeaheadComponent {
  label = input<string>();
  placeholder = input<string>();
  selectLimit = input<number | null>(null);
  term = model<string>('');

  searchQuery = output<string>();
  selectItem = output<TypeaheadItem>();
  enterAction = output<{ text: string; limit: boolean }>();

  focused = signal(false);
  showEnterHint = signal(false);

  private el = inject(ElementRef);
  private registeredItems: TypeaheadItem[] = [];
  private activeItem: TypeaheadItem | null = null;

  items() {
    return this.registeredItems;
  }

  registerItem(item: TypeaheadItem) {
    this.registeredItems.push(item);
  }

  activate(item: TypeaheadItem) {
    this.activeItem = item;
  }

  selectActive() {
    if (!this.activeItem && this.registeredItems.length) {
      this.activeItem = this.registeredItems[0];
    }
    if (this.activeItem) this.doSelect(this.activeItem);
  }

  doSelect(item: TypeaheadItem) {
    this.term.set('');
    this.registeredItems = [];
    this.activeItem = null;
    this.selectItem.emit(item);
  }

  doEnterAction() {
    this.registeredItems = [];
    this.enterAction.emit({ text: this.term(), limit: true });
  }

  onQuery() {
    const t = this.term();
    this.registeredItems = [];
    this.activeItem = null;

    const multiWord =
      t.split(' ').filter((p) => p.length > 1).length > 1 ||
      t.split(',').filter((p) => p.length > 1).length > 1;
    this.showEnterHint.set(multiWord);

    this.searchQuery.emit(t);
  }

  onFocus() {
    this.focused.set(true);
  }

  onBlur() {
    setTimeout(() => this.focused.set(false), 200);
  }

  @HostListener('keydown', ['$event'])
  onKeydown(e: KeyboardEvent) {
    if (e.key === 'Enter') e.preventDefault();
    if (e.key === 'ArrowDown' || e.key === 'Tab') {
      e.preventDefault();
      this.activateNext();
    }
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      this.activatePrev();
    }
  }

  @HostListener('keyup', ['$event'])
  onKeyup(e: KeyboardEvent) {
    if (e.key === 'Enter') {
      const limit = this.selectLimit();
      if (!limit || (limit && this.term().length >= limit) || this.registeredItems.length) {
        this.selectActive();
      } else {
        this.doEnterAction();
      }
    }
    if (e.key === 'Escape') {
      this.term.set('');
      this.registeredItems = [];
    }
  }

  private getActiveIndex() {
    if (!this.activeItem) return -1;
    return this.registeredItems.findIndex((i) => i.id === this.activeItem!.id);
  }

  private activateNext() {
    const idx = this.getActiveIndex();
    this.activeItem = this.registeredItems[(idx + 1) % this.registeredItems.length] ?? null;
  }

  private activatePrev() {
    const idx = this.getActiveIndex();
    const len = this.registeredItems.length;
    this.activeItem = this.registeredItems[idx <= 0 ? len - 1 : idx - 1] ?? null;
  }
}

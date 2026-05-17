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
  Directive,
  Input,
  HostBinding,
  forwardRef,
  Inject,
  OnDestroy,
  AfterViewInit,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule } from '@ngx-translate/core';
import { IconComponent } from '../icon/icon.component';

export interface TypeaheadItemData {
  id: string | number;
  noClose?: boolean;
  [key: string]: unknown;
}

@Directive({
  selector: '[typeaheadItem]',
  standalone: true
})
export class TypeaheadItemDirective implements AfterViewInit, OnDestroy {
  @Input('typeaheadItem') itemData!: TypeaheadItemData;
  @Input() noClose!: boolean;

  private typeahead = inject(forwardRef(() => TypeaheadComponent));

  @HostBinding('class.active')
  get isActive() {
    return this.itemData?.id === this.typeahead.active()?.id;
  }

  @HostListener('mouseover')
  onMouseEnter() {
    this.typeahead.activate(this.itemData);
  }

  ngAfterViewInit() {
    if (this.noClose) this.itemData.noClose = true;
    this.typeahead.registerItem(this.itemData);
  }

  ngOnDestroy() {}
}

@Directive({
  selector: '[typeaheadSelect]',
  standalone: true
})
export class TypeaheadSelectDirective implements OnDestroy {
  @Input('typeaheadSelect') itemData!: TypeaheadItemData;
  select = output<TypeaheadItemData>();

  private typeahead = inject(forwardRef(() => TypeaheadComponent));

  @HostListener('click')
  onClick() {
    this.typeahead.activate(this.itemData);
    this.typeahead.selectActive();
    this.select.emit(this.itemData);
  }

  ngOnDestroy() {}
}

@Component({
  selector: 'cos-typeahead',
  standalone: true,
  imports: [FormsModule, TranslateModule, IconComponent, TypeaheadItemDirective, TypeaheadSelectDirective],
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `
    @if (label()) {
      <div class="ac-label">{{ label() }}</div>
    }

    <div
      id="input_wrap"
      [class.focused]="focused()"
      [class.results]="items().length"
    >
      @if (!focused()) {
        <div id="search_icon">
           <cos-icon name="search"></cos-icon>
        </div>
      }

      <input
        #input
        type="text"
        autocomplete="off"
        [placeholder]="placeholder() || ''"
        [ngModel]="term()"
        (ngModelChange)="term.set($event); onQuery()"
        (focus)="onFocus()"
        (blur)="onBlur()"
        autofocus
      />

      @if (showEnterHint()) {
        <a class="typeahead-enter-hint" (click)="doEnterAction()" translate>
          COMPONENTS.TYPEAHEAD.PRESS_ENTER_TO_ADD
        </a>
      }
    </div>

    <ng-content></ng-content>
  `,
  styles: [`
    @use "mixins";

    .ac-label {
      font-size: 12px;
      color: var(--color-text-muted);
      margin-bottom: 4px;

      &.hidden {
        display: none;
      }
    }

    #input_wrap {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 8px;
      padding: 0 8px;
      background: var(--color-surfaces);
      border: 1px solid var(--color-border);
      border-radius: 8px;
      position: relative;
      width: 100%;

      &.focused {
        border-color: var(--color-border-active);

        &.results {
          border-radius: 8px 8px 0 0;
        }
      }

      @include mixins.mobile {
        gap: 0;
      }

      #search_icon {
        display: flex;
        width: 24px;
        height: 24px;
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
        box-sizing: border-box;

        &::placeholder { color: var(--color-text-muted); }
      }

      a {
        display: flex;
        flex: none;
        font-size: 12px;
        color: var(--color-link);
        background: none;
        border: none;
        cursor: pointer;
        white-space: nowrap;
        padding: 0;
        font-family: var(--font-family-base);
        text-decoration: none;

        &:hover {
          text-decoration: underline;
        }
      }
    }
  `]
})
export class TypeaheadComponent {
  label = input<string>();
  placeholder = input<string>();
  selectLimit = input<number | null>(null);
  activeClass = input<string>();
  term = model<string>('');

  // Restoring legacy output names
  search = output<string>();
  select = output<TypeaheadItemData>();
  enterAction = output<{ text: string; limit: boolean }>();

  focused = signal(false);
  showEnterHint = signal(false);
  active = signal<TypeaheadItemData | null>(null);
  private itemList = signal<TypeaheadItemData[]>([]);

  private el = inject(ElementRef);

  items() {
    return this.itemList();
  }

  registerItem(item: TypeaheadItemData) {
    this.itemList.update(items => [...items, item]);
  }

  activate(item: TypeaheadItemData) {
    this.active.set(item);
  }

  isActive(item: TypeaheadItemData) {
    return this.active()?.id === item.id;
  }

  selectActive() {
    if (!this.active() && this.itemList().length) {
      this.active.set(this.itemList()[0]);
    }
    const currentActive = this.active();
    if (currentActive) this.doSelect(currentActive);
  }

  doSelect(item: TypeaheadItemData) {
    this.term.set('');
    this.itemList.set([]);
    this.active.set(null);
    this.select.emit(item);
  }

  doEnterAction() {
    this.itemList.set([]);
    this.enterAction.emit({ text: this.term(), limit: true });
  }

  onQuery() {
    const t = this.term();
    this.itemList.set([]);
    this.active.set(null);

    const multiWord =
      t.split(' ').filter((p) => p.length > 1).length > 1 ||
      t.split(',').filter((p) => p.length > 1).length > 1;
    this.showEnterHint.set(multiWord);

    this.search.emit(t);
  }

  onFocus() {
    const activeClass = this.activeClass() || 'active';
    this.el.nativeElement.classList.add(activeClass);
    this.focused.set(true);
  }

  onBlur() {
    setTimeout(() => {
      const activeClass = this.activeClass() || 'active';
      this.el.nativeElement.classList.remove(activeClass);
      this.focused.set(false);
    }, 200);
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
      const currentTerm = this.term();
      if (!limit || (limit && currentTerm && currentTerm.length >= limit) || this.itemList().length) {
        this.selectActive();
      } else {
        this.doEnterAction();
      }
    }
    if (e.key === 'Escape') {
      this.term.set('');
      this.itemList.set([]);
    }
  }

  private getActiveIndex() {
    const currentActive = this.active();
    if (!currentActive) return -1;
    return this.itemList().findIndex((i) => i.id === currentActive.id);
  }

  private activateNext() {
    const idx = this.getActiveIndex();
    const list = this.itemList();
    if (list.length === 0) return;
    this.active.set(list[(idx + 1) % list.length]);
  }

  private activatePrev() {
    const idx = this.getActiveIndex();
    const list = this.itemList();
    if (list.length === 0) return;
    this.active.set(list[idx <= 0 ? list.length - 1 : idx - 1]);
  }
}

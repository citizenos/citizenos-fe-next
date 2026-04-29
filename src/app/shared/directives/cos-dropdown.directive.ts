import { Directive, ElementRef, HostListener, inject, Renderer2, input } from '@angular/core';

@Directive({
  selector: '[cosDropdown]',
  standalone: true
})
export class CosDropdownDirective {
  private el = inject(ElementRef);
  private renderer = inject(Renderer2);

  cosDropdownMobile = input<boolean | string>(false);
  multipleChoice = input<boolean>(false);

  @HostListener('click', ['$event'])
  onClick(event: MouseEvent) {
    const target = event.target as HTMLElement;
    const elem = this.el.nativeElement;
    
    if (this.cosDropdownMobile() === true || this.cosDropdownMobile() === 'true') {
      this.renderer.addClass(elem, 'dropdown_active');
      if (elem.classList.contains('dropdown_selector')) {
        this.renderer.removeClass(elem, 'dropdown_active');
      }
    } else if (elem.classList.contains('dropdown_active') && (!this.multipleChoice() || target.classList.contains('selection'))) {
      this.renderer.removeClass(elem, 'dropdown_active');
    } else {
      this.renderer.addClass(elem, 'dropdown_active');
    }

    this.renderer.addClass(elem, 'active_recent');
  }

  @HostListener('document:click')
  onDocumentClick() {
    const elem = this.el.nativeElement;
    if (!elem.classList.contains('active_recent')) {
      this.renderer.removeClass(elem, 'dropdown_active');
    }
    this.renderer.removeClass(elem, 'active_recent');
  }

  @HostListener('document:keydown', ['$event'])
  onKeyPress(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      this.renderer.removeClass(this.el.nativeElement, 'dropdown_active');
      return;
    }
    const letter = event.key.toLowerCase();
    const dropdown = this.el.nativeElement;
    if (dropdown.classList.contains('dropdown_active') && letter.length === 1) {
      const optionsWrap = dropdown.querySelector('.options');
      if (optionsWrap) {
        const options = optionsWrap.querySelectorAll('.option');
        for (let i = 0; i < options.length; i++) {
          const item = options[i] as HTMLElement;
          if (item.innerText.trim().toLowerCase().indexOf(letter) === 0) {
            item.scrollIntoView({ block: 'nearest' });
            break;
          }
        }
      }
    }
  }
}

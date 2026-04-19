import { Component, computed, inject, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IconName, IconRegistryService } from './icon.registry';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

@Component({
  selector: 'cos-icon',
  standalone: true,
  imports: [CommonModule],
  template: `
    <svg
      [innerHTML]="safeSvgContent()"
      [attr.width]="widthAttr()"
      [attr.height]="heightAttr()"
      [attr.viewBox]="viewBox()"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    ></svg>
  `,
  styles: [`
    :host {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      line-height: 0;
    }
    svg {
      display: block;
    }
  `]
})
export class IconComponent {
  private registry = inject(IconRegistryService);
  private sanitizer = inject(DomSanitizer);

  name = input.required<IconName>();
  size = input<string | number>(24);
  
  widthAttr = computed(() => typeof this.size() === 'number' ? this.size() : null);
  heightAttr = computed(() => typeof this.size() === 'number' ? this.size() : null);

  safeSvgContent = computed(() => {
    const data = this.registry.getIcon(this.name());
    return data ? this.sanitizer.bypassSecurityTrustHtml(data.content) : '';
  });

  viewBox = computed(() => {
    const data = this.registry.getIcon(this.name());
    return data?.viewBox || '0 0 24 24';
  });
}

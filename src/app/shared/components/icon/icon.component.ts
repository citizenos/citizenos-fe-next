import { Component, computed, inject, model, input, ChangeDetectionStrategy } from '@angular/core';
import { IconName, IconRegistryService } from './icon.registry';
import { DomSanitizer } from '@angular/platform-browser';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-icon',
  standalone: true,
  imports: [],
  template: `
    <svg
      [innerHTML]="safeSvgContent()"
      [attr.width]="widthAttr()"
      [attr.height]="heightAttr()"
      [attr.viewBox]="viewBox()"
      [style.color]="color()"
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

  name = model<IconName | ''>('');
  size = model<string | number>(24);
  color = input<string>();

  widthAttr = computed(() => typeof this.size() === 'number' ? this.size() : null);
  heightAttr = computed(() => typeof this.size() === 'number' ? this.size() : null);

  safeSvgContent = computed(() => {
    const name = this.name();
    if (!name) return '';
    const data = this.registry.getIcon(name as IconName);
    return data ? this.sanitizer.bypassSecurityTrustHtml(data.content) : '';
  });

  viewBox = computed(() => {
    const name = this.name();
    if (!name) return '0 0 24 24';
    const data = this.registry.getIcon(name as IconName);
    return data?.viewBox || '0 0 24 24';
  });
}

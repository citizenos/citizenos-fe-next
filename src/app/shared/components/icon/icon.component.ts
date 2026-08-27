import { Component, computed, inject, model, input, ChangeDetectionStrategy } from '@angular/core';
import { IconName, IconRegistryService } from './icon.registry';
import { DomSanitizer } from '@angular/platform-browser';
import { toSignal } from '@angular/core/rxjs-interop';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-icon',
  standalone: true,
  imports: [],
  host: {
    '[style.--icon-size.px]': 'widthAttr()'
  },
  template: `
    <svg
      [innerHTML]="safeSvgContent()"
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
      width: var(--icon-size, 24px);
      height: var(--icon-size, 24px);
      position: relative;
    }
    svg {
      display: block;
      width: 100%;
      height: 100%;
    }
  `]
})
export class IconComponent {
  private registry = inject(IconRegistryService);
  private sanitizer = inject(DomSanitizer);
  private isLoaded = toSignal(this.registry.isLoaded);

  name = model<IconName | ''>('');
  size = model<string | number>(24);
  color = input<string>();

  widthAttr = computed(() => {
    const s = this.size();
    return typeof s === 'number' || !isNaN(Number(s)) ? s : null;
  });
  heightAttr = computed(() => {
    const s = this.size();
    return typeof s === 'number' || !isNaN(Number(s)) ? s : null;
  });

  safeSvgContent = computed(() => {
    const name = this.name();
    const loaded = this.isLoaded();
    if (!name || !loaded) return '';
    const data = this.registry.getIcon(name as IconName);
    return data ? this.sanitizer.bypassSecurityTrustHtml(data.content) : '';
  });

  viewBox = computed(() => {
    const name = this.name();
    const loaded = this.isLoaded();
    if (!name || !loaded) return '0 0 24 24';
    const data = this.registry.getIcon(name as IconName);
    return data?.viewBox || '0 0 24 24';
  });
}

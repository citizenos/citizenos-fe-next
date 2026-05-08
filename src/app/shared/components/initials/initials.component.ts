import { Component, computed, ChangeDetectionStrategy, ViewEncapsulation, model } from '@angular/core';

@Component({
  selector: 'cos-initials',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  encapsulation: ViewEncapsulation.None,
  template: `{{ initials() }}`,
  styles: [`
    cos-initials {
      display: inline-flex;
      align-items: center;
      justify-content: center;
      background: var(--color-secondary);
      color: var(--color-primary);
      border-radius: 50%;
      font-weight: 600;
      font-size: 14px;
      font-family: var(--font-family-base);
      width: 40px;
      height: 40px;
      flex-shrink: 0;
      user-select: none;
      text-transform: uppercase;
    }
  `]
})
export class InitialsComponent {
  name = model<string>('');
  limit = model<number>(2);

  initials = computed(() => {
    const parts = this.name().trim().split(/\s+/).filter(Boolean);
    if (!parts.length) return '?';
    if (parts.length === 1 || this.limit() === 1) return parts[0][0].toUpperCase();
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  });
}

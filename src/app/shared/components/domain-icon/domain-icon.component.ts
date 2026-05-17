import { Component, computed, input } from '@angular/core';

export type DomainType = 'topic' | 'ideation' | 'vote' | 'follow-up';

@Component({
  selector: 'cos-domain-icon',
  standalone: true,
  imports: [],
  template: `
    <div class="domain-icon" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 40 40" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect width="40" height="40" rx="20" [attr.fill]="config().bgColor" />
        <path [attr.d]="config().path" fill="white" [attr.fill-rule]="config().fillRule" [attr.clip-rule]="config().clipRule" />
      </svg>
    </div>
  `,
  styles: [`
    .domain-icon {
      display: inline-flex;
      align-items: center;
      justify-content: center;
    }
    svg {
      display: block;
    }
  `]
})
export class DomainIconComponent {
  type = input.required<DomainType>();
  size = input<number>(40);
  active = input<boolean>(false);

  config = computed(() => {
    const isActive = this.active();
    switch (this.type()) {
      case 'topic':
        return {
          bgColor: isActive ? '#1168A8' : '#5C9CD0',
          path: 'M11 20C11 14.4772 15.4772 10 21 10C26.5228 10 31 14.4772 31 20C31 25.5228 26.5228 30 21 30C19.7891 30 18.6315 29.7844 17.5619 29.3888L13 31V26.4381C11.7709 24.6983 11 22.502 11 20Z'
        };
      case 'ideation':
        return {
          bgColor: isActive ? '#EFE08A' : '#E4B722',
          path: 'M20 10C16.14 10 13 13.14 13 17C13 19.38 14.19 21.47 16 22.72V26C16 26.55 16.45 27 17 27H23C23.55 27 24 26.55 24 26V22.72C25.81 21.47 27 19.38 27 17C27 13.14 23.86 10 20 10ZM17.5 30C17.5 30.55 17.95 31 18.5 31H21.5C22.05 31 22.5 30.55 22.5 30V29H17.5V30Z'
        };
      case 'vote':
        return {
          bgColor: isActive ? '#5AB467' : '#98DAA2',
          path: 'M20 10C14.48 10 10 14.48 10 20C10 25.52 14.48 30 20 30C25.52 30 30 25.52 30 20C30 14.48 25.52 10 20 10ZM18.0556 25L25.8333 17.2807L24.375 15.8333L18.0556 22.1053L15.625 19.693L14.1667 21.1404L18.0556 25Z',
          fillRule: 'evenodd',
          clipRule: 'evenodd'
        };
      case 'follow-up':
        return {
          bgColor: isActive ? '#DA7AB1' : '#E3A8CC',
          path: 'M17.8933 11.5294L17.6 10H11V23H12.4667V17.6471H16.5733L16.8667 19.1765H22V11.5294H17.8933Z'
        };
    }
  });
}

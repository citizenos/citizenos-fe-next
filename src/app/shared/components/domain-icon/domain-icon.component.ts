import { Component, computed, input, ChangeDetectionStrategy } from '@angular/core';

export type DomainType = 'topic' | 'ideation' | 'vote' | 'follow-up';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'cos-domain-icon',
  standalone: true,
  imports: [],
  template: `
    <div class="domain-icon" [style.width.px]="size()" [style.height.px]="size()">
      <svg [attr.width]="size()" [attr.height]="size()" [attr.viewBox]="'0 0 ' + (config().viewBoxSize || 40) + ' ' + (config().viewBoxSize || 40)" fill="none" xmlns="http://www.w3.org/2000/svg">
        <rect [attr.width]="config().viewBoxSize || 40" [attr.height]="config().viewBoxSize || 40" [attr.rx]="(config().viewBoxSize || 40) / 2" [attr.fill]="config().bgColor" />
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
          viewBoxSize: 32,
          bgColor: isActive ? '#1168A8' : '#5C9CD0',
          path: 'M21.9997 17.7634C22.0238 17.7288 22.0469 17.6928 22.0707 17.6591C22.6751 16.7608 22.9985 15.703 22.9997 14.6203C23.0097 11.5172 20.3916 9 17.1541 9C14.3304 9 11.9747 10.9216 11.4229 13.4725C11.3401 13.8506 11.2982 14.2364 11.2979 14.6234C11.2979 17.7297 13.8154 20.3144 17.0529 20.3144C17.5675 20.3144 18.261 20.1597 18.6413 20.0553C19.0216 19.9509 19.3985 19.8131 19.496 19.7759C19.5935 19.7387 19.746 19.7006 19.8675 19.7356L22.2869 20.435C22.3082 20.4413 22.3307 20.4418 22.3523 20.4365C22.3738 20.4312 22.3935 20.4202 22.4095 20.4048C22.4254 20.3893 22.4369 20.3699 22.4428 20.3485C22.4487 20.3271 22.4488 20.3046 22.4432 20.2831L21.8894 18.1741C21.851 18.0178 21.846 17.9884 21.9997 17.7634Z M17.7669 20.9806C17.5264 21.0191 17.2835 21.0405 17.04 21.0447C15.7141 21.0447 14.4619 20.6947 13.4463 20.0384C12.7966 19.6397 12.2327 19.1158 11.7872 18.4972C10.9722 17.4169 10.5278 16.0437 10.5278 14.6069C10.5278 14.509 10.5313 14.415 10.5347 14.3206C10.536 14.2928 10.5286 14.2652 10.5136 14.2417C10.4987 14.2182 10.4768 14.1999 10.4511 14.1893C10.4253 14.1786 10.3969 14.1761 10.3698 14.1822C10.3426 14.1883 10.3179 14.2025 10.2991 14.2231C9.55083 15.0418 9.09849 16.0877 9.01431 17.1936C8.93014 18.2996 9.21898 19.4018 9.83472 20.3244C9.91191 20.4422 9.95566 20.5331 9.94222 20.5937L9.50191 22.8519C9.49785 22.8733 9.49949 22.8955 9.50666 22.9161C9.51384 22.9368 9.5263 22.9552 9.5428 22.9695C9.55931 22.9838 9.57928 22.9936 9.60073 22.9978C9.62218 23.002 9.64435 23.0005 9.66504 22.9934L11.79 22.2359C11.8545 22.2104 11.9233 22.1979 11.9926 22.1991C12.0619 22.2003 12.1302 22.2151 12.1938 22.2428C12.8297 22.4928 13.5332 22.6465 14.2366 22.6465C15.5906 22.651 16.8949 22.1366 17.8813 21.209C17.9017 21.1892 17.9152 21.1634 17.9199 21.1353C17.9246 21.1073 17.9203 21.0785 17.9076 21.053C17.8948 21.0276 17.8744 21.0069 17.8491 20.9939C17.8238 20.9808 17.795 20.9762 17.7669 20.9806Z'
        };
      case 'ideation':
        return {
          viewBoxSize: 40,
          bgColor: isActive ? '#EFE08A' : '#E4B722',
          path: 'M20 10C16.14 10 13 13.14 13 17C13 19.38 14.19 21.47 16 22.72V26C16 26.55 16.45 27 17 27H23C23.55 27 24 26.55 24 26V22.72C25.81 21.47 27 19.38 27 17C27 13.14 23.86 10 20 10ZM17.5 30C17.5 30.55 17.95 31 18.5 31H21.5C22.05 31 22.5 30.55 22.5 30V29H17.5V30Z'
        };
      case 'vote':
        return {
          viewBoxSize: 16,
          bgColor: isActive ? '#5AB467' : '#98DAA2',
          path: 'M8 0C3.584 0 0 3.584 0 8C0 12.416 3.584 16 8 16C12.416 16 16 12.416 16 8C16 3.584 12.416 0 8 0ZM6.44444 12L12.6667 5.82456L11.5 4.66667L6.44444 9.68421L4.5 7.75439L3.33333 8.91228L6.44444 12Z',
          fillRule: 'evenodd',
          clipRule: 'evenodd'
        };
      case 'follow-up':
        return {
          viewBoxSize: 32,
          bgColor: isActive ? '#DA7AB1' : '#E3A8CC',
          path: 'M17.8933 11.5294L17.6 10H11V23H12.4667V17.6471H16.5733L16.8667 19.1765H22V11.5294H17.8933Z'
        };
    }
  });
}

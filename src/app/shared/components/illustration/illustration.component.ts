import { Component, input } from '@angular/core';

@Component({
  selector: 'cos-illustration',
  standalone: true,
  imports: [],
  template: `
    <div class="illustration-container">
      <img [src]="imagePath()" [alt]="altText()" class="illustration-image">
    </div>
  `,
  styles: [`
    .illustration-container {
      display: flex;
      align-items: center;
      justify-content: center;
      width: 100%;
      height: 100%;
      background-color: var(--color-background);
      overflow: hidden;
      border-top-left-radius: var(--radius-lg);
      border-bottom-left-radius: var(--radius-lg);
    }

    .illustration-image {
      width: 100%;
      height: 100%;
      object-fit: cover;
      max-width: 360px;
    }

    @media (max-width: 768px) {
      .illustration-container {
        display: none;
      }
    }
  `]
})
export class IllustrationComponent {
  imagePath = input.required<string>();
  altText = input<string>('CitizenOS Illustration');
}

import { Component, ChangeDetectionStrategy } from '@angular/core';

@Component({
  changeDetection: ChangeDetectionStrategy.OnPush,
  selector: 'app-not-found',
  standalone: true,
  template: `
    <h2>404 - Page Not Found</h2>
    <p>The page you are looking for does not exist.</p>
  `,
})
export class PageNotFoundComponent {}

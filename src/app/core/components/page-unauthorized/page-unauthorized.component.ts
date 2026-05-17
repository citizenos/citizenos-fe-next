import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-unauthorized',
  standalone: true,
  imports: [RouterLink],
  template: `
    <div class="page_unauthorized">
      <h2>401 - Unauthorized</h2>
      <p>You are not authorized to access this page.</p>
      <a routerLink="/dashboard">Go to Dashboard</a>
    </div>
  `,
})
export class PageUnauthorizedComponent {}

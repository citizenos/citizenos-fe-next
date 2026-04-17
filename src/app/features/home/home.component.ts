import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink],
  template: `
    <h2>Home Page</h2>
    <p>This is the landing page. Choose an option:</p>
    <ul>
      <li><a routerLink="dashboard">Go to Dashboard</a></li>
      <li><a routerLink="/en/topics">Topics (EN)</a></li>
    </ul>
  `
})
export class HomeComponent {}

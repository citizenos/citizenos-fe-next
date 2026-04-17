import { Component, inject } from '@angular/core';
import { UserStore } from '../../state/user.store';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <h2>Dashboard</h2>
    <p>Welcome, {{ userStore.displayName() }}!</p>
    <button (click)="userStore.logout()">Logout</button>
  `
})
export class DashboardComponent {
  userStore = inject(UserStore);
}

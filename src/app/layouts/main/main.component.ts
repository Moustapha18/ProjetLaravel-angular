import { Component, inject } from '@angular/core';
import { RouterLink, RouterOutlet } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { ApiService } from '../../core/services/api.service';

@Component({
  selector: 'app-main',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
  <header class="topbar">
    <a routerLink="/">Bakery</a>
    <nav>
      <a routerLink="/catalog">Catalogue</a>
      <a routerLink="/orders/mine" *ngIf="auth.isAuth()">Mes commandes</a>
      <a routerLink="/admin/products" *ngIf="auth.user()?.role === 'ADMIN'">Admin</a>
      <a routerLink="/auth/login" *ngIf="!auth.isAuth()">Login</a>
      <button *ngIf="auth.isAuth()" (click)="logout()">Logout</button>
    </nav>
  </header>
  <main><router-outlet/></main>
  `,
})
export class MainComponent {
  auth = inject(AuthService);
  api = inject(ApiService);

  logout() {
    this.api.logout().subscribe({
      next: () => this.auth.logoutLocal(),
      error: () => this.auth.logoutLocal(),
    });
  }
}

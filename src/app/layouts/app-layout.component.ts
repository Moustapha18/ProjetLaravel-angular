// src/app/layouts/app-layout.component.ts
import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from '../core/services/auth.service';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';

@Component({
  standalone: true,
  selector: 'app-app-layout',
  imports: [RouterLink, RouterOutlet, CommonModule, FormsModule, ReactiveFormsModule],
  template: `
    <header class="px-4 py-3 border-b flex items-center justify-between">
      <a routerLink="/products" class="font-semibold">🥖 Boulangerie</a>

      <nav class="flex items-center gap-3">
        <a routerLink="/products">Produits</a>
        <a routerLink="/orders">{{ auth.isStaff() ? 'Commandes' : 'Mes commandes' }}</a>

        <!-- Liens staff uniquement -->
        <ng-container *ngIf="auth.isStaff()">
          <a routerLink="/admin/products">Produits (admin)</a>
          <!-- tu peux ajouter d’autres liens admin ici -->
        </ng-container>

        <button class="text-red-600" (click)="logout()">Déconnexion</button>
      </nav>
    </header>

    <main class="p-4">
      <router-outlet></router-outlet>
    </main>
  `
})
export class AppLayoutComponent {
  auth = inject(AuthService);
  private router = inject(Router);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
  }
}

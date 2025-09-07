// src/app/admin/components/admin-shell.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  standalone: true,
  selector: 'app-admin-shell',
  imports: [CommonModule, RouterLink, RouterOutlet],
  template: `
    <header class="mb-4 border-b pb-2 flex items-center justify-between">
      <h1 class="text-2xl font-semibold">Admin</h1>
      <nav class="flex gap-4 text-sm">
        <a routerLink="stats" class="hover:underline">Stats</a>
        <a routerLink="categories" class="hover:underline">Catégories</a>
        <a routerLink="promotions" class="hover:underline">Promotions</a>
        <a routerLink="exports" class="hover:underline">Exports</a>
        <a routerLink="logs" class="hover:underline">Logs</a>
        <a routerLink="users" class="hover:underline">Utilisateurs</a>
        <a routerLink="orders/board" class="hover:underline">Board commandes</a>

        <!-- <a routerLink="trash" class="hover:underline">Corbeille</a> -->
      </nav>
    </header>
    <router-outlet></router-outlet>
  `,
})
export class AdminShellComponent {}

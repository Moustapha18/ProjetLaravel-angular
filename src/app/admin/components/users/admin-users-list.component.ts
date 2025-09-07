import { Component, inject, signal } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminUsersService } from '../../services/admin-users.service';
import { FormsModule } from '@angular/forms';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-user-list',
  imports: [CommonModule, RouterLink, FormsModule, DatePipe],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Utilisateurs</h2>
      <a routerLink="/admin/users/new" class="px-3 py-2 border rounded">+ Ajouter</a>
    </div>

    <div class="flex gap-2 mb-3">
      <input class="border rounded p-2" [(ngModel)]="q" placeholder="Rechercher…" (keyup.enter)="applyFilter()"/>
      <select class="border rounded p-2" [(ngModel)]="role" (change)="applyFilter()">
        <option value="">Tous rôles</option>
        <option value="EMPLOYE">Employé</option>
        <option value="ADMIN">Admin</option>
      </select>
      <button class="px-3 py-2 border rounded" (click)="applyFilter()">Filtrer</button>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun utilisateur.</div>

    <table class="w-full text-sm border" *ngIf="!loading() && items().length">
      <thead class="bg-gray-50">
        <tr>
          <th class="p-2 text-left">#</th>
          <th class="p-2 text-left">Nom</th>
          <th class="p-2 text-left">Email</th>
          <th class="p-2 text-left">Rôle</th>
          <th class="p-2 text-left">Créé le</th>
          <th class="p-2 text-right">Actions</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of items()" class="border-t">
          <td class="p-2">{{ u.id }}</td>
          <td class="p-2">{{ u.name }}</td>
          <td class="p-2">{{ u.email }}</td>
          <td class="p-2">{{ u.role }}</td>
          <td class="p-2">{{ u.created_at | date:'short' }}</td>
          <td class="p-2 text-right">
            <button class="text-red-600" (click)="confirmDelete(u.id)">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} utilisateurs</span>
      <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class AdminUserListComponent {
  private api = inject(AdminUsersService);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<{ current_page:number; last_page:number; total:number }|null>(null);

  page = 1;
  q = '';
  role = '';

  ngOnInit(){ this.load(); }

  load() {
    this.loading.set(true);
    this.api.list({ page: this.page, per_page: 12, q: this.q || undefined, role: this.role || undefined })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => { this.items.set(res?.data ?? []); this.meta.set(res?.meta ?? null); },
        error: () => { this.items.set([]); this.meta.set(null); }
      });
  }

  applyFilter(){ this.page = 1; this.load(); }
  next(){ const m = this.meta(); if (m && m.current_page < m.last_page){ this.page++; this.load(); } }
  prev(){ const m = this.meta(); if (m && m.current_page > 1){ this.page--; this.load(); } }

  confirmDelete(id: number) {
    if (!confirm('Supprimer cet utilisateur ?')) return;
    this.api.destroy(id).subscribe({ next: () => this.load() });
  }
}

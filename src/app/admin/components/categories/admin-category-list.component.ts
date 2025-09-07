import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminCategoriesService } from '../../services/admin-categories.service';
import { finalize } from 'rxjs/operators';

@Component({
  standalone: true,
  selector: 'app-admin-category-list',
  imports: [CommonModule, RouterLink],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Catégories (Admin)</h2>
      <a routerLink="/admin/categories/new" class="px-3 py-2 border rounded">+ Ajouter</a>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucune catégorie.</div>

    <div class="overflow-x-auto" *ngIf="!loading() && items().length">
      <table class="w-full text-sm border">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left">#</th>
            <th class="p-2 text-left">Nom</th>
            <th class="p-2 text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr *ngFor="let c of items()" class="border-t">
            <td class="p-2">{{ c.id }}</td>
            <td class="p-2">{{ c.name }}</td>
            <td class="p-2 text-right">
              <div class="flex gap-2 justify-end">
                <a [routerLink]="['/admin/categories', c.id]" class="text-blue-700">Éditer</a>
                <button class="text-red-600" (click)="confirmDelete(c.id)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminCategoryListComponent {
  private api = inject(AdminCategoriesService);
  loading = signal(false);
  items   = signal<any[]>([]);

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.api.list({ page: 1, per_page: 50 })
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.items.set(res?.data ?? []),
        error: () => this.items.set([])
      });
  }

  confirmDelete(id: number) {
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.api.destroy(id).subscribe({
      next: () => this.load(),
      error: (e) => console.error(e)
    });
  }
}

// src/app/admin/components/categories/category-list.component.ts
import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminCategoriesService } from '../../services/admin-categories.service';

type Meta = { current_page: number; last_page: number; total: number };

@Component({
  standalone: true,
  selector: 'app-category-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Catégories</h2>
      <a routerLink="/admin/categories/new" class="px-3 py-2 border rounded">Nouvelle catégorie</a>
    </div>

    <div class="flex items-center gap-2 mb-3">
      <input class="border p-2 rounded w-full" [(ngModel)]="q" (keyup.enter)="applySearch()" placeholder="Rechercher..." />
      <button class="px-3 py-2 border rounded" (click)="applySearch()">Rechercher</button>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucune catégorie.</div>

    <table class="w-full text-sm border" *ngIf="!loading() && items().length">
      <thead class="bg-gray-50">
        <tr><th class="p-2 text-left">Nom</th><th class="p-2 w-32"></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let c of items()" class="border-t">
          <td class="p-2">{{ c.name }}</td>
          <td class="p-2 text-right">
            <a [routerLink]="['/admin/categories', c.id]" class="text-blue-700 mr-2">Éditer</a>
            <button (click)="remove(c.id)" class="text-red-600">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} catégories</span>
      <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class CategoryListComponent implements OnInit {
  private api   = inject(AdminCategoriesService);
  private route = inject(ActivatedRoute);
  private router= inject(Router);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta | null>(null);

  q = '';
  page = 1;

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.q    = p.get('q') ?? '';
      this.page = +(p.get('page') ?? 1);
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.api.list({ q: this.q || undefined, page: this.page, per_page: 12 })
      .subscribe(res => {
        this.items.set(res?.data ?? []);
        this.meta.set(res?.meta ?? null);
        this.loading.set(false);
      });
  }

  applySearch() {
    this.router.navigate([], { queryParams: { q: this.q || null, page: 1 }, queryParamsHandling: 'merge' });
  }

  next(){ const m = this.meta(); if (m && m.current_page < m.last_page) this.router.navigate([], { queryParams: { page: m.current_page + 1 }, queryParamsHandling: 'merge' }); }
  prev(){ const m = this.meta(); if (m && m.current_page > 1) this.router.navigate([], { queryParams: { page: m.current_page - 1 }, queryParamsHandling: 'merge' }); }

  remove(id: number){
    if (!confirm('Supprimer cette catégorie ?')) return;
    this.api.destroy(id).subscribe(() => this.load());
  }
}


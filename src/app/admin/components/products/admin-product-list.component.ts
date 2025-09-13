// src/app/admin/components/products/admin-product-list.component.ts
import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { finalize } from 'rxjs/operators';

import { ProductsService } from '../../../core/services/products.service';
import { AdminProductsService } from '../../services/admin-products.service';
import { environment } from '../../../../environments/environment';

@Component({
  standalone: true,
  styleUrls: ['./admin-product-list.component.scss'],
  selector: 'app-admin-product-list',
  imports: [CommonModule, RouterLink],
   styles: [`
    .thumb {
      width: 64px;
      height: 64px;
      object-fit: cover;
      border-radius: 6px;
      border: 1px solid #e5e7eb; /* gris clair */
      display: block;
    }
    .img-cell { width: 72px; } /* pour que la colonne reste étroite */
  `],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Produits (Admin)</h2>
      <a routerLink="/admin/products/new" class="px-3 py-2 border rounded">+ Ajouter</a>
    </div>

    <div *ngIf="loading()" class="text-gray-500">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun produit.</div>

    <div class="overflow-x-auto" *ngIf="!loading() && items().length">
      <table class="min-w-[900px] w-full text-sm border">
        <thead class="bg-gray-50">
          <tr>
            <th class="p-2 text-left w-16">Image</th>
            <th class="p-2 text-left">Nom</th>
            <th class="p-2 text-left">Prix</th>
            <th class="p-2 text-left">Catégorie</th>
            <th class="p-2 text-left">Description</th>
            <th class="p-2 text-left">Stock</th>
            <th class="p-2 text-left">Remise %</th>
            <th class="p-2 text-right w-36">Actions</th>
          </tr>
        </thead>
        <tbody>
         <tr *ngFor="let p of items()" class="border-t align-top">
        <td class="p-2 img-cell">
          <a *ngIf="imageUrl(p) as url" [href]="url" target="_blank" rel="noopener">
            <img [src]="url" [alt]="p.name" class="thumb" />
          </a>
          <span *ngIf="!imageUrl(p)" class="text-gray-400">—</span>
        </td>

            <td class="p-2 font-medium">{{ p.name }}</td>
            <td class="p-2">{{ (p.price_cents||0)/100 | currency:'XOF':'symbol-narrow' }}</td>
            <td class="p-2">{{ p.category?.name || '—' }}</td>
            <td class="p-2 max-w-[340px]">
              <span class="break-words whitespace-pre-line">{{ p.description || '—' }}</span>
            </td>
            <td class="p-2">{{ p.stock ?? '—' }}</td>
            <td class="p-2">{{ p.percent_off ?? p?.promotion?.percent_off ?? '—' }}</td>
            <td class="p-2 text-right">
              <div class="flex gap-2 justify-end">
                <a [routerLink]="['/admin/products', p.id]" class="text-blue-700">Éditer</a>
                <button class="text-red-600" (click)="confirmDelete(p.id)">Supprimer</button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  `
})
export class AdminProductListComponent {
  private catalog = inject(ProductsService);        // GET /api/v1/products
  private admin   = inject(AdminProductsService);   // DELETE /api/v1/admin/products/:id

  loading = signal(false);
  items   = signal<any[]>([]);

  // reconstruit l’URL des images à partir de image_url ou image_path
  imageUrl = (p: any): string | null => {
    if (p?.image_url) return p.image_url; // si ton API le renvoie déjà
    if (!p?.image_path) return null;

    // environment.apiUrl = 'http://127.0.0.1:8000/api/v1'
    const apiBase = environment.apiUrl.replace(/\/api\/v1\/?$/, '');
    return `${apiBase}/storage/${p.image_path}`;
  };

  ngOnInit() { this.load(); }

  load() {
    this.loading.set(true);
    this.catalog
      .list({ per_page: 100 }) // le backend renvoie data:[], avec category inclus si tu as with('category')
      .pipe(finalize(() => this.loading.set(false)))
      .subscribe({
        next: (res) => this.items.set(res?.data ?? []),
        error: (e) => { console.error('Products load error', e); this.items.set([]); }
      });
  }

  confirmDelete(id: number) {
    if (!confirm('Supprimer ce produit ?')) return;
    this.admin.destroy(id).subscribe({
      next: () => this.load(),
      error: (e) => console.error('Product delete error', e)
    });
  }
}

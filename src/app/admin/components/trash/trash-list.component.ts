import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TrashService } from '../../services/trash.service';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-trash-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Corbeille</h2>
      <div class="flex items-center gap-2">
        <select class="border rounded p-2" [(ngModel)]="type" (change)="applyFilter()">
          <option value="">Tous types</option>
          <option value="product">Produits</option>
          <option value="category">Catégories</option>
          <option value="order">Commandes</option>
          <!-- ajoute d'autres types si ton backend les gère -->
        </select>
        <input class="border rounded p-2" [(ngModel)]="q" (keyup.enter)="applyFilter()" placeholder="Rechercher..."/>
        <button class="px-3 py-2 border rounded" (click)="applyFilter()">Filtrer</button>
      </div>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun élément supprimé.</div>

    <table class="w-full text-sm border" *ngIf="!loading() && items().length">
      <thead class="bg-gray-50">
        <tr>
          <th class="p-2 text-left">Type</th>
          <th class="p-2 text-left">Nom / Réf</th>
          <th class="p-2 text-left">Supprimé le</th>
          <th class="p-2 w-40"></th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let it of items()" class="border-t">
          <td class="p-2">{{ it.type || type || '—' }}</td>
          <td class="p-2">
            {{ it.name || it.title || ('#'+(it.id ?? '')) }}
          </td>
          <td class="p-2">{{ it.deleted_at || '—' }}</td>
          <td class="p-2 text-right">
            <button class="px-2 py-1 border rounded mr-2" (click)="restore(it)">Restaurer</button>
            <button class="px-2 py-1 border rounded text-red-600" (click)="forceDelete(it)">Supprimer déf.</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} éléments</span>
      <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class TrashListComponent implements OnInit {
  private svc = inject(TrashService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta | null>(null);

  type = '';
  q = '';
  page = 1;

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.type = p.get('type') ?? '';
      this.q    = p.get('q') ?? '';
      this.page = +(p.get('page') ?? 1);
      this.load();
    });
  }

  load() {
    this.loading.set(true);
    this.svc.list({ type: this.type || undefined, page: this.page, per_page: 12, search: this.q || undefined })
      .subscribe(res => {
        this.items.set(res?.data ?? []);
        this.meta.set(res?.meta ?? null);
        this.loading.set(false);
      });
  }

  applyFilter() {
    this.router.navigate([], { queryParams: { type: this.type || null, q: this.q || null, page: 1 }, queryParamsHandling: 'merge' });
  }

  next(){ const m=this.meta(); if(m && m.current_page<m.last_page){ this.router.navigate([], { queryParams: { page: m.current_page+1 }, queryParamsHandling: 'merge' }); } }
  prev(){ const m=this.meta(); if(m && m.current_page>1){ this.router.navigate([], { queryParams: { page: m.current_page-1 }, queryParamsHandling: 'merge' }); } }

  restore(it:any){
    const t = it.type || this.type || 'product';
    if (!confirm(`Restaurer cet élément (${t} #${it.id}) ?`)) return;
    this.svc.restore(t, it.id).subscribe(() => this.load());
  }

  forceDelete(it:any){
    const t = it.type || this.type || 'product';
    if (!confirm(`Supprimer DÉFINITIVEMENT (${t} #${it.id}) ?`)) return;
    this.svc.forceDelete(t, it.id).subscribe(() => this.load());
  }
}

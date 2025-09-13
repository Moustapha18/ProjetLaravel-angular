import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule, DatePipe, CurrencyPipe } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PromotionsService } from '../../../admin/services/promotions.service';
import { Promotion } from '../../../admin/models/promotion.model';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-promotions-list',
  imports: [CommonModule, RouterLink, FormsModule, DatePipe, CurrencyPipe],
  template: `
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold">Promotions</h2>
    <a class="px-3 py-1 bg-black text-white rounded" [routerLink]="['/admin/promotions/new']">Nouvelle promotion</a>
  </div>

  <div class="flex gap-2 items-center mb-3">
    <select class="border rounded p-2" [(ngModel)]="appliesTo" (change)="reload()">
      <option value="">Tous</option>
      <option value="ORDER">Commande</option>
      <option value="PRODUCT">Produit</option>
    </select>
  </div>

  <div *ngIf="loading()">Chargement…</div>

  <table class="w-full text-sm border" *ngIf="!loading() && items().length">
    <thead class="bg-gray-50">
      <tr>
        <th class="p-2 text-left">Nom</th>
        <th class="p-2">Code</th>
        <th class="p-2">Cible</th>
        <th class="p-2">Type</th>
        <th class="p-2 text-right">Valeur</th>
        <th class="p-2 text-center">Actif</th>
        <th class="p-2">Période</th>
        <th class="p-2 w-40"></th>
      </tr>
    </thead>
    <tbody>
      <tr class="border-t" *ngFor="let p of items()">
        <td class="p-2">{{ p.name }}</td>
        <td class="p-2 font-mono">{{ p.code || '—' }}</td>
        <td class="p-2 text-center">{{ p.applies_to }}</td>
        <td class="p-2 text-center">{{ p.type }}</td>
        <td class="p-2 text-right">
          <ng-container [ngSwitch]="p.type">
            <span *ngSwitchCase="'PERCENT'">{{ p.value }} %</span>
            <span *ngSwitchCase="'FIXED'">{{ (p.value||0)/100 | currency:'XOF' }}</span>
          </ng-container>
        </td>
        <td class="p-2 text-center">
          <span [class]="p.active ? 'badge-paid' : 'badge-unpaid'">{{ p.active ? 'Oui' : 'Non' }}</span>
        </td>
        <td class="p-2">
          <div *ngIf="p.start_at || p.end_at">
            <span *ngIf="p.start_at">{{ p.start_at | date:'shortDate' }}</span>
            <span>→</span>
            <span *ngIf="p.end_at">{{ p.end_at | date:'shortDate' }}</span>
          </div>
          <div *ngIf="!p.start_at && !p.end_at" class="text-gray-500">—</div>
        </td>
        <td class="p-2 text-right">
          <a class="kbd mr-2" [routerLink]="['/admin/promotions', p.id, 'edit']">Éditer</a>
          <button class="kbd" (click)="confirmDelete(p)">Supprimer</button>
        </td>
      </tr>
    </tbody>
  </table>

  <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
    <button (click)="go(m.current_page - 1)" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
    <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} promos</span>
    <button (click)="go(m.current_page + 1)" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
  </div>
  `
})
export class PromotionsListComponent implements OnInit {
  private srv = inject(PromotionsService);
  private router = inject(Router);

  loading = signal(false);
  items = signal<Promotion[]>([]);
  meta = signal<Meta|null>(null);
  page = 1;
  appliesTo = '';

  ngOnInit(){ this.reload(); }

  reload(){
    this.loading.set(true);
    this.srv.list({ page: this.page, per_page: 12, applies_to: this.appliesTo || undefined})
      .subscribe({
        next: (res:any) => { this.items.set(res.data || res.items || []); this.meta.set(res.meta || null); },
        error: () => {},
        complete: () => this.loading.set(false)
      });
  }

  go(p:number){ this.page = p; this.reload(); }

  confirmDelete(p: Promotion){
    if (!p.id) return;
    if (!confirm(`Supprimer la promotion « ${p.name} » ?`)) return;
    this.srv.remove(p.id).subscribe(() => this.reload());
  }
}

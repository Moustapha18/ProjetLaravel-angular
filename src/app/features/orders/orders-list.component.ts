import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

import { OrdersService } from '../../core/services/orders.service';
import { AuthService } from '../../core/services/auth.service';
import { OrderStatusPipe } from '../../admin/components/shared/order-status.pipe';
import { environment } from '../../../environments/environment.development';

type Meta = { current_page: number; last_page: number; total: number };

@Component({
  standalone: true,
  selector: 'app-orders-list',
  imports: [CommonModule, RouterLink, FormsModule, OrderStatusPipe],
  template: `
    <h2 class="text-xl font-semibold mb-3">
      {{ isClient() ? 'Mes commandes' : 'Toutes les commandes' }}
    </h2>

    <!-- Filtre statut -->
    <div class="flex items-center gap-2 mb-3">
      <select class="border rounded p-2" [(ngModel)]="status" (change)="applyFilter()">
        <option value="">Tous les statuts</option>
        <option value="EN_PREPARATION">En préparation</option>
        <option value="PRETE">Prête</option>
        <option value="EN_LIVRAISON">En livraison</option>
        <option value="LIVREE">Livrée</option>
        <option value="ANNULEE">Annulée</option>
      </select>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length === 0" class="text-gray-500">
      Aucune commande.
      <a *ngIf="isClient()" routerLink="/products" class="text-blue-700">Découvrir nos produits →</a>
    </div>

    <table class="table" *ngIf="!loading() && items().length">
      <thead>
        <tr>
          <th>#</th>
          <th>Date</th>
          <th *ngIf="!isClient()">Client</th>
          <th>Statut</th>
          <th>Paiement</th>
          <th>Total</th>
          <th></th>
        </tr>
      </thead>

      <tbody>
        <tr *ngFor="let o of items()">
          <td>{{ o.id }}</td>
          <td>{{ o.created_at | date:'short' }}</td>

          <td *ngIf="!isClient()">
            {{ o.user?.name || '—' }}<br>
            <span class="text-xs text-gray-500">{{ o.user?.email }}</span>
          </td>

          <td>
            <span [class]="(o.status | orderStatus).cls">
              {{ (o.status | orderStatus).label }}
            </span>
          </td>

          <td>
            <span [class]="o.paid ? 'badge-paid' : 'badge-unpaid'">
              {{ o.paid ? 'Payée' : 'À payer' }}
            </span>
          </td>

          <td>{{ (o.total_cents || 0) / 100 | currency:'XOF' }}</td>

          <td class="actions-row">
            <a [routerLink]="['/orders', o.id]" class="kbd">Voir</a>
            <button
              *ngIf="!o.paid && !isClient()"
              class="kbd"
              (click)="markPaid(o.id)">
              Marquer payée
            </button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page <= 1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} commandes</span>
      <button (click)="next()" [disabled]="m.current_page >= m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class OrdersListComponent implements OnInit {
  private ordersSrv = inject(OrdersService);
  private auth      = inject(AuthService);
  private route     = inject(ActivatedRoute);
  private router    = inject(Router);
  private http      = inject(HttpClient);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta | null>(null);

  page = 1;
  status = '';

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.page   = +(p.get('page') ?? 1);
      this.status = (p.get('status') ?? '').trim();
      if (this.status === 'undefined') this.status = '';
      this.load();
    });
  }

  // ⚠️ doit être public pour le template
  isClient(): boolean {
    const role = (this.auth as any).role;
    const r = typeof role === 'function' ? role() : role;
    return String(r || '').toUpperCase() === 'CLIENT';
  }

  load() {
    this.loading.set(true);

    const params: any = { page: this.page, per_page: 12 };
    if (this.status) params.status = this.status;

    const obs =
      this.isClient()
        ? this.ordersSrv.mine(params)
        : (this.ordersSrv as any).listAll?.(params) ?? this.ordersSrv.mine(params);

    obs.subscribe({
      next: (res: any) => {
        this.items.set(res?.data ?? []);
        this.meta.set(res?.meta ?? null);
      },
      error: () => {},
      complete: () => this.loading.set(false)
    });
  }

  applyFilter() {
    this.router.navigate([], {
      queryParams: { status: this.status || null, page: 1 },
      queryParamsHandling: 'merge'
    });
  }

  markPaid(id: number) {
    const url = `${environment.apiUrl}/orders/${id}/mark-paid`;
    this.http.post(url, {}).subscribe(() => this.load());
  }

  next() {
    const m = this.meta();
    if (m && m.current_page < m.last_page) {
      this.router.navigate([], { queryParams: { page: m.current_page + 1 }, queryParamsHandling: 'merge' });
    }
  }

  prev() {
    const m = this.meta();
    if (m && m.current_page > 1) {
      this.router.navigate([], { queryParams: { page: m.current_page - 1 }, queryParamsHandling: 'merge' });
    }
  }
  pay(id:number){
  this.ordersSrv.pay(id).subscribe(() => this.load());
}
}

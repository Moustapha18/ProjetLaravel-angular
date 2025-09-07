import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AdminOrdersService, OrderStatus } from '../../services/admin-orders.service';

const STATUSES: OrderStatus[] = ['PENDING','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELED'];

@Component({
  standalone: true,
  selector: 'app-orders-board',
  imports: [CommonModule, RouterLink],
  template: `
    <h2 class="text-xl font-semibold mb-3">Commandes — Board</h2>
    <div class="grid md:grid-cols-6 gap-3 overflow-auto">
      <div class="border rounded p-2" *ngFor="let s of statuses">
        <div class="font-medium mb-2">{{ s }}</div>
        <div class="grid gap-2">
          <div class="border rounded p-2 bg-white" *ngFor="let o of byStatus(s)">
            <div class="text-sm font-semibold">#{{ o.id }}</div>
            <div class="text-xs text-gray-600">{{ o.customer_name || o.user?.name || '—' }}</div>
            <div class="text-xs">{{ (o.total_cents||0)/100 | currency:'XOF' }}</div>
            <div class="flex gap-1 mt-2">
              <button class="px-2 py-1 border rounded text-xs" (click)="move(o, nextStatus(s))" [disabled]="!nextStatus(s)">→</button>
              <a [routerLink]="['/admin/orders', o.id]" class="px-2 py-1 border rounded text-xs">Détails</a>
            </div>
          </div>
        </div>
      </div>
    </div>
  `
})
export class OrdersBoardComponent implements OnInit {
  private svc = inject(AdminOrdersService);
  loading = signal(false);
  orders  = signal<any[]>([]);
  statuses = STATUSES;

  ngOnInit(){ this.reloadAll(); }

  reloadAll(){
    this.loading.set(true);
    // charge toutes les colonnes (simple: plusieurs requêtes)
    Promise.all(this.statuses.map(s => this.svc.list({ status: s, per_page: 50 }).toPromise()))
      .then(res => {
        const merged = res.flatMap(r => (r?.data||[]));
        this.orders.set(merged);
        this.loading.set(false);
      }).catch(()=> this.loading.set(false));
  }

  byStatus(s: OrderStatus){ return (this.orders()||[]).filter(o => o.status===s); }

  nextStatus(s: OrderStatus): OrderStatus | null {
    const flow: OrderStatus[] = ['PENDING','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED'];
    const i = flow.indexOf(s);
    if (i === -1) return null;
    if (i === flow.length-1) return null;
    return flow[i+1];
  }

  move(order:any, to: OrderStatus | null){
    if (!to) return;
    this.svc.updateStatus(order.id, to).subscribe(()=>{
      order.status = to;
    });
  }
}

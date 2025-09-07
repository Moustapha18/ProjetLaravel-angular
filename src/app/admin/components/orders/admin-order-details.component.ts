import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AdminOrdersService, OrderStatus } from '../../services/admin-orders.service';
import { UsersService, User } from '../../services/users.service';

@Component({
  standalone: true,
  selector: 'app-admin-order-details',
  imports: [CommonModule, FormsModule],
  template: `
    <h2 class="text-xl font-semibold mb-3">Commande #{{ order()?.id }}</h2>

    <div *ngIf="!order()">Chargement…</div>
    <div *ngIf="order() as o" class="grid md:grid-cols-2 gap-4">
      <div class="border rounded p-3">
        <div class="text-sm text-gray-500">Client</div>
        <div>{{ o.customer_name || o.user?.name }} — {{ o.user?.email }}</div>
        <div class="mt-2 text-sm text-gray-500">Adresse</div>
        <div>{{ o.address }}</div>
        <div class="mt-2 text-sm text-gray-500">Total</div>
        <div>{{ (o.total_cents||0)/100 | currency:'XOF' }}</div>
      </div>

      <div class="border rounded p-3 grid gap-2">
        <div class="text-sm text-gray-500">Statut</div>
        <select class="border rounded p-2" [(ngModel)]="statusTmp">
          <option *ngFor="let s of statuses" [ngValue]="s">{{ s }}</option>
        </select>
        <button class="px-3 py-2 border rounded w-max" (click)="applyStatus()">Mettre à jour</button>

        <div class="text-sm text-gray-500 mt-3">Assigné à</div>
        <select class="border rounded p-2" [(ngModel)]="assigneeId">
          <option [ngValue]="null">—</option>
          <option *ngFor="let e of employees()" [ngValue]="e.id">{{ e.name }} ({{ e.email }})</option>
        </select>
        <button class="px-3 py-2 border rounded w-max" (click)="applyAssignee()">Assigner</button>
      </div>

      <div class="md:col-span-2 border rounded p-3">
        <div class="font-medium mb-2">Articles</div>
        <table class="w-full text-sm border">
          <thead class="bg-gray-50"><tr><th class="p-2 text-left">Produit</th><th class="p-2 text-center">Qté</th><th class="p-2 text-right">Prix</th></tr></thead>
          <tbody>
            <tr *ngFor="let it of o.items" class="border-t">
              <td class="p-2">{{ it.name }}</td>
              <td class="p-2 text-center">{{ it.qty || it.quantity }}</td>
              <td class="p-2 text-right">{{ ((it.price_cents||0)/100) | currency:'XOF' }}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div class="md:col-span-2 border rounded p-3">
        <div class="font-medium mb-2">Notes internes</div>
        <ul class="text-sm grid gap-1 mb-2">
          <li *ngFor="let n of (order()?.notes||[])" class="text-gray-700">• {{ n.note }} <span class="text-xs text-gray-400">— {{ n.created_at | date:'short' }} ({{ n.author?.name || '—' }})</span></li>
        </ul>
        <div class="flex gap-2">
          <input class="border rounded p-2 w-full" [(ngModel)]="note" placeholder="Ajouter une note…" />
          <button class="px-3 py-2 border rounded" (click)="addNote()">Ajouter</button>
        </div>
      </div>
    </div>
  `
})
export class AdminOrderDetailsComponent implements OnInit {
  private svc  = inject(AdminOrdersService);
  private users= inject(UsersService);
  private route= inject(ActivatedRoute);

  order   = signal<any|null>(null);
  statuses: OrderStatus[] = ['PENDING','PREPARING','READY','OUT_FOR_DELIVERY','DELIVERED','CANCELED'];
  statusTmp: OrderStatus = 'PENDING';

  employees = signal<User[]>([]);
  assigneeId: number | null = null;

  note = '';

  ngOnInit(){
    const id = this.route.snapshot.paramMap.get('id')!;
    this.svc.find(id).subscribe(o => {
      this.order.set(o);
      this.statusTmp = o.status;
      this.assigneeId = o.assignee_id ?? null;
    });
    // liste employés
    this.users.list({ role: 'EMPLOYE', per_page: 100 }).subscribe(res => this.employees.set(res.data||[]));
  }

  applyStatus(){
    const o = this.order(); if(!o) return;
    this.svc.updateStatus(o.id, this.statusTmp).subscribe(res => this.order.set({ ...o, status: this.statusTmp }));
  }
  applyAssignee(){
    const o = this.order(); if(!o) return;
    this.svc.assign(o.id, this.assigneeId).subscribe(()=>{ this.order.set({ ...o, assignee_id: this.assigneeId }); });
  }
  addNote(){
    const text = this.note.trim(); if(!text) return;
    const o = this.order(); if(!o) return;
    this.svc.addNote(o.id, text).subscribe(n => {
      const notes = [...(o.notes||[]), n];
      this.order.set({ ...o, notes });
      this.note = '';
    });
  }
}

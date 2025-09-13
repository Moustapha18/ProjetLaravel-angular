import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { OrdersService } from '../../core/services/orders.service';
import { Order, OrderStatus } from '../../core/models/order.models';
import { AuthService } from '../../core/services/auth.service';
import { environment } from '../../../environments/environment.development';

@Component({
  standalone: true,
  selector: 'app-order-details',
  imports: [CommonModule, FormsModule],
  template: `
<ng-container *ngIf="order as o; else loading">
  <div class="flex items-center justify-between mb-3">
    <h2 class="text-xl font-semibold">Commande #{{ o.id }}</h2>
    <div class="flex gap-2">
      <button class="px-3 py-1 border rounded"
        (click)="downloadInvoice(o.id)"
        [disabled]="!o?.id">
  Facture PDF
</button>
<button class="px-3 py-1 border rounded" (click)="emailInvoice(o.id)">
  Envoyer la facture par email
</button>



      <!-- Staff: MAJ statut -->
      <ng-container *ngIf="isStaff()">
        <select class="border p-1 rounded" [(ngModel)]="nextStatus">
          <option *ngFor="let s of statuses" [value]="s">{{ s }}</option>
        </select>
        <button class="px-3 py-1 bg-black text-white rounded" (click)="updateStatus(o.id)">Mettre à jour</button>
      </ng-container>

      <!-- Client: Payer maintenant si impayée -->
      <button *ngIf="!o.paid && !isStaff()" class="px-3 py-1 border rounded" (click)="payNow(o.id)">Payer maintenant</button>

      <!-- Staff: Marquer payée -->
      <button *ngIf="!o.paid && isStaff()" class="px-3 py-1 border rounded" (click)="markPaid(o.id)">Marquer payée</button>
    </div>
  </div>
  <!-- Client: Payer maintenant si impayée -->
<button *ngIf="!o.paid && !isStaff()" class="px-3 py-1 border rounded" (click)="payNow(o.id)">
  Payer maintenant
</button>


  <div class="mb-2 text-sm text-gray-600">
    Statut actuel : <b>{{ o.status }}</b> —
    Paiement : <b>{{ o.paid ? 'Payée' : 'À payer' }}</b>
  </div>

  <table class="w-full text-sm border">
    <thead class="bg-gray-50">
      <tr>
        <th class="p-2 text-left">Produit</th>
        <th class="p-2 text-right">Qté</th>
        <th class="p-2 text-right">PU</th>
        <th class="p-2 text-right">Sous-total</th>
      </tr>
    </thead>
    <tbody>
      <tr *ngFor="let it of o.items" class="border-t">
        <td class="p-2 text-left">{{ it.product?.name || ('#'+it.product_id) }}</td>
        <td class="p-2 text-right">{{ it.qty }}</td>
        <td class="p-2 text-right">{{ (it.unit_price_cents||0)/100 | currency:'XOF' }}</td>
        <td class="p-2 text-right">{{ ((it.unit_price_cents||0)*it.qty)/100 | currency:'XOF' }}</td>
      </tr>
    </tbody>
    <tfoot>
      <tr class="border-t">
        <td colspan="3" class="p-2 text-right font-medium">Total</td>
        <td class="p-2 text-right font-medium">{{ (o.total_cents||0)/100 | currency:'XOF' }}</td>
      </tr>
    </tfoot>
  </table>
</ng-container>

<ng-template #loading><p>Chargement…</p></ng-template>
`
})
export class OrderDetailsComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private ordersSrv = inject(OrdersService);
  private auth = inject(AuthService);

  order?: Order;
  statuses: OrderStatus[] = ['EN_PREPARATION','PRETE','EN_LIVRAISON','LIVREE'];
  nextStatus: OrderStatus = 'PRETE';

  ngOnInit() { this.reload(); }
  payNow(id: number) { this.ordersSrv.pay(id).subscribe(() => this.reload()); }


  isStaff(): boolean {
  const r = typeof this.auth.role === 'function' ? this.auth.role : this.auth.role;
  const role = String(r || '').toLowerCase();
  // couvre admin / employe / employee / staff
  return role === 'admin' || role === 'employe' || role === 'employee' || role === 'staff';
}


  private idFromRoute(): number | null {
    const idStr = this.route.snapshot.paramMap.get('id');
    const id = idStr ? +idStr : NaN;
    return Number.isFinite(id) ? id : null;
  }

  reload() {
  const id = this.idFromRoute();
  if (!id) return;

  this.ordersSrv.get(id).subscribe((o: any) => {
    this.order = o; // o est déjà déballé par le service
  });
}


  updateStatus(id: number) {
  if (!id) return; // garde-fou
  this.ordersSrv.updateStatus(id, this.nextStatus).subscribe(() => this.reload());
}


  downloadInvoice(id?: number) {
  const safeId = id ?? this.order?.id;
  if (!safeId) return; // évite un appel /undefined/invoice

  this.ordersSrv.downloadInvoice(safeId).subscribe((blob: Blob) => {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Facture-${safeId}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  });
}
emailInvoice(id: number) {
  const url = `${environment.apiUrl}/orders/${id}/send-invoice`;
  this.ordersSrv['http'].post(url, {}).subscribe(() => alert('Facture envoyée !'));
}



  // payNow(id: number) {
  //   this.ordersSrv.pay(id).subscribe(() => this.reload());
  // }

  markPaid(id: number) {
    this.ordersSrv.markPaid(id).subscribe(() => this.reload());
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CartService } from '../../../core/services/cart.service';
import { OrdersService } from '../../../core/services/orders.service';

type OrderItem = { product_id: number; qty: number };
type CreateOrderPayload = { address?: string; items: OrderItem[] };

@Component({
  standalone: true,
  selector: 'app-checkout',
  imports: [CommonModule, FormsModule],
  templateUrl: './checkout.component.html',
})
export class CheckoutComponent {
  private cart = inject(CartService);
  private orders = inject(OrdersService);
  private router = inject(Router);

  // exposés au template (on continue d'appeler items() et total() dans le HTML)
  items = this.cart.items;
  total = this.cart.total_cents;

  loading = false;
  error = '';
  fieldErrors: string[] = [];
  success = false;

  address = '';

  clear() { this.cart.clear(); }

  // ---------- Helpers pour le template (évite ?? dans HTML) ----------
  getName(it: any): string {
    return (it && it.product && it.product.name)
      ? it.product.name
      : (it && it.name) ? it.name : '—';
  }

  getQty(it: any): number {
    const q = (it && typeof it.quantity !== 'undefined') ? it.quantity :
              (it && typeof it.qty !== 'undefined') ? it.qty : 1;
    return Number(q || 1);
  }

  getUnitPriceCents(it: any): number {
    const p = (it && it.product && typeof it.product.price_cents !== 'undefined')
      ? it.product.price_cents
      : (typeof it?.unit_price_cents !== 'undefined' ? it.unit_price_cents : 0);
    return Number(p || 0);
  }

  lineTotalCents(it: any): number {
    return this.getUnitPriceCents(it) * this.getQty(it);
  }
  // -------------------------------------------------------------------

  private buildPayload(): CreateOrderPayload {
    const raw = this.items() || [];
    const items: OrderItem[] = raw.map((it: any) => ({
      product_id: Number((typeof it.product_id !== 'undefined' ? it.product_id : it?.product?.id) || 0),
      qty: this.getQty(it),
    })).filter(i => i.product_id && i.qty > 0);

    return {
      items,
      address: (this.address || '').trim() || undefined
    };
  }

  placeOrder(payNow = false) {
  if (!this.items().length || this.loading) return;
  this.loading = true;
  this.error = '';
  this.success = false;
  this.fieldErrors = [];

  const payload = {
    items: this.items().map((it: any) => ({
      product_id: it.product_id ?? it.product?.id,
      qty: (it.qty ?? it.quantity ?? 1) | 0
    })),
    address: this.address || undefined
  };

  console.log('Checkout payload →', payload); // 👈 vérifie que product_id/qty existent

  this.orders.create(payload).subscribe({
    next: (res: any) => {
      const id = res?.data?.id;
      const after = () => {
        this.loading = false;
        this.success = true;
        this.cart.clear();
        this.router.navigateByUrl(`/orders/${id ?? ''}`);
      };
      if (payNow && id) {
        this.orders.pay(id).subscribe({ next: after, error: after });
      } else {
        after();
      }
    },
    error: (e) => {
      this.loading = false;

      if (e?.status === 422 && e?.error?.errors) {
        this.fieldErrors = Object.values(e.error.errors).flat() as string[];
        this.error = e?.error?.message || 'Commande invalide.';
      } else {
        this.error = e?.error?.message || 'Impossible de créer la commande.';
      }
      console.error('Order create error', e);
    }
  });
}

}

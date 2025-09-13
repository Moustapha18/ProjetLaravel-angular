import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { CurrencyPipe } from '@angular/common';

import { ProductsService } from '../../../core/services/products.service';
import { CartService } from '../../../core/services/cart.service';
import { AuthService } from '../../../core/services/auth.service';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { discountedPriceCents } from '../../../core/utils/price.util';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, FormsModule, RouterLink, CurrencyPipe],
  templateUrl: './products-list.component.html',
  styleUrls: ['./products-list.component.scss']
})
export class ProductListComponent implements OnInit {
  private productsSrv = inject(ProductsService);
  private cart        = inject(CartService);
  private auth        = inject(AuthService);
  private route       = inject(ActivatedRoute);
  private router      = inject(Router);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta|null>(null);

  q = '';
  page = 1;
  private pending = false;
  discounted = (p:any) =>
  (p?.discounted_cents ?? p?.final_price_cents ?? this.discountedPriceFallback(p));

hasPromo = (p:any) => {
  const price = p?.price_cents ?? 0;
  const disc  = p?.discounted_cents ?? p?.final_price_cents ?? price;
  return disc < price;
};

promoPercent = (p:any) => {
  const price = p?.price_cents ?? 0;
  const disc  = p?.discounted_cents ?? p?.final_price_cents ?? price;
  if (price <= 0) return 0;
  return Math.round((1 - disc/price) * 100);
};

// fallback sur ton util existant si jamais le back n'envoie rien
private discountedPriceFallback(p:any){
  try { return discountedPriceCents(p); } catch { return p?.price_cents ?? 0; }
}


  // ---- Prix & promos (toujours un prix à afficher) ----
  finalPriceCents = (p:any) =>
    Number(p?.final_price_cents ?? p?.discounted_cents ?? p?.price_cents ?? 0);
//  hasPromo   = (p:any) => this.finalPriceCents(p) < (p?.price_cents ?? 0);
  promoPct   = (p:any) => {
    const base = p?.price_cents ?? 0;
    if (!base) return 0;
    return Math.max(0, Math.round((1 - this.finalPriceCents(p) / base) * 100));
  };

  // ---- Panier ----
  qtyOf = (id:number) => (this.cart as any).qtyOf?.(id) ?? 0;
  inc   = (id:number) => (this.cart as any).inc?.(id);
  dec   = (id:number) => (this.cart as any).dec?.(id);
  removeFromCart = (id:number) => (this.cart as any).remove?.(id);

  addToCart(p:any){
    const price = this.finalPriceCents(p);
    (this.cart as any).add?.({
      id: p.id,
      name: p.name,
      price_cents: price,
      image_url: p.image_url ?? null
    }, 1);
  }

  // Admin/Employé n’achète pas
  isStaff = () => {
    const r = typeof this.auth.role === 'function' ? this.auth.role : this.auth.role;
    const role = String(r || '').toUpperCase();
    return role === 'ADMIN' || role === 'EMPLOYEE' || role === 'STAFF';
  };

  ngOnInit(){
    this.route.queryParamMap.subscribe(p => {
      this.q    = p.get('q') ?? '';
      if (this.q === 'undefined') this.q = '';
      this.page = +(p.get('page') ?? 1);
      this.load();
    });
  }

  load(){
    if (this.pending) return;
    this.pending = true;
    this.loading.set(true);

    this.productsSrv.list({
      search: this.q.trim() ? this.q.trim() : undefined,
      page: this.page,
      per_page: 12
    })
    .pipe(
      catchError(err => {
        console.error('Products load error:', err);
        this.items.set([]);
        this.meta.set(null);
        return of({ data: [], meta: null });
      }),
      finalize(() => {
        this.loading.set(false);
        this.pending = false;
      })
    )
    .subscribe(res => {
      this.items.set(res?.data ?? res ?? []);
      this.meta.set(res?.meta ?? null);
    });
  }

  applySearch(){
    this.router.navigate([], { queryParams: { q: this.q || null, page: 1 }, queryParamsHandling: 'merge' });
  }
  next(){ const m = this.meta(); if (m && m.current_page < m.last_page) this.router.navigate([], { queryParams: { page: m.current_page + 1 }, queryParamsHandling: 'merge' }); }
  prev(){ const m = this.meta(); if (m && m.current_page > 1) this.router.navigate([], { queryParams: { page: m.current_page - 1 }, queryParamsHandling: 'merge' }); }
}

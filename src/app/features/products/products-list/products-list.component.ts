import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';
import { discountedPriceCents } from '../../../core/utils/price.util';
import { catchError, finalize } from 'rxjs/operators';
import { of } from 'rxjs';
import { AuthService } from '../../../core/services/auth.service';
import { CartService } from '../../../core/services/cart.service';


type Meta = { current_page: number; last_page: number; total: number };

@Component({
  standalone: true,
  selector: 'app-products-list',
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './products-list.component.html',
   styleUrls: ['./products-list.component.scss']
})
export class ProductListComponent implements OnInit {
private auth = inject(AuthService);
// en haut du composant
qtyOf = (id:number) => this.cart['qtyOf']?.(id) ?? 0;
inc  = (id:number) => (this.cart as any).inc?.(id);
dec  = (id:number) => (this.cart as any).dec?.(id);
removeFromCart = (id:number) => this.cart.remove(id);


authRole = () => (typeof this.auth.role === 'function' ? this.auth.role : this.auth.role);

  private productsSrv = inject(ProductsService);
  private cart = inject(CartService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta | null>(null);

  q = '';
  page = 1;
  private pending = false;

  discounted = discountedPriceCents;
  hasPromo = (p: any) => !!(p && (p.percent_off ?? p?.promotion?.percent_off ?? p?.promo?.percent_off));
  promoPercent = (p: any) => (p?.percent_off ?? p?.promotion?.percent_off ?? p?.promo?.percent_off ?? 0);
p: any;
  
addToCart(p:any){
  this.cart.add({
    id: p.id,
    name: p.name,
    price_cents: p.price_cents || 0,
    image_url: p.image_url ?? null
  }, 1);
}

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.q    = p.get('q') ?? '';
      if (this.q === 'undefined') this.q = '';
      this.page = +(p.get('page') ?? 1);
      this.load();
    });
  }

  load() {
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
        // Optionnel: afficher un toast ici
        console.error('Products load error:', err);
        this.items.set([]);      // vide propre
        this.meta.set(null);
        return of({ data: [], meta: null }); // neutralise l’erreur pour le subscribe
      }),
      finalize(() => {
        this.loading.set(false); // ✅ éteint même si erreur/401/429
        this.pending = false;
      })
    )
    .subscribe(res => {
      this.items.set(res?.data ?? []);
      this.meta.set(res?.meta ?? null);
    });
  }

  applySearch() {
    this.router.navigate([], { queryParams: { q: this.q || null, page: 1 }, queryParamsHandling: 'merge' });
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
  isStaff = () => {
  const r = typeof this.auth.role === 'function' ? this.auth.role : this.auth.role;
  const role = String(r || '').toUpperCase();
  return role === 'ADMIN' || role === 'EMPLOYEE';
};
}

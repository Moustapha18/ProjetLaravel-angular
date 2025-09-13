// src/app/admin/services/promotions.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment'; // ← unifie l’import
import { Observable } from 'rxjs';
import { Promotion } from '../models/promotion.model';

// Si ton modèle ne les expose pas, décommente ces types :
// export type PromotionType = 'PERCENT' | 'FIXED';
// export type PromotionAppliesTo = 'ORDER' | 'PRODUCT' | 'CATEGORY';

type ListResp<T> = { data: T[]; meta?: any } | { items: T[]; meta?: any } | T[];

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/promotions`;

  // ========= LIST / GET =========
  list(params?: { page?: number; per_page?: number; applies_to?: string }) {
    const p = this.params({
      page: params?.page,
      per_page: params?.per_page,
      applies_to: params?.applies_to || undefined,
    });
    return this.http.get<ListResp<Promotion>>(this.base, { params: p });
  }

  get(id: number | string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.base}/${id}`);
  }

  // ========= CREATE / UPDATE / DELETE =========
  // create / update acceptent désormais category_ids (pour CATEGORY) et min_order_cents (pour ORDER)
  create(payload: Partial<Promotion> & {
    product_ids?: number[];      // applies_to === 'PRODUCT'
    category_ids?: number[];     // applies_to === 'CATEGORY'
    min_order_cents?: number | null; // applies_to === 'ORDER'
    starts_at?: string | null;   // ISO
    ends_at?: string | null;     // ISO
  }) {
    return this.http.post<Promotion>(this.base, this.clean(payload));
  }

  update(id: number | string, payload: Partial<Promotion> & {
    product_ids?: number[];
    category_ids?: number[];
    min_order_cents?: number | null;
    starts_at?: string | null;
    ends_at?: string | null;
  }) {
    return this.http.put<Promotion>(`${this.base}/${id}`, this.clean(payload));
  }

  remove(id: number | string) {
    return this.http.delete<void>(`${this.base}/${id}`);
  }

  // ========= HELPERS pour le formulaire =========
  // Produits (public): GET /api/v1/products
  listProducts(params?: { per_page?: number; search?: string }) {
    const qp = this.params({ per_page: params?.per_page ?? 200, search: params?.search });
    return this.http.get<{ data: any[]; meta?: any } | any[]>(
      `${environment.apiUrl}/products`,
      { params: qp }
    );
  }

  // Catégories (public): GET /api/v1/categories
  listCategories() {
    return this.http.get<{ data: any[] } | any[]>(
      `${environment.apiUrl}/categories`
    );
  }

  // ========= UTILS =========
  private params(obj: Record<string, any>) {
    let p = new HttpParams();
    Object.entries(obj).forEach(([k, v]) => {
      if (v === null || v === undefined || v === '') return;
      p = p.set(k, String(v));
    });
    return p;
  }

  private clean<T extends Record<string, any>>(obj: T): T {
    const out: Record<string, any> = {};
    Object.entries(obj || {}).forEach(([k, v]) => {
      if (v === undefined) return;                  // on retire undefined
      out[k] = Array.isArray(v) ? v.filter(x => x !== undefined) : v;
    });
    return out as T;
  }
}

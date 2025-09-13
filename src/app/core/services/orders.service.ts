import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';
import { ApiList, Order, OrderStatus } from '../models/order.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class OrdersService {
  private http = inject(HttpClient);

  // Créer une commande (qty requis par le backend)
  create(payload: {
    items: { product_id: number; qty: number }[];
    address?: string;
    promo_code?: string; 
  }) {
    return this.http.post(`${environment.apiUrl}/orders`, payload);
  }
  validatePromo(code: string, amount_cents?: number) {
    return this.http.post<{valid:boolean; discount_cents:number; promotion:any; reason?:string}>(
      `${environment.apiUrl}/promotions/validate`,
      { code, amount_cents }
    );
  }

  // Client: payer sa commande (MVP)
  pay(orderId: number) {
    return this.http.post<any>(`${environment.apiUrl}/orders/${orderId}/pay`, {});
  }

  // Staff: marquer payée (cash reçu)
  markPaid(id: number) {
    return this.http.post<any>(`${environment.apiUrl}/orders/${id}/mark-paid`, {});
  }

  // Liste des commandes du client connecté
  mine(params?: { page?: number; per_page?: number; status?: string }) {
    return this.http.get<any>(`${environment.apiUrl}/orders/mine`, { params: { ...params } });
  }

  // Liste globale (ADMIN/EMPLOYÉ)
  listAll(opts: { page?: number; per_page?: number; status?: string } = {}) {
    let params = new HttpParams();
    Object.entries(opts).forEach(([k, v]) => {
      if (v !== undefined && v !== null) params = params.set(k, String(v));
    });
    return this.http.get<ApiList<Order>>(`${environment.apiUrl}/orders`, { params });
  }

  get(id: number | string) {
    return this.http.get<Order>(`${environment.apiUrl}/orders/${id}`);
  }

  updateStatus(id: number | string, status: OrderStatus) {
    return this.http.put<Order>(`${environment.apiUrl}/orders/${id}/status`, { status });
  }

  // Facture PDF
  downloadInvoice(orderId: number): Observable<Blob> {
    const url = `${environment.apiUrl}/orders/${orderId}/invoice`;
    return this.http.get(url, { responseType: 'blob' });
  }
  sendInvoice(orderId: number) {
  return this.http.post(`${environment.apiUrl}/orders/${orderId}/send-invoice`, {});
}

}

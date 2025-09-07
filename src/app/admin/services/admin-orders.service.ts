import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type OrderStatus = 'PENDING'|'PREPARING'|'READY'|'OUT_FOR_DELIVERY'|'DELIVERED'|'CANCELED';

@Injectable({ providedIn: 'root' })
export class AdminOrdersService {
  private base = `${environment.apiUrl}/admin/orders`;
  constructor(private http: HttpClient) {}

  list(params?: { status?: OrderStatus; page?: number; per_page?: number; q?: string }) {
    return this.http.get<{ data: any[]; meta?: any }>(this.base, { params: { ...params } });
  }
  find(id: number|string) { return this.http.get<any>(`${this.base}/${id}`); }
  updateStatus(id: number|string, status: OrderStatus) {
    return this.http.put<any>(`${this.base}/${id}/status`, { status });
  }
  assign(id: number|string, assignee_id: number|string|null) {
    return this.http.put<any>(`${this.base}/${id}/assign`, { assignee_id });
  }
  addNote(id: number|string, note: string) {
    return this.http.post<any>(`${this.base}/${id}/notes`, { note });
  }
}

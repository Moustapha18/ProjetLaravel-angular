import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Promotion } from '../models/admin.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class PromotionsService {
  private base = `${environment.apiUrl}/admin/promotions`;
  constructor(private http: HttpClient) {}

  list(params?: { page?: number; per_page?: number; search?: string }) {
    return this.http.get<{ data: Promotion[]; meta?: any }>(this.base, { params: { ...params } });
  }
  find(id: number | string): Observable<Promotion> {
    return this.http.get<Promotion>(`${this.base}/${id}`);
  }
  create(payload: Partial<Promotion>): Observable<Promotion> {
    return this.http.post<Promotion>(this.base, payload);
  }
  update(id: number | string, payload: Partial<Promotion>): Observable<Promotion> {
    return this.http.put<Promotion>(`${this.base}/${id}`, payload);
  }
  delete(id: number | string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}

import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class AdminCategoriesService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/categories`;

  list(params?: { q?: string; page?: number; per_page?: number }) {
    return this.http.get<{ data: any[]; meta?: any }>(this.base, { params: { ...params } });
  }
  get(id: number | string) {
    return this.http.get<any>(`${this.base}/${id}`);
  }
  create(payload: { name: string; description?: string | null }) {
    return this.http.post<any>(this.base, payload);
  }
  update(id: number | string, payload: { name?: string; description?: string | null }) {
    return this.http.put<any>(`${this.base}/${id}`, payload);
  }
  destroy(id: number | string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}

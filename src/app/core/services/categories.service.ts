import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Category } from '../models/category.models';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private http = inject(HttpClient);
  allPlain: any;

  // { data: Category[]; meta? } — pagination éventuelle
  list(params?: { page?: number; per_page?: number }) {
    return this.http.get<{ data: Category[]; meta?: any }>(
      `${environment.apiUrl}/categories`,
      { params }
    );
  }

  // ✅ Retourne directement Category[]
  all() {
    return this.http
      .get<{ data: Category[] }>(`${environment.apiUrl}/categories`)
      .pipe(map(res => res?.data ?? []));
  }

  create(payload: { name: string }) {
    return this.http.post(`${environment.apiUrl}/admin/categories`, payload);
  }
  update(id: number|string, payload: { name: string }) {
    return this.http.put(`${environment.apiUrl}/admin/categories/${id}`, payload);
  }
  delete(id: number|string) {
    return this.http.delete(`${environment.apiUrl}/admin/categories/${id}`);
  }
}

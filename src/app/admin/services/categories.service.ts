import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Category } from '../models/admin.models';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class CategoriesService {
  private base = `${environment.apiUrl}/admin/categories`;
  constructor(private http: HttpClient) {}

  list(params?: { page?: number; per_page?: number; search?: string }) {
    return this.http.get<{ data: Category[]; meta?: any }>(this.base, { params: { ...params } });
  }
  find(id: number | string): Observable<Category> {
    return this.http.get<Category>(`${this.base}/${id}`);
  }
  create(payload: Partial<Category>): Observable<Category> {
    return this.http.post<Category>(this.base, payload);
  }
  update(id: number | string, payload: Partial<Category>): Observable<Category> {
    return this.http.put<Category>(`${this.base}/${id}`, payload);
  }
  delete(id: number | string) {
    return this.http.delete(`${this.base}/${id}`);
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class TrashService {
  private base = `${environment.apiUrl}/admin/trash`;
  constructor(private http: HttpClient) {}

  list(params?: { type?: string; page?: number; per_page?: number; search?: string }) {
    return this.http.get<{ data:any[]; meta?: any }>(this.base, { params: { ...params } });
  }

  restore(type: string, id: number|string) {
    return this.http.post(`${this.base}/${type}/${id}/restore`, {});
  }

  forceDelete(type: string, id: number|string) {
    return this.http.delete(`${this.base}/${type}/${id}/force`);
  }
}

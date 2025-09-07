import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminProductPayload {
  name: string;
  price_cents: number;
  description?: string;
  category_id?: number;
  stock?: number;
  percent_off?: number; // si promos directes
}

@Injectable({ providedIn: 'root' })
export class AdminProductsService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/products`;
  

  list(params?: any){ return this.http.get<{data:any[];meta?:any}>(this.base, { params }); } // si ton back l’expose, sinon réutilise ProductsService.list
//  create(payload: any){ return this.http.post<any>(this.base, payload); }
  find(id: number|string){ return this.http.get<any>(`${this.base}/${id}`); }
  update(id: number|string, payload: any){ return this.http.put<any>(`${this.base}/${id}`, payload); }
  destroy(id: number|string){ return this.http.delete(`${this.base}/${id}`); }          // ✅
  uploadImage(id: number|string, file: File){
    const form = new FormData(); form.append('image', file);
    return this.http.post<any>(`${this.base}/${id}/image`, form);
  }
  create(payload: {
    name: string;
    price_cents: number;
    description?: string;
    category_id?: number;
    stock?: number;
    percent_off?: number;
  }) {
    return this.http.post(`${environment.apiUrl}/admin/products`, payload);
  }
}

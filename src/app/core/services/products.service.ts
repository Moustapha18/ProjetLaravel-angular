import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type CreateProductPayload = {
  name: string;
  price_cents: number;
  category_id?: number;           // ← optionnel
  stock?: number | null;
  percent_off?: number | null;
  description?: string;
};

@Injectable({ providedIn: 'root' })
export class ProductsService {
  private http = inject(HttpClient);

  // Catalogue public (lecture)
 // admin-products.service.ts ou products.service.ts

list(params?: { search?: string; page?: number; per_page?: number }) {
  const normalized = {
    ...(params?.search ? { search: params.search } : {}),
    ...(params?.page ? { page: params.page } : {}),
    ...(params?.per_page ? { per_page: params.per_page } : {})
  };
  return this.http.get<{ data: any[]; meta?: any }>(
    `${environment.apiUrl}/products`,
    { params: normalized }
  );
}



  get(id: number | string) {
    return this.http.get<any>(`${environment.apiUrl}/products/${id}`);
  }

  // ====== ADMIN / EMPLOYÉ : écriture ======
  create(payload: CreateProductPayload) {
    return this.http.post<any>(`${environment.apiUrl}/admin/products`, payload);
  }

  update(id: number | string, payload: Partial<CreateProductPayload>) {
    return this.http.put<any>(`${environment.apiUrl}/admin/products/${id}`, payload);
  }

  delete(id: number | string) {
    return this.http.delete<any>(`${environment.apiUrl}/admin/products/${id}`);
  }

  uploadImage(productId: number | string, file: File) {
    const form = new FormData();
    form.append('image', file);
    return this.http.post<any>(`${environment.apiUrl}/admin/products/${productId}/image`, form);
  }

  deleteImage(productId: number | string) {
    return this.http.delete<any>(`${environment.apiUrl}/admin/products/${productId}/image`);
  }
}

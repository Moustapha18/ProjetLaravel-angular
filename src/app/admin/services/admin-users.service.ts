import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export type UserRole = 'ADMIN' | 'EMPLOYE';
export interface AdminUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
  created_at?: string;
}
export interface Paged<T> {
  data: T[];
  meta?: { current_page: number; last_page: number; total: number };
}

@Injectable({ providedIn: 'root' })
export class AdminUsersService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/admin/users`;

  list(params?: { page?: number; per_page?: number; q?: string; role?: string }) {
    let p = new HttpParams();
    if (params?.page)      p = p.set('page', String(params.page));
    if (params?.per_page)  p = p.set('per_page', String(params.per_page));
    if (params?.q)         p = p.set('q', params.q);
    if (params?.role)      p = p.set('role', params.role);
    return this.http.get<Paged<AdminUser>>(this.base, { params: p });
  }

  create(payload: { name: string; email: string; role: UserRole }) {
    // Le mot de passe temporaire est généré côté backend et envoyé par email
    return this.http.post<{ message: string; data: AdminUser }>(this.base, payload);
  }

  destroy(id: number) {
    return this.http.delete(`${this.base}/${id}`);
  }
}

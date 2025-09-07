import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface User {
  id: number;
  name: string;
  email: string;
  role: 'ADMIN'|'EMPLOYE'|'CLIENT';
  created_at?: string;
}

@Injectable({ providedIn: 'root' })
export class UsersService {
  private base = `${environment.apiUrl}/admin/users`;
  constructor(private http: HttpClient) {}

  list(params?: { q?: string; role?: string; page?: number; per_page?: number }) {
    return this.http.get<{ data: User[]; meta?: any }>(this.base, { params: { ...params } });
  }
  find(id: number | string) { return this.http.get<User>(`${this.base}/${id}`); }
  create(payload: Partial<User>) { return this.http.post<User>(this.base, payload); }
  update(id: number | string, payload: Partial<User>) { return this.http.put<User>(`${this.base}/${id}`, payload); }
  delete(id: number | string) { return this.http.delete(`${this.base}/${id}`); }
  // optionnel: reset mot de passe
  resetPassword(id: number | string) { return this.http.post(`${this.base}/${id}/reset-password`, {}); }
}

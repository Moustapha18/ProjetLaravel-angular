// src/app/core/services/api.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
// ⚠️ préfère importer "environment" sans suffixe pour bénéficier du file replacement Angular
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class ApiService {
  private http = inject(HttpClient);

  // Normalisation de base URL (supprime les / en trop)
  private readonly root = (environment.apiUrl ?? '').replace(/\/+$/, '');

  // Si root se termine déjà par /api/v{n} → on garde
  // Si root se termine par /api → on ajoute /v1
  // Sinon → on ajoute /api/v1
  private readonly base =
    /\/api\/v\d+$/i.test(this.root)
      ? this.root
      : (/\/api$/i.test(this.root) ? `${this.root}/v1` : `${this.root}/api/v1`);

  // ============ AUTH ============
  register(body: any) {
    // body doit contenir: name, email, password, password_confirmation
    return this.http.post(`${this.base}/register`, body);
  }

  login(body: { email: string; password: string }) {
    return this.http.post<{ token: string; data: any }>(`${this.base}/login`, body);
  }

  me() {
    return this.http.get<{ data: any }>(`${this.base}/me`);
  }

  logout() {
    return this.http.post(`${this.base}/logout`, {});
  }
}

import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment.development';

@Injectable({ providedIn: 'root' })
export class ApiService {
  register(arg0: { name: string; email: string; password: string; password_confirmation: string; }) {
    return this.http.post(`${this.base}/register`, arg0);
  }
  //private base = environment.apiBase;
  private base = `${environment.apiUrl}/api/v1`;
  constructor(private http: HttpClient) {}

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

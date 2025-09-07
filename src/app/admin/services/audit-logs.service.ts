import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

export interface AuditLog {
  id: number;
  actor?: string;        // ex: email / username
  action: string;        // ex: CREATE/UPDATE/DELETE/LOGIN...
  entity_type?: string;  // ex: product, order
  entity_id?: number;
  created_at: string;
  metadata?: any;        // diff, payload, ip, userAgent...
}

@Injectable({ providedIn: 'root' })
export class AuditLogsService {
  private base = `${environment.apiUrl}/admin/audit-logs`;
  constructor(private http: HttpClient) {}

  list(params?: { page?: number; per_page?: number; q?: string; action?: string; entity_type?: string; actor?: string }) {
    return this.http.get<{ data: AuditLog[]; meta?: any }>(this.base, { params: { ...params } });
  }

  find(id: number | string) {
    return this.http.get<AuditLog>(`${this.base}/${id}`);
  }
}

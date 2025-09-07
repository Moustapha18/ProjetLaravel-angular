import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

export interface AdminStats {
  totals: { products:number; orders:number; customers:number; revenue_cents:number };
  sales_over_time: Array<{ date:string; total_cents:number }>;
}

@Injectable({ providedIn: 'root' })
export class AdminStatsService {
  private base = `${environment.apiUrl}/admin/stats`;
  constructor(private http: HttpClient) {}

  // ⬇️ accepte start/end (YYYY-MM-DD) et/ou preset ('7d','30d','90d','this_month','custom')
  get(params?: { start?: string; end?: string; preset?: string }): Observable<AdminStats> {
    return this.http.get<AdminStats>(this.base, { params: { ...params } });
  }
}

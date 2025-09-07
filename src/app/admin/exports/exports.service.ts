import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ExportsService {
  private base = `${environment.apiUrl}/admin/exports`;
  constructor(private http: HttpClient) {}

  productsCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/products`, { responseType: 'blob' });
  }
  ordersCsv(): Observable<Blob> {
    return this.http.get(`${this.base}/orders`, { responseType: 'blob' });
  }
}

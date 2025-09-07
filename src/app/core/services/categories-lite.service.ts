
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class CategoriesLiteService {
  constructor(private http: HttpClient) {}
  listAll() {
    // simple: récupère 100 premières
    return this.http.get<{ data:any[] }>(`${environment.apiUrl}/admin/categories`, { params: { per_page: 100 } });
  }
}

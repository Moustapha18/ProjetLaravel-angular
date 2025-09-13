// src/app/core/services/support.service.ts
import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Injectable({ providedIn: 'root' })
export class SupportService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}`;

  ensureThread() {
    return this.http.post<{id:number; status:string}>(`${this.base}/support/threads/ensure`, {});
  }

  messages(threadId: number) {
    return this.http.get<{data:any[]}>(`${this.base}/support/threads/${threadId}/messages`);
  }

  send(threadId: number, body: string, toBot = false) {
    return this.http.post<{data:any}>(`${this.base}/support/threads/${threadId}/messages`, { body, to_bot: toBot });
  }

  close(threadId: number) {
    return this.http.post(`${this.base}/support/threads/${threadId}/close`, {});
  }
}

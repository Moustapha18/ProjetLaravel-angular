import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AuditLogsService, AuditLog } from '../../services/audit-logs.service';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-audit-list',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Activity / Audit logs</h2>
      <div class="flex gap-2">
        <input class="border rounded p-2" placeholder="Recherche..." [(ngModel)]="q" (keyup.enter)="apply()" />
        <select class="border rounded p-2" [(ngModel)]="action" (change)="apply()">
          <option value="">Action</option>
          <option>CREATE</option>
          <option>UPDATE</option>
          <option>DELETE</option>
          <option>LOGIN</option>
        </select>
        <input class="border rounded p-2" placeholder="Type (product, order…)" [(ngModel)]="entity_type" (keyup.enter)="apply()" />
        <input class="border rounded p-2" placeholder="Actor (email…)" [(ngModel)]="actor" (keyup.enter)="apply()" />
        <button class="px-3 py-2 border rounded" (click)="apply()">Filtrer</button>
      </div>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun log</div>

    <table class="w-full text-sm border" *ngIf="!loading() && items().length">
      <thead class="bg-gray-50">
        <tr>
          <th class="p-2 text-left">Date</th>
          <th class="p-2 text-left">Actor</th>
          <th class="p-2 text-left">Action</th>
          <th class="p-2 text-left">Objet</th>
          <th class="p-2 text-left">Détails</th>
        </tr>
      </thead>
      <tbody>
        <tr *ngFor="let l of items()" class="border-t">
          <td class="p-2">{{ l.created_at | date:'short' }}</td>
          <td class="p-2">{{ l.actor || '—' }}</td>
          <td class="p-2">{{ l.action }}</td>
          <td class="p-2">{{ l.entity_type || '—' }} #{{ l.entity_id || '—' }}</td>
          <td class="p-2">
            <pre class="whitespace-pre-wrap text-xs bg-gray-50 p-2 rounded max-h-40 overflow-auto">{{ l.metadata | json }}</pre>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} logs</span>
      <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class AuditListComponent implements OnInit {
  private svc = inject(AuditLogsService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  items   = signal<AuditLog[]>([]);
  meta    = signal<Meta | null>(null);

  page = 1;
  q = ''; action = ''; entity_type = ''; actor = '';

  ngOnInit() {
    this.route.queryParamMap.subscribe(p => {
      this.page        = +(p.get('page') ?? 1);
      this.q           = p.get('q') ?? '';
      this.action      = p.get('action') ?? '';
      this.entity_type = p.get('entity_type') ?? '';
      this.actor       = p.get('actor') ?? '';
      this.load();
    });
  }

  load(){
    this.loading.set(true);
    this.svc.list({
      page: this.page, per_page: 20,
      q: this.q || undefined, action: this.action || undefined,
      entity_type: this.entity_type || undefined, actor: this.actor || undefined
    }).subscribe(res => {
      this.items.set(res?.data ?? []);
      this.meta.set(res?.meta ?? null);
      this.loading.set(false);
    });
  }

  apply(){
    this.router.navigate([], {
      queryParams: {
        page: 1,
        q: this.q || null, action: this.action || null,
        entity_type: this.entity_type || null, actor: this.actor || null
      },
      queryParamsHandling: 'merge'
    });
  }

  next(){ const m=this.meta(); if(m && m.current_page<m.last_page){ this.router.navigate([], { queryParams:{ page:m.current_page+1 }, queryParamsHandling:'merge' }); } }
  prev(){ const m=this.meta(); if(m && m.current_page>1){ this.router.navigate([], { queryParams:{ page:m.current_page-1 }, queryParamsHandling:'merge' }); } }
}

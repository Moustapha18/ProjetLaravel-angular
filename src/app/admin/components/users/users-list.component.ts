import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { UsersService, User } from '../../services/users.service';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-users-list',
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="flex items-center justify-between mb-3">
      <h2 class="text-xl font-semibold">Utilisateurs</h2>
      <a routerLink="/admin/users/new" class="px-3 py-2 border rounded">Nouvel utilisateur</a>
    </div>

    <div class="flex gap-2 mb-3">
      <input class="border rounded p-2" [(ngModel)]="q" (keyup.enter)="apply()" placeholder="Recherche..." />
      <select class="border rounded p-2" [(ngModel)]="role" (change)="apply()">
        <option value="">Tous rôles</option>
        <option value="ADMIN">ADMIN</option>
        <option value="EMPLOYE">EMPLOYÉ</option>
        <option value="CLIENT">CLIENT</option>
      </select>
      <button class="px-3 py-2 border rounded" (click)="apply()">Filtrer</button>
    </div>

    <div *ngIf="loading()">Chargement…</div>
    <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun utilisateur.</div>

    <table class="w-full text-sm border" *ngIf="!loading() && items().length">
      <thead class="bg-gray-50">
        <tr><th class="p-2 text-left">Nom</th><th class="p-2 text-left">Email</th><th class="p-2 text-left">Rôle</th><th class="p-2 w-40"></th></tr>
      </thead>
      <tbody>
        <tr *ngFor="let u of items()" class="border-t">
          <td class="p-2">{{ u.name }}</td>
          <td class="p-2">{{ u.email }}</td>
          <td class="p-2">{{ u.role }}</td>
          <td class="p-2 text-right">
            <a [routerLink]="['/admin/users', u.id]" class="text-blue-700 mr-2">Éditer</a>
            <button (click)="remove(u)" class="text-red-600">Supprimer</button>
          </td>
        </tr>
      </tbody>
    </table>

    <div class="flex gap-2 items-center mt-4" *ngIf="meta() as m">
      <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
      <span>Page {{ m.current_page }} / {{ m.last_page }} — {{ m.total }} utilisateurs</span>
      <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
    </div>
  `
})
export class UsersListComponent implements OnInit {
  private svc = inject(UsersService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  loading = signal(false);
  items   = signal<User[]>([]);
  meta    = signal<Meta | null>(null);

  page = 1; q = ''; role = '';

  ngOnInit(){ this.route.queryParamMap.subscribe(p=>{ this.page=+(p.get('page')||1); this.q=p.get('q')||''; this.role=p.get('role')||''; this.load(); }); }

  load(){
    this.loading.set(true);
    this.svc.list({ page:this.page, per_page:12, q: this.q || undefined, role: this.role || undefined })
      .subscribe(res => { this.items.set(res.data||[]); this.meta.set(res.meta||null); this.loading.set(false); });
  }

  apply(){ this.router.navigate([], { queryParams: { page:1, q:this.q||null, role:this.role||null }, queryParamsHandling:'merge' }); }
  next(){ const m=this.meta(); if(m && m.current_page<m.last_page) this.router.navigate([], { queryParams:{ page:m.current_page+1 }, queryParamsHandling:'merge' }); }
  prev(){ const m=this.meta(); if(m && m.current_page>1) this.router.navigate([], { queryParams:{ page:m.current_page-1 }, queryParamsHandling:'merge' }); }
  remove(u:User){ if(!confirm(`Supprimer ${u.email} ?`)) return; this.svc.delete(u.id).subscribe(()=> this.load()); }
}

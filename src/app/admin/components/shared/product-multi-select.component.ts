import { Component, Input, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, FormControl } from '@angular/forms';
import { ProductsService } from '../../../core/services/products.service';

type Meta = { current_page:number; last_page:number; total:number };

@Component({
  standalone: true,
  selector: 'app-product-multi-select',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="border rounded p-3 grid gap-3">
      <div class="flex items-center gap-2">
        <input class="border rounded p-2 w-full" [(ngModel)]="q" (keyup.enter)="search()" placeholder="Rechercher un produit..." />
        <button class="px-3 py-2 border rounded" (click)="search()">Rechercher</button>
      </div>

      <div *ngIf="loading()">Chargement…</div>
      <div *ngIf="!loading() && items().length===0" class="text-gray-500">Aucun produit</div>

      <ul class="grid gap-2" *ngIf="!loading() && items().length">
        <li *ngFor="let p of items()" class="flex items-center justify-between border rounded p-2">
          <div class="truncate">
            <div class="font-medium truncate">{{ p.name }}</div>
            <div class="text-xs text-gray-600">{{ (p.price_cents||0)/100 | currency:'XOF' }}</div>
          </div>
          <button (click)="toggle(p.id)"
                  class="px-2 py-1 border rounded"
                  [class.bg-blue-50]="isSelected(p.id)">
            {{ isSelected(p.id) ? 'Retirer' : 'Ajouter' }}
          </button>
        </li>
      </ul>

      <div class="flex items-center justify-between mt-2" *ngIf="meta() as m">
        <button (click)="prev()" [disabled]="m.current_page<=1" class="px-2 py-1 border rounded">◀</button>
        <span class="text-sm">Page {{ m.current_page }} / {{ m.last_page }} ({{ m.total }} produits)</span>
        <button (click)="next()" [disabled]="m.current_page>=m.last_page" class="px-2 py-1 border rounded">▶</button>
      </div>

      <div *ngIf="control.value.length" class="text-sm text-gray-700">
  {{ control.value.length }} produit(s) sélectionné(s): {{ control.value.join(', ') }}
</div>


    </div>
  `
})
export class ProductMultiSelectComponent implements OnInit {
  private products = inject(ProductsService);

//  @Input() control!: FormControl<number[]>; // parent fournit form.controls['product_ids']
  @Input() control!: FormControl<number[]>; // non-nullable

  q = '';
  page = 1;
  per_page = 10;

  loading = signal(false);
  items   = signal<any[]>([]);
  meta    = signal<Meta | null>(null);

  ngOnInit(){ this.load(); }

  search(){ this.page = 1; this.load(); }

  load(){
    this.loading.set(true);
    this.products.list({ search: this.q || undefined, page: this.page, per_page: this.per_page })
      .subscribe(res => {
        this.items.set(res?.data ?? []);
        this.meta.set(res?.meta ?? null);
        this.loading.set(false);
      });
  }

  next(){ const m=this.meta(); if(m && m.current_page<m.last_page){ this.page=m.current_page+1; this.load(); } }
  prev(){ const m=this.meta(); if(m && m.current_page>1){ this.page=m.current_page-1; this.load(); } }

  isSelected(id:number){ return (this.control?.value ?? []).includes(id); }

  toggle(id:number){
    const cur = this.control?.value ?? [];
    if (cur.includes(id)) {
      this.control?.setValue(cur.filter(x => x !== id));
    } else {
      this.control?.setValue([...cur, id]);
    }
    this.control?.markAsDirty();
    this.control?.updateValueAndValidity();
  }
}

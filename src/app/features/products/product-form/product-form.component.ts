// src/app/admin/components/products/product-form.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';

@Component({
  standalone: true,
  selector: 'app-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
  <div class="max-w-3xl mx-auto">
    <h2 class="text-2xl font-semibold mb-4 tracking-tight">
      {{ id ? 'Modifier le produit' : 'Créer un produit' }}
    </h2>

    <form [formGroup]="form" (ngSubmit)="save()"
          class="bg-white rounded-2xl shadow border border-slate-200 p-5 grid gap-5">

      <div class="grid gap-4 md:grid-cols-2">
        <!-- Catégorie -->
        <div class="grid gap-1.5">
          <label class="text-sm text-slate-700">Catégorie *</label>
          <select class="border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400/60"
                  formControlName="category_id">
            <option [ngValue]="null">—</option>
            <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
          </select>
          <small *ngIf="form.get('category_id')?.touched && form.get('category_id')?.invalid"
                 class="text-xs text-red-600">Catégorie requise</small>
        </div>

        <!-- Nom -->
        <div class="grid gap-1.5">
          <label class="text-sm text-slate-700">Nom *</label>
          <input class="border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400/60"
                 formControlName="name" placeholder="Ex : Baguette tradition" />
          <small *ngIf="form.get('name')?.touched && form.get('name')?.invalid"
                 class="text-xs text-red-600">Nom requis</small>
        </div>

        <!-- Prix -->
        <div class="grid gap-1.5">
          <label class="text-sm text-slate-700">Prix (en francs CFA) *</label>
          <div class="relative">
            <span class="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">F CFA</span>
            <input type="number"
                   class="border rounded-xl p-2.5 pl-16 w-full outline-none focus:ring-2 focus:ring-amber-400/60"
                   formControlName="price" />
          </div>
          <small *ngIf="form.get('price')?.touched && form.get('price')?.invalid"
                 class="text-xs text-red-600">Prix valide requis</small>
        </div>

        <!-- Stock -->
        <div class="grid gap-1.5">
          <label class="text-sm text-slate-700">Stock (optionnel)</label>
          <input type="number"
                 class="border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400/60"
                 formControlName="stock" />
        </div>

        <!-- Description -->
        <div class="grid gap-1.5 md:col-span-2">
          <label class="text-sm text-slate-700">Description (optionnel)</label>
          <textarea rows="3"
                    class="border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400/60"
                    formControlName="description"
                    placeholder="Quelques mots sur le produit…"></textarea>
        </div>

        <!-- Remise -->
        <div class="grid gap-1.5">
          <label class="text-sm text-slate-700">Remise (%) (optionnel)</label>
          <input type="number" min="0" max="100"
                 class="border rounded-xl p-2.5 outline-none focus:ring-2 focus:ring-amber-400/60"
                 formControlName="percent_off" />
          <div class="flex items-center justify-between">
            <small class="text-xs text-slate-500">0 à 100 (ex. 15 = -15%)</small>
            <small *ngIf="form.get('percent_off')?.touched && form.get('percent_off')?.invalid"
                   class="text-xs text-red-600">Valeur entre 0 et 100</small>
          </div>
        </div>

        <!-- Upload image -->
        <div class="grid gap-1.5 md:col-span-2">
          <label class="text-sm text-slate-700">Image (upload)</label>
          <div class="rounded-xl border border-dashed border-slate-300 p-3 flex items-center justify-between">
            <input type="file" accept="image/*" (change)="onFile($event)" class="block" />
            <span class="text-xs text-slate-500" *ngIf="!file">PNG, JPG…</span>
            <span class="text-xs text-slate-700 font-medium" *ngIf="file">{{ file.name }}</span>
          </div>
        </div>
      </div>

      <!-- Actions -->
      <div class="flex flex-wrap items-center gap-2 pt-1">
        <button type="submit"
                class="px-4 py-2.5 rounded-xl bg-black text-white font-medium hover:opacity-90 active:scale-[.99] disabled:opacity-50"
                [disabled]="form.invalid || saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <a routerLink="/admin/products"
           class="px-4 py-2.5 rounded-xl border border-slate-300 hover:bg-slate-50">Annuler</a>
        <span *ngIf="error" class="text-sm text-red-600">{{ error }}</span>
      </div>
    </form>
  </div>
`

})
export class ProductFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(ProductsService);
  private cats = inject(CategoriesService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);

  id: number | null = null;
  categories: any[] = [];
  file?: File;
  saving = false;
  error = '';

  form = this.fb.group({
  category_id: this.fb.control<number | null>(null, Validators.required),
  name: this.fb.nonNullable.control('', Validators.required),
  price: this.fb.nonNullable.control<number | null>(null, Validators.required),
  stock: this.fb.control<number | null>(null),
  description: this.fb.control<string | null>(null),
  percent_off: this.fb.control<number | null>(null, [Validators.min(0), Validators.max(100)]) // ✅
});


  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : null;

    this.cats.all().subscribe((list: any[]) => (this.categories = list));
   if (this.id) {
  this.api.get(this.id).subscribe(p => {
    this.form.patchValue({
      name: p.name,
      price: (p.price_cents ?? 0) / 100,
      category_id: p.category_id,
      description: p.description,
      stock: p.stock,
      percent_off: p.percent_off ?? null            // ✅
    });
  });
}

  }

private buildPayload() {
  const v = this.form.getRawValue();

  const payload: {
    name: string;
    price_cents: number;
    category_id?: number;
    description?: string;
    stock?: number | null;
    percent_off?: number | null;   // ✅
  } = {
    name: v.name!,
    price_cents: Math.round((v.price ?? 0) * 100),
  };

  if (v.category_id != null) payload.category_id = v.category_id;
  if (v.description)          payload.description = v.description;
  if (v.stock !== null && v.stock !== undefined) payload.stock = v.stock;
  if (v.percent_off !== null && v.percent_off !== undefined) payload.percent_off = v.percent_off; // ✅

  return payload;
}


  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true; this.error = '';

    const payload = this.buildPayload();
    const req$ = this.id ? this.api.update(this.id, payload) : this.api.create(payload);

    req$.subscribe({
      next: (p: any) => {
        const productId = this.id ?? p?.id ?? p?.data?.id;
        const finish = () => { this.saving = false; this.router.navigateByUrl('/admin/products'); };

        if (this.file && productId) {
          this.api.uploadImage(productId, this.file).subscribe({ next: finish, error: finish });
        } else { finish(); }
      },
      error: (err) => {
        this.saving = false;
        this.error =
          err?.error?.message ||
          (err?.error?.errors ? Object.values(err.error.errors).flat().join('. ') : null) ||
          'Impossible de créer le produit.';
      }
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] || undefined;
  }
}

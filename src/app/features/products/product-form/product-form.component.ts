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
    <h2 class="text-xl font-semibold mb-3">
      {{ id ? 'Modifier le produit' : 'Créer un produit' }}
    </h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-xl">
      <label>Catégorie *</label>
      <select class="border rounded p-2" formControlName="category_id">
        <option [ngValue]="null">—</option>
        <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
      </select>

      <label>Nom *</label>
      <input class="border rounded p-2" formControlName="name" />

      <label>Prix (en francs CFA) *</label>
      <input type="number" class="border rounded p-2" formControlName="price" />

      <label>Stock (optionnel)</label>
      <input type="number" class="border rounded p-2" formControlName="stock" />

      <label>Description (optionnel)</label>
      <textarea rows="3" class="border rounded p-2" formControlName="description"></textarea>
      <label>Remise (%) (optionnel)</label>
<input type="number" min="0" max="100" class="border rounded p-2" formControlName="percent_off" />
      <!-- ✅ garder seulement l’upload image -->
      <label>Image (upload)</label>
      <input type="file" accept="image/*" (change)="onFile($event)" />

      <div class="flex gap-2 mt-2">
        <button type="submit"
                class="px-3 py-2 border rounded bg-black text-white disabled:opacity-50"
                [disabled]="form.invalid || saving">
          {{ saving ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <a routerLink="/admin/products" class="px-3 py-2 border rounded">Annuler</a>
      </div>

      <div *ngIf="error" class="text-sm text-red-600 mt-1">{{ error }}</div>
    </form>
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

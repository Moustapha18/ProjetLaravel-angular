import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ProductsService } from '../../../core/services/products.service';
import { CategoriesService } from '../../../core/services/categories.service';

@Component({
  standalone: true,
  selector: 'app-admin-product-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2 class="text-xl font-semibold mb-3">{{ id ? 'Éditer le produit' : 'Nouveau produit' }}</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-xl">
      <label>Nom</label>
      <input class="border rounded p-2" formControlName="name" />
      <div class="text-xs text-red-600" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Requis</div>

      <label>Prix (XOF)</label>
      <input type="number" class="border rounded p-2" formControlName="price" />
      <div class="text-xs text-gray-500">Sera converti en centimes automatiquement</div>

      <label>Catégorie</label>
      <select class="border rounded p-2" formControlName="category_id">
        <option [ngValue]="null">—</option>
        <option *ngFor="let c of categories" [ngValue]="c.id">{{ c.name }}</option>
      </select>

      <label>Description (optionnel)</label>
      <textarea rows="3" class="border rounded p-2" formControlName="description"></textarea>

      <label>Stock (optionnel)</label>
      <input type="number" class="border rounded p-2" formControlName="stock" />

      <label>Remise % (optionnel)</label>
      <input type="number" class="border rounded p-2" formControlName="percent_off" />

      <label>Image (optionnel)</label>
      <input type="file" accept="image/*" (change)="onFile($event)" />
      <img *ngIf="previewUrl" [src]="previewUrl" class="mt-2 max-h-40 rounded border" />

      <div class="flex items-center gap-2 mt-2">
        <button class="px-3 py-2 border rounded" [disabled]="form.invalid || saving">{{ saving ? 'Enregistrement…' : 'Enregistrer' }}</button>
        <a routerLink="/admin/products" class="px-3 py-2 border rounded">Annuler</a>
      </div>

      <div class="flex items-center gap-2 mt-2" *ngIf="id">
        <button type="button" class="px-3 py-2 border rounded text-red-600" (click)="delete()">Supprimer</button>
      </div>
    </form>

    <div class="mt-6" *ngIf="id">
      <h3 class="font-medium mb-2">Image produit</h3>
      <input type="file" accept="image/*" (change)="onFile($event)" />
      <button class="px-3 py-2 border rounded ml-2" (click)="uploadOnly()" [disabled]="!file || uploading">
        {{ uploading ? 'Upload…' : 'Uploader' }}
      </button>
    </div>
  `
})
export class AdminProductFormComponent {
  private fb   = inject(FormBuilder);
  private api  = inject(ProductsService);       // ← un seul service produits
  private cats = inject(CategoriesService);
  private router = inject(Router);
  private route  = inject(ActivatedRoute);

  id: number | null = null;
  categories: any[] = [];
  file?: File;
  previewUrl: string | null = null;

  saving = false;
  uploading = false;

  form = this.fb.group({
    name: this.fb.nonNullable.control('', Validators.required),
    price: this.fb.nonNullable.control<number | null>(null, [Validators.required, Validators.min(0)]),
    category_id: this.fb.control<number | null>(null),
    description: this.fb.control<string | null>(null),
    stock: this.fb.control<number | null>(null),
    percent_off: this.fb.control<number | null>(null),
  });

  ngOnInit() {
    const idParam = this.route.snapshot.paramMap.get('id');
    this.id = idParam ? +idParam : null;

    this.cats.all().subscribe((list: any[]) => this.categories = list);

    if (this.id) {
      this.api.get(this.id).subscribe(p => {
        this.form.patchValue({
          name: p.name,
          price: (p.price_cents ?? 0) / 100,
          category_id: p.category_id ?? null,
          description: p.description ?? null,
          stock: p.stock ?? null,
          percent_off: p.percent_off ?? p?.promotion?.percent_off ?? null,
        });
        this.previewUrl = p.image_url || null;
      });
    }
  }

  private buildPayload() {
    const v = this.form.getRawValue();
    const base: any = {
      name: v.name!,
      price_cents: Math.round((v.price ?? 0) * 100),
    };

    if (v.description)  base.description  = v.description;
    if (v.stock !== null && v.stock !== undefined) base.stock = v.stock;
    if (v.percent_off !== null && v.percent_off !== undefined) base.percent_off = v.percent_off;
    if (v.category_id !== null && v.category_id !== undefined) base.category_id = v.category_id;

    return base;
  }

  save() {
    if (this.form.invalid || this.saving) return;
    this.saving = true;

    const payload = this.buildPayload();

    const req$ = this.id
      ? this.api.update(this.id, payload)
      : this.api.create(payload);

    req$.subscribe({
      next: (p: any) => {
        const createdId = this.id ?? p?.id ?? p?.data?.id;
        const continueNav = () => {
          this.saving = false;
          this.router.navigateByUrl('/admin/products');
        };

        // upload image si un fichier est choisi
        if (this.file && createdId) {
          this.api.uploadImage(createdId, this.file).subscribe({
            next: () => continueNav(),
            error: () => continueNav()
          });
        } else {
          continueNav();
        }
      },
      error: () => { this.saving = false; }
    });
  }

  delete() {
    if (!this.id) return;
    if (!confirm('Supprimer ce produit ?')) return;
    this.api.delete(this.id).subscribe({
      next: () => this.router.navigateByUrl('/admin/products'),
      error: (e) => console.error(e)
    });
  }

  onFile(ev: Event) {
    const input = ev.target as HTMLInputElement;
    this.file = input.files?.[0] || undefined;
    this.previewUrl = this.file ? URL.createObjectURL(this.file) : null;
  }

  // bouton d’upload seul (zone "Image produit")
  uploadOnly() {
    if (!this.id || !this.file || this.uploading) return;
    this.uploading = true;
    this.api.uploadImage(this.id, this.file).subscribe({
      next: () => { this.uploading = false; alert('Image mise à jour'); },
      error: () => { this.uploading = false; }
    });
  }
}

import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PromotionsService } from '../../../admin/services/promotions.service';
import { CategoriesService } from '../../../core/services/categories.service';
import { Promotion } from '../../../admin/models/promotion.model';

@Component({
  standalone: true,
  selector: 'app-promotion-form',
  imports: [CommonModule, FormsModule, RouterLink],
  template: `
  <div class="flex items-center justify-between mb-4">
    <h2 class="text-xl font-semibold">{{ isEdit ? 'Modifier' : 'Créer' }} une promotion</h2>
    <a class="px-3 py-1 border rounded" [routerLink]="['/admin/promotions']">← Retour</a>
  </div>

  <form (ngSubmit)="save()" class="space-y-4 max-w-3xl">
    <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label class="block">
        <span class="text-sm">Nom *</span>
        <input class="border rounded w-full p-2" [(ngModel)]="form.name" name="name" required />
      </label>

      <label class="block">
        <span class="text-sm">Cible *</span>
        <select class="border rounded w-full p-2"
                [(ngModel)]="form.applies_to"
                name="applies_to"
                (change)="onAppliesToChanged()">
          <option value="ORDER">Commande</option>
          <option value="PRODUCT">Produit</option>
          <option value="CATEGORY">Catégorie</option>
        </select>
      </label>

      <!-- CATEGORY: une catégorie ciblée -->
      <div class="block md:col-span-2" *ngIf="form.applies_to==='CATEGORY'">
        <span class="text-sm block mb-1">Catégorie ciblée *</span>
        <select class="border rounded p-2 w-full"
                [(ngModel)]="selectedCategoryId"
                name="selectedCategoryId"
                required>
          <option [ngValue]="null">— Sélectionner —</option>
          <option *ngFor="let c of categories; trackBy: trackById" [ngValue]="c.id">{{ c.name }}</option>
        </select>
      </div>

      <label class="block">
        <span class="text-sm">Type *</span>
        <select class="border rounded w-full p-2" [(ngModel)]="form.type" name="type">
          <option value="PERCENT">% (pourcentage)</option>
          <option value="FIXED">Montant fixe (XOF)</option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm">Valeur *</span>
        <input class="border rounded w-full p-2"
               type="number"
               min="1"
               [(ngModel)]="valueUi"
               name="valueUi"
               required />
        <small class="text-gray-500">
          {{ form.type === 'PERCENT' ? 'en %' : 'en XOF (sera converti en centimes)' }}
        </small>
      </label>

      <!-- ORDER: montant minimal -->
      <label class="block md:col-span-2" *ngIf="form.applies_to==='ORDER'">
        <span class="text-sm">Montant minimum (XOF, optionnel)</span>
        <input class="border rounded w-full p-2" type="number" min="0" [(ngModel)]="minOrderUi" name="minOrderUi" />
      </label>

      <label class="block">
        <span class="text-sm">Actif</span>
        <select class="border rounded w-full p-2" [(ngModel)]="form.active" name="active">
          <option [ngValue]="true">Oui</option>
          <option [ngValue]="false">Non</option>
        </select>
      </label>

      <label class="block">
        <span class="text-sm">Début (optionnel)</span>
        <input class="border rounded w-full p-2" type="date" [(ngModel)]="startDate" name="startDate" />
      </label>

      <label class="block">
        <span class="text-sm">Fin (optionnel)</span>
        <input class="border rounded w-full p-2" type="date" [(ngModel)]="endDate" name="endDate" />
      </label>
    </div>

    <!-- PRODUCT: multisélection produits -->
    <div *ngIf="form.applies_to==='PRODUCT'">
      <div class="mt-2 text-sm font-medium">Produits concernés</div>
      <div class="border rounded p-2 h-48 overflow-auto">
        <label *ngFor="let p of products; trackBy: trackById" class="flex items-center gap-2 py-0.5">
          <input type="checkbox"
                 [checked]="selectedProductIds.has(p.id)"
                 (change)="toggleProduct(p.id, $any($event.target).checked)" />
          <span>{{ p.name }}</span>
        </label>
      </div>
    </div>

    <label class="block">
      <span class="text-sm">Description (optionnel)</span>
      <textarea class="border rounded w-full p-2" rows="3" [(ngModel)]="form.description" name="description"></textarea>
    </label>

    <div class="flex gap-2">
      <button class="px-4 py-2 bg-black text-white rounded" type="submit">
        {{ isEdit ? 'Enregistrer' : 'Créer' }}
      </button>
      <a class="px-4 py-2 border rounded" [routerLink]="['/admin/promotions']">Annuler</a>
    </div>
  </form>
  `
})
export class PromotionFormComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private srv = inject(PromotionsService);
  private cats = inject(CategoriesService);

  // UI state
  isEdit = false;
  id?: number;

  // listages
  products: { id: number; name: string }[] = [];
  categories: { id: number; name: string }[] = [];

  // sélections
  selectedProductIds = new Set<number>();
  selectedCategoryId: number | null = null;

  // dates UI (yyyy-mm-dd)
  startDate: string | null = null;
  endDate: string | null = null;

  // valeurs
  valueUi = 10;                 // pour % direct / FIXED en XOF
  minOrderUi: number | null = null;

  form: Partial<Promotion> = {
    name: '',
    code: '',
    applies_to: 'ORDER',
    type: 'PERCENT',
    value: 10,
    active: true,
    min_order_cents: null,
    description: '',
  };

  ngOnInit() {
    // produits & catégories nécessaires au formulaire
    this.srv.listProducts().subscribe((res: any) => {
      const items = res?.data ?? res?.items ?? res ?? [];
      this.products = items.map((x: any) => ({ id: x.id, name: x.name }));
    });
    this.cats.all().subscribe(list => { this.categories = list ?? []; });

    // édition ?
    const idParam = this.route.snapshot.paramMap.get('id');
    this.isEdit = !!idParam;
    if (idParam) {
      this.id = +idParam;
      this.srv.get(this.id).subscribe((p: any) => {
        // hydrate formulaire
        this.form = {
          name: p?.name ?? '',
          code: p?.code ?? '',
          applies_to: p?.applies_to ?? 'ORDER',
          type: p?.type ?? 'PERCENT',
          value: p?.value ?? 10,
          active: !!p?.active,
          min_order_cents: p?.min_order_cents ?? null,
          description: p?.description ?? '',
        };

        // dates → yyyy-mm-dd (aligné API: starts_at/ends_at)
        this.startDate = p?.starts_at ? String(p.starts_at).substring(0, 10) : null;
        this.endDate   = p?.ends_at   ? String(p.ends_at).substring(0, 10)   : null;

        // valeur UI (si FIXED, vient en centimes → XOF)
        this.valueUi = this.form.type === 'PERCENT'
          ? Number(this.form.value ?? 0)
          : Math.round(Number(this.form.value ?? 0) / 100);

        // min order en XOF
        this.minOrderUi = this.form.min_order_cents ? Math.round(Number(this.form.min_order_cents) / 100) : null;

        // restauration sélections
        (p?.products ?? []).forEach((prod: any) => this.selectedProductIds.add(prod.id));
        const cat = (p?.categories ?? [])[0]?.id ?? null;
        this.selectedCategoryId = cat;
      });
    }
  }

  onAppliesToChanged() {
    // reset contextuels selon cible
    if (this.form.applies_to === 'ORDER') {
      this.selectedProductIds.clear();
      this.selectedCategoryId = null;
    } else if (this.form.applies_to === 'PRODUCT') {
      this.selectedCategoryId = null;
    } else if (this.form.applies_to === 'CATEGORY') {
      this.selectedProductIds.clear();
    }
  }

  toggleProduct(id: number, checked: boolean) {
    if (checked) this.selectedProductIds.add(id);
    else this.selectedProductIds.delete(id);
  }

  private toIsoDate(dateStr: string | null) {
    if (!dateStr) return null;
    // yyyy-mm-dd → ISO (minuit local)
    return new Date(dateStr + 'T00:00:00').toISOString();
  }

  private buildPayload() {
    // normaliser la valeur
    const rawVal = Math.max(1, Number(this.valueUi || 0));
    const value = this.form.type === 'PERCENT'
      ? rawVal
      : rawVal * 100; // XOF → cents

    // ORDER → min en centimes
    const minCents = this.form.applies_to === 'ORDER'
      ? (this.minOrderUi ? Math.max(0, Number(this.minOrderUi) * 100) : null)
      : null;

    const payload: any = {
      name: (this.form.name || '').trim(),
      code: (this.form.code || '')?.trim() || null,
      applies_to: this.form.applies_to,
      type: this.form.type,
      value,
      active: !!this.form.active,
      starts_at: this.startDate ? this.toIsoDate(this.startDate) : null,
      ends_at: this.endDate ? this.toIsoDate(this.endDate) : null,
      description: this.form.description || null,
    };

    if (this.form.applies_to === 'ORDER') {
      payload.min_order_cents = minCents ?? null;
    }

    if (this.form.applies_to === 'PRODUCT') {
      payload.product_ids = Array.from(this.selectedProductIds);
    }

    if (this.form.applies_to === 'CATEGORY') {
      payload.category_ids = this.selectedCategoryId ? [this.selectedCategoryId] : [];
    }

    return payload;
  }

  save() {
    const payload = this.buildPayload();

    if (this.isEdit && this.id) {
      this.srv.update(this.id, payload).subscribe(() => {
        this.router.navigate(['/admin/promotions']);
      });
    } else {
      this.srv.create(payload).subscribe(() => {
        this.router.navigate(['/admin/promotions']);
      });
    }
  }

  trackById = (_: number, it: { id: number }) => it.id;
}

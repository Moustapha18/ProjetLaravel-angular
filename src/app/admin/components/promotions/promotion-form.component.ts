// src/app/admin/components/promotions/promotion-form.component.ts
import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { PromotionsService } from '../../services/promotions.service';
import { ProductMultiSelectComponent } from '../shared/product-multi-select.component';

@Component({
  standalone: true,
  selector: 'app-promotion-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink, ProductMultiSelectComponent],
  template: `
    <h2 class="text-xl font-semibold mb-3">{{ id ? 'Éditer' : 'Nouvelle' }} promotion</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-lg">
      <label>Nom</label>
      <input class="border rounded p-2" formControlName="name"/>
      <div class="text-red-600 text-sm" *ngIf="form.get('name')?.invalid && form.get('name')?.touched">Nom requis</div>

      <label>% réduction</label>
      <input type="number" min="0" max="100" class="border rounded p-2" formControlName="percent_off"/>
      <div class="text-red-600 text-sm" *ngIf="form.get('percent_off')?.invalid && form.get('percent_off')?.touched">0–100</div>

      <label>Début</label>
      <input type="date" class="border rounded p-2" formControlName="starts_at"/>

      <label>Fin</label>
      <input type="date" class="border rounded p-2" formControlName="ends_at"/>

      <label class="font-medium">Produits ciblés</label>
      <!-- ⬇️ plus de 'as any' ; on passe un contrôle sûr et non-nullable -->
      <app-product-multi-select [control]="productIdsCtrl"></app-product-multi-select>

      <div class="flex gap-2 mt-2">
        <button class="px-3 py-2 border rounded" [disabled]="form.invalid">Enregistrer</button>
        <a routerLink="/admin/promotions" class="px-3 py-2 border rounded">Annuler</a>
      </div>
    </form>
  `
})
export class PromotionFormComponent implements OnInit {
  private fb = inject(FormBuilder);
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private svc = inject(PromotionsService);

  id?: number;

  // ⬇️ Non-nullable controls
  productIdsCtrl = this.fb.nonNullable.control<number[]>([]);

  form = this.fb.group({
    name: this.fb.nonNullable.control<string>('', { validators: [Validators.required] }),
    percent_off: this.fb.nonNullable.control<number>(0, { validators: [Validators.required, Validators.min(0), Validators.max(100)] }),
    starts_at: this.fb.control<string>(''),
    ends_at: this.fb.control<string>(''),
    product_ids: this.productIdsCtrl, // ⬅️ branché ici
  });

  ngOnInit() {
    const param = this.route.snapshot.paramMap.get('id');
    this.id = param ? +param : undefined;

    if (this.id) {
      this.svc.find(this.id).subscribe(p => {
        this.form.patchValue({
          name: p.name,
          percent_off: p.percent_off,
          starts_at: p.starts_at ? p.starts_at.slice(0,10) : '',
          ends_at: p.ends_at ? p.ends_at.slice(0,10) : '',
        });
        // si l'API renvoie product_ids
        if ((p as any).product_ids) {
          this.productIdsCtrl.setValue((p as any).product_ids as number[]);
        }
      });
    }
  }

  save() {
    const payload = this.form.getRawValue(); // récupère les non-nullables sans null
    const req$ = this.id ? this.svc.update(this.id, payload) : this.svc.create(payload);
    req$.subscribe(() => this.router.navigateByUrl('/admin/promotions'));
  }
}

import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminCategoriesService } from '../../services/admin-categories.service';

@Component({
  standalone: true,
  selector: 'app-category-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2 class="text-xl font-semibold mb-3">Nouvelle catégorie</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-md">
      <input class="border p-2 rounded" placeholder="Nom *" formControlName="name" />

      <div class="flex items-center gap-2">
        <button type="submit" class="px-3 py-2 border rounded bg-black text-white disabled:opacity-50"
                [disabled]="form.invalid || loading()">
          {{ loading() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <a routerLink="/admin/categories" class="px-3 py-2 border rounded">Annuler</a>
      </div>

      <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>
      <div *ngIf="success()" class="text-sm text-emerald-700">Catégorie créée.</div>
    </form>
  `
})
export class CategoryFormComponent {
  private fb = inject(FormBuilder);
  private api = inject(AdminCategoriesService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');
  success = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
  });

  save() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    const { name } = this.form.getRawValue();

    this.api.create({ name: name!.trim() }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.router.navigateByUrl('/admin/categories');
      },
      error: (err) => {
        this.loading.set(false);
        const msg =
          err?.error?.message ||
          (err?.error?.errors ? Object.values(err.error.errors).flat().join('. ') : null) ||
          'Impossible de créer la catégorie.';
        this.error.set(msg);
      }
    });
  }
}

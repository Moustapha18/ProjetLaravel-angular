// src/app/features/auth/first-login.component.ts
import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';

@Component({
  standalone: true,
  selector: 'app-first-login',
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <h2 class="text-xl font-semibold mb-3">Définir un nouveau mot de passe</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-sm">
      <input type="password" class="border p-2 rounded" placeholder="Mot de passe actuel"
             formControlName="current_password" />
      <input type="password" class="border p-2 rounded" placeholder="Nouveau mot de passe"
             formControlName="new_password" />
      <input type="password" class="border p-2 rounded" placeholder="Confirmer le mot de passe"
             formControlName="confirm" />

      <button class="px-3 py-2 border rounded bg-black text-white"
              [disabled]="form.invalid || loading">
        {{ loading ? 'Enregistrement…' : 'Valider' }}
      </button>

      <div class="text-sm text-red-600" *ngIf="error">{{ error }}</div>
      <div class="text-sm text-emerald-700" *ngIf="success">Mot de passe modifié, vous pouvez continuer.</div>
    </form>
  `
})
export class FirstLoginComponent {
  private fb = inject(FormBuilder);
  private http = inject(HttpClient);
  private router = inject(Router);

  loading = false;
  error = '';
  success = false;

  form = this.fb.group({
    current_password: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(6)]],
    confirm: ['', [Validators.required]],
  });

  save() {
    if (this.form.invalid || this.loading) return;
    const v = this.form.getRawValue();
    if (v.new_password !== v.confirm) {
      this.error = 'La confirmation ne correspond pas.';
      return;
    }

    this.loading = true; this.error = ''; this.success = false;
    this.http.post(`${environment.apiUrl}/me/password`, {
      current_password: v.current_password,
      new_password: v.new_password
    }).subscribe({
      next: () => {
        this.loading = false;
        this.success = true;
        this.router.navigateByUrl('/products');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message || 'Impossible de modifier le mot de passe.';
      }
    });
  }
}

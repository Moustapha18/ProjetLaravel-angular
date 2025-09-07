import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AdminUsersService, UserRole } from '../../services/admin-users.service';

@Component({
  standalone: true,
  selector: 'app-admin-user-form',
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <h2 class="text-xl font-semibold mb-3">Nouvel utilisateur</h2>

    <form [formGroup]="form" (ngSubmit)="save()" class="grid gap-3 max-w-md">
      <input class="border p-2 rounded" placeholder="Nom *" formControlName="name" />
      <input class="border p-2 rounded" placeholder="Email *" type="email" formControlName="email" />

      <select class="border p-2 rounded" formControlName="role">
        <option [ngValue]="'EMPLOYE'">Employé</option>
        <option [ngValue]="'ADMIN'">Administrateur</option>
      </select>
      <small class="text-gray-500 -mt-2">
        Un mot de passe temporaire sera généré et envoyé par email.
      </small>

      <div class="flex items-center gap-2">
        <button class="px-3 py-2 border rounded bg-black text-white disabled:opacity-50"
                [disabled]="form.invalid || loading()">
          {{ loading() ? 'Enregistrement…' : 'Enregistrer' }}
        </button>
        <a routerLink="/admin/users" class="px-3 py-2 border rounded">Annuler</a>
      </div>

      <div *ngIf="error()" class="text-sm text-red-600">{{ error() }}</div>
      <div *ngIf="success()" class="text-sm text-emerald-700">
        Utilisateur créé. Un email a été envoyé.
      </div>
    </form>
  `
})
export class AdminUserFormComponent {
  private fb   = inject(FormBuilder);
  private api  = inject(AdminUsersService);
  private router = inject(Router);

  loading = signal(false);
  error   = signal('');
  success = signal(false);

  form = this.fb.group({
    name: ['', [Validators.required, Validators.minLength(2)]],
    email: ['', [Validators.required, Validators.email]],
    role:  ['EMPLOYE' as UserRole, [Validators.required]]
  });

  save() {
    if (this.form.invalid || this.loading()) return;
    this.loading.set(true);
    this.error.set('');
    this.success.set(false);

    const { name, email, role } = this.form.getRawValue();
    this.api.create({ name: name!, email: email!, role: role! }).subscribe({
      next: () => {
        this.loading.set(false);
        this.success.set(true);
        this.router.navigateByUrl('/admin/users');
      },
      error: (err) => {
        this.loading.set(false);
        const msg = err?.error?.message
          || (err?.error?.errors ? Object.values(err.error.errors).flat().join('. ') : null)
          || 'Impossible de créer l’utilisateur.';
        this.error.set(msg);
      }
    });
  }
}

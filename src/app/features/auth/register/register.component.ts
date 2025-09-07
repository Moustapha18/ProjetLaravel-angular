import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ApiService } from '../../../core/services/api.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-register',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
  <div class="auth-card">
    <h2>Créer un compte</h2>
    <form (ngSubmit)="onSubmit()" #f="ngForm">
      <label>Nom</label>
      <input name="name" [(ngModel)]="name" required>
      <label>Email</label>
      <input type="email" name="email" [(ngModel)]="email" required>
      <label>Mot de passe</label>
      <input type="password" name="password" [(ngModel)]="password" required>
      <label>Confirmer</label>
      <input type="password" name="password_confirmation" [(ngModel)]="password_confirmation" required>
      <button type="submit" [disabled]="f.invalid || loading">Créer</button>
      <p class="ok" *ngIf="ok">Compte créé. Vous pouvez vous connecter.</p>
      <p class="error" *ngIf="error">{{error}}</p>
    </form>
  </div>
  `,
})
export class RegisterComponent {
  private api = inject(ApiService);
  private router = inject(Router);

  name = '';
  email = '';
  password = '';
  password_confirmation = '';
  loading = false;
  error: string | null = null;
  ok = false;

  onSubmit() {
    this.loading = true; this.error = null; this.ok = false;
    this.api.register({ name: this.name, email: this.email, password: this.password, password_confirmation: this.password_confirmation })
      .subscribe({
        next: () => { this.ok = true; this.loading = false; /* this.router.navigateByUrl('/auth/login'); */ },
        error: (err: { error: { message: string; }; }) => { this.error = err?.error?.message ?? 'Erreur inscription'; this.loading = false; }
      });
  }
}

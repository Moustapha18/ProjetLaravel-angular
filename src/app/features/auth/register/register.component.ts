import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, NgForm } from '@angular/forms';
import { Router } from '@angular/router';
import { ApiService } from '../../../core/services/api.service';

@Component({
  standalone: true,
  selector: 'app-register',
  imports: [CommonModule, FormsModule],
  templateUrl: './register.component.html',
  styleUrls: ['register.component.scss']
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

  get mismatch(): boolean {
    return !!this.password && !!this.password_confirmation && this.password !== this.password_confirmation;
  }

  onSubmit(f: NgForm) {
    if (f.invalid || this.loading || this.mismatch) return;

    this.loading = true;
    this.error = null;
    this.ok = false;

    const payload = {
      name: this.name.trim(),
      email: this.email.trim().toLowerCase(),
      password: this.password,
      password_confirmation: this.password_confirmation,
    };

    this.api.register(payload).subscribe({
      next: () => {
        this.loading = false;
        // Redirige vers la page de connexion après inscription
        this.router.navigateByUrl('/login');
      },
      error: (err) => {
        this.loading = false;
        this.error = err?.error?.message ?? 'Erreur lors de la création du compte.';
      }
    });
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';


@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.component.html',
  styleUrls: ['login.component.scss']
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = false;
  error = '';

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  onSubmit() {
    if (this.form.invalid || this.loading) {
      this.form.markAllAsTouched();
      return;
    }

    this.setFormDisabled(true);
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();
    const cleanEmail = (email ?? '').trim().toLowerCase();
    const cleanPassword = (password ?? '').trim();

    localStorage.removeItem('auth_token');

    this.auth.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: (response) => {
        this.loading = false;

        const must =
          (response as any)?.__mustChange ||
          (response as any)?.data?.must_change_password;

        if (must) {
          this.router.navigateByUrl('/first-login');
          return;
        }

        const r = (typeof this.auth.role === 'function' ? this.auth.role : this.auth.role) || '';
        const role = String(r).toUpperCase();

        if (role === 'ADMIN' || role === 'EMPLOYEE') {
          this.router.navigateByUrl('/admin/orders');
        } else {
          this.router.navigateByUrl('/products');
        }
      },
      error: (error) => {
        this.setFormDisabled(false);
        this.loading = false;

        this.error = error?.userMessage
          ? String(error.userMessage)
          : 'Une erreur est survenue lors de la connexion.';

        if (error?.status === 429) {
          this.disableFormTemporarily(error?.retryAfter);
        }
      }
    });
  }

  private setFormDisabled(disabled: boolean): void {
    disabled ? this.form.disable() : this.form.enable();
  }

  private disableFormTemporarily(retryAfterSeconds?: number): void {
    this.setFormDisabled(true);
    const wait = retryAfterSeconds ? retryAfterSeconds * 1000 : 60_000;
    setTimeout(() => {
      this.setFormDisabled(false);
      this.error = '';
    }, wait);
  }
}

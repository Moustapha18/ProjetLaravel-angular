import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <form [formGroup]="form" (ngSubmit)="onSubmit()" novalidate class="max-w-sm mx-auto grid gap-3">
      <h2 class="text-xl font-semibold text-center">Connexion</h2>
      
      <!-- ✅ Plus d'attribut [disabled] ici -->
      <input 
        type="email" 
        placeholder="Email" 
        formControlName="email" 
        class="border p-2 rounded"
      />
      
      <input 
        type="password" 
        placeholder="Mot de passe" 
        formControlName="password" 
        class="border p-2 rounded"
      />
      
      <button 
        type="submit" 
        class="bg-black text-white py-2 rounded disabled:opacity-50 disabled:cursor-not-allowed" 
        [disabled]="form.invalid || loading"
      >
        {{ loading ? 'Connexion…' : 'Se connecter' }}
      </button>
      
      <div *ngIf="error" class="text-red-600 text-sm">{{ error }}</div>
    </form>
  `
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
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    if (this.loading) return;

    // ✅ Contrôler l'état disabled via le FormControl
    this.setFormDisabled(true);
    this.loading = true;
    this.error = '';

    const { email, password } = this.form.getRawValue();
    const cleanEmail = (email ?? '').trim().toLowerCase();
    const cleanPassword = (password ?? '').trim();

    console.log('LOGIN payload ->', { 
      email: cleanEmail, 
      passwordLen: cleanPassword.length,
      timestamp: new Date().toISOString()
    });

    localStorage.removeItem('auth_token');

    this.auth.login({ email: cleanEmail, password: cleanPassword }).subscribe({
      next: (response) => {
  this.loading = false;
  const must = (response as any)?.__mustChange || response?.data?.must_change_password;

  if (must) {
    this.router.navigateByUrl('/first-login');
    return;
  }

  // ✅ REDIRIGE SELON ROLE
  const r = (typeof this.auth.role === 'function' ? this.auth.role : this.auth.role) || '';
  const role = String(r).toUpperCase();

  if (role === 'ADMIN' || role === 'EMPLOYEE') {
    this.router.navigateByUrl('/admin/orders');   // 👈 staff
  } else {
    this.router.navigateByUrl('/products');        // 👈 client
  }
},


      error: (error) => {
        console.error('LOGIN ERROR ->', {
          status: error.status,
          statusText: error.statusText,
          error: error.error,
          timestamp: new Date().toISOString()
        });
        
        this.setFormDisabled(false);
        this.loading = false;
        
        // Utiliser le message personnalisé du service
        this.error = error.userMessage || 'Une erreur est survenue lors de la connexion.';
        
        // Gestion spéciale pour l'erreur 429
        if (error.status === 429) {
          this.disableFormTemporarily(error.retryAfter);
        }
      }
    });
  }

  /**
   * ✅ Méthode pour contrôler l'état disabled du formulaire
   */
  private setFormDisabled(disabled: boolean): void {
    if (disabled) {
      this.form.disable();
    } else {
      this.form.enable();
    }
  }

  /**
   * Désactive temporairement le formulaire en cas d'erreur 429
   */
  private disableFormTemporarily(retryAfterSeconds?: number): void {
    this.setFormDisabled(true);
    
    const waitTime = retryAfterSeconds ? retryAfterSeconds * 1000 : 60000; // 1 minute par défaut
    
    console.log(`Form disabled for ${waitTime / 1000} seconds due to rate limiting`);
    
    setTimeout(() => {
      this.setFormDisabled(false);
      this.error = '';
      console.log('Form re-enabled after rate limit timeout');
    }, waitTime);
  }
  
}
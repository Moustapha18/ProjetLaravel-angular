import { inject } from '@angular/core';
import { CanActivateFn, Router, UrlTree } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const roleGuard: CanActivateFn = (route, state): boolean | UrlTree => {
  const auth = inject(AuthService);
  const router = inject(Router);

  const allowed: string[] = (route.data?.['roles'] as string[]) ?? [];
  const userRole = (auth.role || '').toUpperCase();

  if (allowed.length === 0 || allowed.includes(userRole)) return true;

  // Pas autorisé → renvoie à la page produits (ou une 403)
  return router.createUrlTree(['/products']);
};

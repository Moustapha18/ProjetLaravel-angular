import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const staffGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  const roleVal = typeof auth.role === 'function' ? auth.role : auth.role;
  const role = String(roleVal || '').toUpperCase();
  if (role === 'ADMIN' || role === 'EMPLOYE') return true;
  router.navigateByUrl('/products');
  return false;
};

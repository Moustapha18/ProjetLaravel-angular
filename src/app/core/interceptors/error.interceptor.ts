import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { ToastsService } from '../services/toasts.service';
import { catchError, throwError } from 'rxjs';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const router = inject(Router);
  const toasts = inject(ToastsService);

  return next(req).pipe(
    catchError((err: HttpErrorResponse) => {
      // 401 → purge + redir
      if (err.status === 401) {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('auth_role');
        router.navigate(['/login'], { queryParams: { returnUrl: router.url } });
      }

      // Affiche un message simple
      const msg =
        err?.error?.message ||
        err?.statusText ||
        `Erreur ${err.status || ''}`.trim();
      toasts.error(msg);

      return throwError(() => err);
    })
  );
};

// src/app/core/interceptors/jwt.interceptor.ts
import { HttpInterceptorFn } from '@angular/common/http';

const PUBLIC_PATHS = [
  '/api/v1/products',
  '/api/v1/categories',
  '/api/v1/health'
];

export const jwtInterceptor: HttpInterceptorFn = (req, next) => {
  try {
    // n'ajoute pas le token sur les routes publiques
    const isPublic = PUBLIC_PATHS.some(p => req.url.includes(p));
    if (isPublic) return next(req);

    const token = localStorage.getItem('auth_token');
    if (token) {
      req = req.clone({ setHeaders: { Authorization: `Bearer ${token}` } });
    }
  } catch {}
  return next(req);
};

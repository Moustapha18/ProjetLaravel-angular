import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap, catchError, timeout, retry } from 'rxjs/operators';
import { throwError, timer } from 'rxjs';
import { environment } from '../../../environments/environment.development';
import { LoginRequest, LoginResponse, Role } from '../models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private readonly TOKEN_KEY = 'auth_token';
  private readonly ROLE_KEY  = 'auth_role';

  // rôle normalisé ('', 'ADMIN', 'EMPLOYE', 'CLIENT')
  roleSig = signal<Role>('');

  constructor() {
    const saved = (localStorage.getItem(this.ROLE_KEY) as Role) || '';
    // 🔧 normalise dès l’amorçage (EMPLOYEE → EMPLOYE)
    const norm = this.validateAndNormalizeRole(saved);
    if (norm !== saved) localStorage.setItem(this.ROLE_KEY, norm as string);
    this.roleSig.set(norm);
  }

  get role() {
    return this.roleSig();
  }

  get token() {
    return localStorage.getItem(this.TOKEN_KEY);
  }

  get isLoggedIn() {
    return !!this.token;
  }

  /** Normalise tout en 'ADMIN' | 'EMPLOYE' | 'CLIENT' | '' */
  private validateAndNormalizeRole(role: any): Role {
    const R = String(role ?? '').trim().toUpperCase();
    if (!R) return '' as Role;

    if (R === 'ADMIN') return 'ADMIN' as Role;
    // 🔧 ICI: mappe EMPLOYEE/MANAGER/STAFF → EMPLOYE
    if (['EMPLOYE', 'EMPLOYEE', 'MANAGER', 'STAFF'].includes(R)) return 'EMPLOYE' as Role;
    if (['CLIENT', 'USER', 'CUSTOMER'].includes(R)) return 'CLIENT' as Role;

    // Par sécurité, garde la valeur majuscule telle quelle
    return R as Role;
  }

  /** Helpers pratiques pour le template / guards */
  roleUpper(): string {
    return String(this.roleSig() || '').toUpperCase();
  }
  // 🔧 tests alignés sur EMPLOYE
  isAdmin(): boolean    { return this.roleUpper() === 'ADMIN'; }
  isEmployee(): boolean { return this.roleUpper() === 'EMPLOYE'; }
  isStaff(): boolean    { return this.isAdmin() || this.isEmployee(); }
  isClient(): boolean   { return this.roleUpper() === 'CLIENT'; }

  logout() {
    this.clearAuthData();
  }

  /** POST /api/v1/login */
  login(payload: LoginRequest) {
    console.log('AuthService: Attempting login for:', payload.email);

    return this.http.post<LoginResponse>(`${environment.apiUrl}/login`, payload).pipe(
      timeout(15000),
      retry({
        count: 2,
        delay: (error, retryCount) => {
          console.log(`Login attempt ${retryCount + 1} failed:`, error.status);
          if ([401, 422, 403].includes(error.status)) return throwError(() => error);
          if (error.status === 429) {
            const waitTime = Math.min(retryCount * 10000, 30000);
            console.warn(`Rate limited. Waiting ${waitTime}ms before retry ${retryCount + 1}...`);
            return timer(waitTime);
          }
          const waitTime = retryCount * 2000;
          console.log(`Retrying in ${waitTime}ms...`);
          return timer(waitTime);
        }
      }),
      tap(res => {
        if (!res?.token) throw new Error('Réponse du serveur invalide : token manquant');

        localStorage.setItem(this.TOKEN_KEY, res.token);

        // 🔧 Normalise le rôle renvoyé par le back (EMPLOYEE → EMPLOYE)
        const role = this.validateAndNormalizeRole(res.data?.role);
        localStorage.setItem(this.ROLE_KEY, role as string);
        this.roleSig.set(role as Role);

        const must = !!res?.data?.must_change_password;
        if (must) (res as any).__mustChange = true;
      }),
      catchError(error => {
        console.error('Login failed with error:', {
          status: error.status,
          statusText: error.statusText,
          message: error.message,
          serverError: error.error,
          url: error.url,
          timestamp: new Date().toISOString()
        });
        this.clearAuthData();
        const enhancedError = this.enhanceError(error);
        return throwError(() => enhancedError);
      })
    );
  }

  private clearAuthData(): void {
    localStorage.removeItem(this.TOKEN_KEY);
    localStorage.removeItem(this.ROLE_KEY);
    this.roleSig.set('');
  }

  private enhanceError(error: any): any {
    const enhancedError = { ...error };
    switch (error.status) {
      case 429:
        enhancedError.userMessage = 'Trop de tentatives de connexion. Veuillez patienter quelques minutes avant de réessayer.';
        enhancedError.retryAfter = this.extractRetryAfter(error);
        break;
      case 401:
        enhancedError.userMessage = 'Email ou mot de passe incorrect.';
        break;
      case 422:
        if (error.error?.errors) {
          const validationErrors = Object.values(error.error.errors).flat();
          enhancedError.userMessage = validationErrors.join('. ');
        } else {
          enhancedError.userMessage = 'Données de connexion invalides.';
        }
        break;
      case 403:
        enhancedError.userMessage = 'Accès refusé. Votre compte pourrait être désactivé.';
        break;
      case 0:
        enhancedError.userMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion internet.';
        break;
      case 500:
      case 502:
      case 503:
        enhancedError.userMessage = 'Erreur serveur temporaire. Veuillez réessayer dans quelques instants.';
        break;
      case 408:
        enhancedError.userMessage = 'La requête a pris trop de temps. Veuillez réessayer.';
        break;
      default:
        if (error.name === 'TimeoutError') {
          enhancedError.userMessage = 'La connexion a pris trop de temps. Veuillez réessayer.';
        } else {
          enhancedError.userMessage = error?.error?.message || 'Une erreur inattendue est survenue.';
        }
    }
    return enhancedError;
  }

  private extractRetryAfter(error: any): number | null {
    try {
      const retryAfter = error.headers?.get('Retry-After');
      if (retryAfter) {
        const seconds = parseInt(retryAfter, 10);
        return isNaN(seconds) ? null : seconds;
      }
    } catch {}
    return null;
  }

  checkAuthState(): { isValid: boolean; needsRefresh: boolean } {
    const token = this.token;
    if (!token) return { isValid: false, needsRefresh: false };
    return { isValid: true, needsRefresh: false };
  }
}

import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ToastsComponent } from "./shared/toasts.component";
import { MiniCartComponent } from "./admin/components/shared/mini-cart.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastsComponent, MiniCartComponent],
  template: `
    <!-- Header Principal -->
    <header class="main-header" *ngIf="isLoggedIn()">
      <div class="header-container">
        <div class="header-content">
          <!-- Logo -->
          <a routerLink="/products" class="brand-link">
            <span class="brand-icon">🥖</span>
            <span class="brand-text">Boulangerie Artisanale</span>
          </a>

          <!-- Nav desktop -->
          <nav class="main-nav">
            <a routerLink="/products" routerLinkActive="nav-active" class="nav-link">Nos Produits</a>

            <ng-container *ngIf="isStaff()">
              <span class="admin-label">ADMIN</span>
              <a routerLink="/admin/products" routerLinkActive="admin-active" class="admin-link">Produits</a>
              <a routerLink="/admin/categories" routerLinkActive="admin-active" class="admin-link">Catégories</a>
              <a *ngIf="isAdmin()" routerLink="/admin/users" routerLinkActive="admin-active" class="admin-link">Utilisateurs</a>
            </ng-container>
          </nav>

          <!-- Actions -->
          <div class="user-actions">
            <span class="role-badge" [attr.data-role]="(role() || 'CLIENT').toLowerCase()">
              {{ (role() || 'CLIENT') | uppercase }}
            </span>

            <ng-container *ngIf="isLoggedIn(); else guest">
              <!-- Raccourcis admin -->
              <a *ngIf="isAdmin()" routerLink="/admin/products/new" class="btn btn-success">
                <span class="btn-icon">➕</span><span class="btn-text">Nouveau</span>
              </a>
              <a *ngIf="isAdmin()" routerLink="/admin/users/new" class="btn btn-secondary hide-sm">
                <span class="btn-icon">➕</span><span class="btn-text">Employé</span>
              </a>

              <a routerLink="/orders" routerLinkActive="btn-active" class="btn btn-secondary hide-sm">
                <span class="btn-icon">📋</span><span class="btn-text">Commandes</span>
              </a>

              <app-mini-cart>
                <a routerLink="/cart" routerLinkActive="cart-active" class="cart-button">
                  <span class="cart-icon">🛒</span>
                  <span class="cart-text hide-sm">Panier</span>
                  <span *ngIf="cartCount() > 0" class="cart-badge">{{ cartCount() }}</span>
                </a>
              </app-mini-cart>

              <a routerLink="/checkout" class="btn btn-primary hide-sm">
                <span class="btn-icon">💳</span><span class="btn-text">Payer</span>
              </a>

              <button (click)="logout()" class="btn btn-danger">
                <span class="btn-icon">🚪</span><span class="btn-text hide-sm">Déconnexion</span>
              </button>
            </ng-container>

            <ng-template #guest>
              <a routerLink="/login" class="btn btn-primary">
                <span class="btn-icon">👤</span><span class="btn-text hide-sm">Se Connecter</span>
              </a>
            </ng-template>

            <!-- Burger -->
            <button class="mobile-menu-toggle" (click)="toggleMobileMenu()">
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
              <span class="hamburger-line"></span>
            </button>
          </div>
        </div>

        <!-- Menu Mobile -->
        <div class="mobile-menu" [class.mobile-menu-open]="isMobileMenuOpen">
          <a routerLink="/products" (click)="closeMobileMenu()" class="mobile-link">Nos Produits</a>

          <div *ngIf="isLoggedIn()" class="mobile-user-section">
            <a routerLink="/orders" (click)="closeMobileMenu()" class="mobile-link">📋 Mes Commandes</a>

            <div *ngIf="isStaff()" class="mobile-admin-section">
              <span class="mobile-admin-title">Administration</span>
              <a routerLink="/admin/products" (click)="closeMobileMenu()" class="mobile-admin-link">Gestion Produits</a>
              <a routerLink="/admin/categories" (click)="closeMobileMenu()" class="mobile-admin-link">Gestion Catégories</a>
              <a *ngIf="isAdmin()" routerLink="/admin/users" (click)="closeMobileMenu()" class="mobile-admin-link">Gestion Utilisateurs</a>
              <a *ngIf="isAdmin()" routerLink="/admin/users/new" (click)="closeMobileMenu()" class="mobile-admin-link">+ Nouvel employé</a>
            </div>
          </div>
        </div>
      </div>
    </header>

    <!-- Contenu -->
    <main class="main-content" [class.no-chrome]="!isLoggedIn()">
      <div class="content-container">
        <router-outlet />
      </div>
    </main>

    <!-- Footer -->
    <footer class="main-footer" *ngIf="isLoggedIn()">
      <div class="footer-container">
        <p class="footer-text">© 2024 Boulangerie Artisanale - Fait avec ❤️ pour le goût authentique</p>
      </div>
    </footer>

    <app-toasts></app-toasts>
  `,
  styles: [`
    :host {
      --primary-color: #d97706;
      --primary-light: #fbbf24;
      --primary-dark: #92400e;
      --secondary-color: #059669;
      --danger-color: #dc2626;
      --info-color: #0ea5e9;

      --bg-primary: #fffbeb;
      --bg-secondary: #fef3c7;
      --text-primary: #1f2937;
      --text-secondary: #6b7280;

      --shadow-sm: 0 1px 2px rgba(0,0,0,.05);
      --shadow-md: 0 4px 6px rgba(0,0,0,.1);

      --radius: 10px;
      --transition: all .25s ease;
    }

    /* HEADER */
    .main-header { background: linear-gradient(135deg,var(--bg-primary),var(--bg-secondary)); border-bottom: 2px solid var(--primary-light); box-shadow: var(--shadow-md); position: sticky; top:0; z-index:1000; }

    .header-container { max-width: 1200px; margin: 0 auto; padding: 0 .75rem; }

    /* ✅ Grid pour une vraie responsivité */
    .header-content {
      display: grid;
      grid-template-columns: 1fr auto 1fr;
      align-items: center;
      gap: .75rem;
      padding: .75rem 0;
    }

    /* Colonne gauche = brand */
    .brand-link { display:inline-flex; align-items:center; gap:.6rem; text-decoration:none; color:var(--primary-dark); font-weight:700; font-size:1.25rem; }
    .brand-link:hover { color: var(--primary-color); }
    .brand-icon { font-size:1.6rem; }
    .brand-text { display:inline-block; }
    @media (max-width: 480px){ .brand-text { display:none; } }

    /* Colonne centre = nav (desktop) */
    .main-nav { display:flex; align-items:center; justify-content:center; gap:1.25rem; }
    .nav-link { color:var(--text-primary); text-decoration:none; font-weight:500; padding:.25rem 0; border-bottom:2px solid transparent; }
    .nav-link.nav-active { border-bottom-color: var(--primary-color); color: var(--primary-dark); }

    .admin-label { font-size:.72rem; color:#9ca3af; border-left: 2px solid var(--primary-light); padding-left: .8rem; margin-left:.4rem; }

    .admin-link { color:var(--text-secondary); text-decoration:none; font-size:.9rem; padding:.2rem .4rem; border-radius: var(--radius); }
    .admin-link:hover, .admin-link.admin-active { background:#fff3; }

    /* Colonne droite = actions */
    .user-actions { display:flex; align-items:center; justify-content:flex-end; gap:.5rem; flex-wrap: wrap; }
    .role-badge {
      display:inline-flex; align-items:center; height:28px; padding:0 .6rem; border-radius:999px; font-size:.72rem; font-weight:700; border:1px solid #e5e7eb; color:#374151; background:#fff;
    }
    .btn { display:inline-flex; align-items:center; gap:.45rem; padding:.45rem .75rem; border:none; border-radius: var(--radius); text-decoration:none; cursor:pointer; transition:var(--transition); box-shadow: var(--shadow-sm); font-size:.9rem; }
    .btn:hover { transform: translateY(-1px); }
    .btn-primary { background: var(--info-color); color:#fff; }
    .btn-secondary { background: #fff; color: var(--primary-dark); border:1px solid var(--primary-light); }
    .btn-success { background: var(--secondary-color); color:#fff; }
    .btn-danger  { background: var(--danger-color); color:#fff; }

    .hide-sm { display:inline-flex; }
    @media (max-width: 768px){ .hide-sm { display:none; } }

    /* Cart */
    .cart-button { position:relative; display:inline-flex; align-items:center; gap:.4rem; padding:.45rem .7rem; background:var(--primary-color); color:#fff; border-radius: var(--radius); }
    .cart-badge { position:absolute; top:-6px; right:-6px; width:18px; height:18px; font-size:.7rem; display:flex; align-items:center; justify-content:center; background:var(--danger-color); color:#fff; border-radius:50%; }

    /* Burger & mobile menu */
    .mobile-menu-toggle { display:none; flex-direction:column; gap:4px; background:none; border:none; padding:.4rem; }
    .hamburger-line { width:22px; height:2px; background:#111; }

    @media (max-width: 1024px){
      .main-nav { display:none; }             /* cache nav desktop */
      .mobile-menu-toggle { display:flex; }   /* montre burger */
    }

    .mobile-menu { display:none; flex-direction:column; gap:.25rem; margin:.5rem 0 1rem; padding-top:.5rem; border-top:1px solid var(--primary-light); }
    .mobile-menu.mobile-menu-open { display:flex; }
    .mobile-link { padding:.6rem .4rem; border-radius:6px; text-decoration:none; color:#111; }
    .mobile-link:hover { background:#fff; }

    .mobile-user-section { padding-left:.5rem; border-left:2px solid var(--primary-light); display:flex; flex-direction:column; gap:.25rem; }
    .mobile-admin-section { margin-top:.25rem; padding-left:.5rem; border-left:2px solid var(--primary-light); display:flex; flex-direction:column; gap:.15rem; }
    .mobile-admin-title { font-size:.72rem; color:#6b7280; text-transform:uppercase; margin:.25rem 0; }

    /* Main & footer */
    .main-content { min-height: calc(100vh - 200px); background: linear-gradient(135deg,#fef7ed,#fff7ed); }
    .content-container { max-width:1200px; margin:0 auto; padding:1rem .75rem; }
    .main-footer { background:#111; color:#f7f7f7; padding:1rem 0; }
    .footer-container { max-width:1200px; margin:0 auto; padding:0 .75rem; text-align:center; }
    .footer-text { margin:0; font-size:.85rem; opacity:.9; }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cart = inject(CartService);

  isMobileMenuOpen = false;

  // getters
  isLoggedIn = () => (typeof this.auth.isLoggedIn === 'function' ? this.auth.isLoggedIn : this.auth.isLoggedIn);
  role       = () => (typeof this.auth.role       === 'function' ? this.auth.role       : this.auth.role);
  cartCount  = () => (typeof (this.cart as any).count === 'function' ? (this.cart as any).count() : (this.cart as any).count ?? 0);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
    this.closeMobileMenu();
  }

  isAdmin() {
    const r = this.role();
    return String(r || '').toUpperCase() === 'ADMIN';
  }

  isStaff() {
    const r = this.role();
    const R = String(r || '').toUpperCase();
    // AuthService normalise vers 'EMPLOYEE'
    return R === 'ADMIN' || R === 'EMPLOYEE';
  }

  toggleMobileMenu(){ this.isMobileMenuOpen = !this.isMobileMenuOpen; }
  closeMobileMenu(){ this.isMobileMenuOpen = false; }
}

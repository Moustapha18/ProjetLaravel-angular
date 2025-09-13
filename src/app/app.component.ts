import { Component, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from './core/services/auth.service';
import { CartService } from './core/services/cart.service';
import { ToastsComponent } from "./shared/toasts.component";
import { MiniCartComponent } from "./admin/components/shared/mini-cart.component";
import { SupportService } from './core/services/support.service';
import { SupportChatComponent } from "./shared/support-chat.component";

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive,
    ToastsComponent, MiniCartComponent, SupportChatComponent],
  template: `
  <!-- Barre mobile (header compact) -->
  <header class="topbar" *ngIf="isLoggedIn()">
    <button class="burger" (click)="toggleSidebar()" aria-label="Ouvrir le menu">
      <span></span><span></span><span></span>
    </button>
    <a routerLink="/products" class="brand">
      <span class="brand-icon">🥖</span>
      <span class="brand-text">Boulangerie Artisanale</span>
    </a>
    <div class="topbar-actions">
      <a routerLink="/checkout" class="pill pill-primary hide-sm">
        💳 <span class="hide-xs">Payer</span>
      </a>
      <button class="pill pill-danger" (click)="logout()">
        🚪 <span class="hide-xs">Déconnexion</span>
      </button>
    </div>
  </header>

  <div class="layout" [class.authless]="!isLoggedIn()">
    <!-- SIDEBAR -->
    <aside class="sidebar" *ngIf="isLoggedIn()" [class.open]="sidebarOpen">
      <div class="sidebar-header">
        <a routerLink="/products" class="brand">
          <span class="brand-icon">🥖</span>
          <span class="brand-text">Boulangerie Artisanale</span>
        </a>
        <button class="close-btn" (click)="closeSidebar()" aria-label="Fermer">✕</button>
      </div>

      <div class="profile-row">
        <span class="role" [attr.data-role]="(role() || 'CLIENT').toLowerCase()">
          {{ (role() || 'CLIENT') | uppercase }}
        </span>
      </div>

      <!-- NAV PRINCIPALE -->
      <nav class="nav">
        <a routerLink="/products" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">🛍️ Nos Produits</a>
         <!-- Dans la navbar / sidebar -->
<a [routerLink]="isStaff() ? '/admin/orders' : '/orders/me'"
   routerLinkActive="active"
   class="nav-link"
   (click)="closeSidebar()">📋 Mes commandes</a>


        <!-- Mini-cart (ton composant existant) -->
        <app-mini-cart>
          <a routerLink="/cart" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">
            🛒 Panier
            <span *ngIf="cartCount() > 0" class="badge">{{ cartCount() }}</span>
          </a>
        </app-mini-cart>

        <a routerLink="/checkout" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">💳 Payer</a>
      </nav>

      <!-- ZONE ADMIN -->
      <ng-container *ngIf="isStaff()">
        <div class="section-title">Administration</div>
        <nav class="nav admin">
          <a routerLink="/admin/products" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">📦 Produits</a>
          <a routerLink="/admin/categories" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">🗂️ Catégories</a>
          <a routerLink="/admin/promotions" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">🏷️ Promotions</a>
          <a *ngIf="isAdmin()" routerLink="/admin/users" routerLinkActive="active" class="nav-link" (click)="closeSidebar()">👥 Utilisateurs</a>

          <div class="divider"></div>
          <a *ngIf="isAdmin()" routerLink="/admin/products/new" class="nav-link subtle" (click)="closeSidebar()">➕ Nouveau produit</a>
          <a *ngIf="isAdmin()" routerLink="/admin/users/new" class="nav-link subtle" (click)="closeSidebar()">➕ Nouvel employé</a>
          <a *ngIf="isAdmin()" routerLink="/admin/promotions/new" class="nav-link subtle" (click)="closeSidebar()">➕ Nouvelle promo</a>
        </nav>
      </ng-container>

      <div class="spacer"></div>

      <!-- Actions bas de sidebar -->
      <div class="sidebar-footer">
        <button class="pill pill-primary w-full" (click)="toggleChat()">
          💬 Support
        </button>
        <button class="pill pill-danger w-full" (click)="logout()">
          🚪 Déconnexion
        </button>
      </div>
    </aside>

    <!-- OVERLAY mobile -->
    <div class="overlay" *ngIf="isLoggedIn()" [class.show]="sidebarOpen" (click)="closeSidebar()"></div>

    <!-- CONTENU PRINCIPAL -->
    <main class="content">
      <div class="content-inner">
        <router-outlet></router-outlet>
      </div>

      <footer class="footer" *ngIf="isLoggedIn()">
        © 2024 Boulangerie Artisanale — Fait avec ❤️ pour le goût authentique
      </footer>
    </main>
  </div>

  <!-- TOASTS -->
  <app-toasts></app-toasts>

  <!-- CHAT SUPPORT -->
  <button *ngIf="isLoggedIn()" class="chat-fab" (click)="toggleChat()" aria-label="Ouvrir le chat">💬</button>
  <section *ngIf="isLoggedIn()" class="chat-drawer" [class.open]="chatOpen">
  <header class="chat-header">
    <strong>Support client</strong>
    <button (click)="toggleChat()" aria-label="Fermer">✕</button>
  </header>
  <div class="chat-body">
    <app-support-chat></app-support-chat> <!-- <= ICI -->
  </div>
</section>

  `,
  styles: [`
    :host {
      --primary: #d97706;
      --primary-2: #f59e0b;
      --bg: #fff7ed;
      --panel: #ffffff;
      --text: #1f2937;
      --muted: #6b7280;
      --border: #f1f5f9;
      --success: #059669;
      --info: #0ea5e9;
      --danger: #dc2626;
      --radius: 12px;
      --shadow-sm: 0 1px 2px rgba(0,0,0,.06);
      --shadow-md: 0 6px 18px rgba(0,0,0,.08);
      --transition: .25s ease;
    }

    /* Topbar (mobile/compact) */
    .topbar {
      position: sticky; top:0; z-index: 30;
      background: linear-gradient(135deg, #fffbeb, #fef3c7);
      border-bottom: 1px solid var(--border);
      padding: .5rem .75rem;
      display: grid; grid-template-columns: auto 1fr auto; align-items: center; gap: .5rem;
      box-shadow: var(--shadow-sm);
    }
    .burger { background: none; border: none; display: inline-flex; flex-direction: column; gap: 4px; padding: .4rem; cursor: pointer; }
    .burger span { width: 22px; height: 2px; background: #111; display: block; }
    .brand { display:inline-flex; align-items:center; gap:.5rem; text-decoration:none; color:#8b5a14; font-weight:700; }
    .brand-icon { font-size: 1.2rem; }
    .brand-text { display:inline; }
    .topbar-actions { display:flex; gap:.4rem; align-items:center; }
    .hide-sm { display: none; }
    .hide-xs { display: none; }
    @media (min-width: 520px){ .hide-xs{ display: inline; } }
    @media (min-width: 900px){ .hide-sm{ display: inline-flex; } }

    /* Pills boutons */
    .pill { display:inline-flex; align-items:center; gap:.35rem; padding:.45rem .7rem; border-radius: 999px; border:1px solid var(--border); background: #fff; cursor: pointer; text-decoration: none; color: var(--text); }
    .pill-primary { background: var(--info); color:#fff; border-color: transparent; }
    .pill-danger  { background: var(--danger); color:#fff; border-color: transparent; }
    .w-full { width:100%; }

    /* Layout */
    .layout { display: grid; grid-template-columns: 1fr; min-height: 100vh; background: var(--bg); }
    .layout.authless { grid-template-columns: 1fr; }
    @media (min-width: 1024px){
      .layout { grid-template-columns: 280px 1fr; }
    }

    /* Sidebar */
    .sidebar {
      position: fixed; left: 0; top: 0; bottom: 0; width: 82%;
      background: linear-gradient(180deg, #fffdfa, #fff);
      border-right: 1px solid var(--border);
      box-shadow: var(--shadow-md);
      transform: translateX(-100%);
      transition: transform var(--transition);
      z-index: 40; padding: .75rem .75rem 1rem;
      display: flex; flex-direction: column;
    }
    .sidebar.open { transform: translateX(0); }
    @media (min-width: 1024px){
      .sidebar { position: sticky; transform:none; width:auto; }
    }

    .sidebar-header { display:flex; align-items:center; justify-content:space-between; gap:.75rem; padding-bottom:.5rem; border-bottom:1px dashed var(--border); }
    .close-btn { background:none; border:none; font-size:1.1rem; cursor:pointer; }
    .profile-row { display:flex; align-items:center; justify-content:space-between; margin:.75rem 0; }
    .role { padding:.2rem .6rem; border:1px solid var(--border); border-radius: 999px; font-size:.75rem; font-weight:700; color:#374151; background:#fff; }

    .section-title { margin:.75rem 0 .25rem; font-size:.75rem; text-transform:uppercase; letter-spacing:.04em; color:var(--muted); }
    .divider { height:1px; background: var(--border); margin:.35rem 0; }

    .nav { display:flex; flex-direction:column; gap:.25rem; }
    .nav.admin { margin-bottom:.25rem; }
    .nav-link {
      display:flex; align-items:center; gap:.5rem; padding:.55rem .6rem;
      text-decoration:none; color: var(--text);
      border-radius: 10px; transition: background var(--transition), transform var(--transition);
    }
    .nav-link:hover { background:#fff2; transform: translateX(2px); }
    .nav-link.active { background:#fef3c7; border: 1px solid #fde68a; }
    .nav-link.subtle { color: #6b7280; font-size: .92rem; }
    .badge {
      margin-left:auto; background: var(--danger); color:#fff; border-radius: 999px; padding: 0 .45rem; font-size:.7rem;
    }

    .spacer { flex: 1 1 auto; }
    .sidebar-footer { display:flex; flex-direction:column; gap:.5rem; }

    /* Overlay (mobile) */
    .overlay {
      position: fixed; inset: 0; background: rgba(0,0,0,.28);
      opacity:0; pointer-events:none; transition: opacity var(--transition); z-index: 35;
    }
    .overlay.show { opacity:1; pointer-events:auto; }
    @media (min-width:1024px){ .overlay{ display:none; } }

    /* Contenu */
    .content { min-height: 100vh; display:flex; flex-direction:column; }
    .content-inner { max-width: 1200px; margin: 0 auto; padding: 1rem .75rem 2.5rem; width:100%; }
    .footer { margin-top:auto; background:#111; color:#f7f7f7; padding: .85rem; text-align:center; font-size:.88rem; }

    /* Chat */
    .chat-fab {
      position: fixed; right: 16px; bottom: 16px;
      width: 52px; height: 52px; border-radius: 50%;
      background: var(--primary); color: #fff; border: none;
      box-shadow: var(--shadow-md); cursor: pointer; font-size: 1.1rem; z-index: 45;
    }
    .chat-drawer {
      position: fixed; right: 16px; bottom: 80px;
      width: min(380px, 92vw); height: 60vh; max-height: 600px;
      background: var(--panel); border: 1px solid var(--border); border-radius: 12px;
      box-shadow: var(--shadow-md); transform: translateY(16px); opacity:0; pointer-events:none;
      transition: all var(--transition); z-index: 45; display:flex; flex-direction:column;
    }
    .chat-drawer.open { transform: translateY(0); opacity:1; pointer-events:auto; }
    .chat-header { display:flex; justify-content:space-between; align-items:center; padding:.6rem .8rem; border-bottom:1px solid var(--border); background:#fffbeb; border-radius: 12px 12px 0 0; }
    .chat-body { flex:1; padding:.5rem; }
  `]
})
export class AppComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private cart = inject(CartService);

  sidebarOpen = false;  // mobile: fermé par défaut
  chatOpen = false;

  // existants conservés
  isLoggedIn = () => (typeof this.auth.isLoggedIn === 'function' ? this.auth.isLoggedIn : this.auth.isLoggedIn);
  role       = () => (typeof this.auth.role       === 'function' ? this.auth.role       : this.auth.role);
  cartCount  = () => (typeof (this.cart as any).count === 'function' ? (this.cart as any).count() : (this.cart as any).count ?? 0);

  logout() {
    this.auth.logout();
    this.router.navigateByUrl('/login');
    this.closeSidebar();
  }

  isAdmin() {
    const r = this.role();
    return String(r || '').toUpperCase() === 'ADMIN';
  }

  isStaff() {
    const R = String(this.role() || '').toUpperCase();
    return R === 'ADMIN' || R === 'EMPLOYEE';
  }

  // Compat: anciens noms conservés
  toggleMobileMenu(){ this.toggleSidebar(); }
  closeMobileMenu(){ this.closeSidebar(); }

  toggleSidebar(){ this.sidebarOpen = !this.sidebarOpen; }
  closeSidebar(){ this.sidebarOpen = false; }

  toggleChat(){
    this.chatOpen = !this.chatOpen;
    // Si ton widget chat s’injecte via script, tu peux le monter/cibler #support-chat-root ici si besoin.
  }
}

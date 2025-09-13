// src/app/app.routes.ts
import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

// Layouts
import { AuthLayoutComponent } from './layouts/auth-layout.component';
//import { AppLayoutComponent } from './layouts/app-layout.component';

// Raccourci : rôles autorisés côté "staff"
const STAFF = ['EMPLOYE', 'ADMIN'];

export const appRoutes: Routes = [
  // Redirection par défaut
  { path: '', redirectTo: 'login', pathMatch: 'full' },

  // ---------- AUTH (pas de navbar) ----------
  {
    path: '',
    component: AuthLayoutComponent,
    children: [
      {
        path: 'login',
        loadComponent: () =>
          import('./features/auth/login/login.component').then(m => m.LoginComponent),
      },
      {
        path: 'register',                              // 👈👈 AJOUT ICI
        loadComponent: () =>
          import('./features/auth/register/register.component').then(m => m.RegisterComponent),
      },
      {
        path: 'first-login',
        loadComponent: () =>
          import('./features/auth/first-login.component').then(m => m.FirstLoginComponent),
      },
    ],
  },

  // ---------- APP (protégée, avec navbar) ----------
  {
    path: '',
   // component: AppLayoutComponent,
    canActivate: [authGuard],
    children: [
      // ===== Catalogue (tout utilisateur connecté) =====
      {
        path: 'products',
        loadComponent: () =>
          import('./features/products/products-list/products-list.component')
            .then(m => m.ProductListComponent),
      },
      {
        path: 'products/:id',
        loadComponent: () =>
          import('./features/products/product-detail/product-detail.component')
            .then(m => m.ProductDetailsComponent),
      },

      // Panier + Checkout (client)
      {
        path: 'cart',
        loadComponent: () =>
          import('./features/orders/cart/cart.component').then(m => m.CartComponent),
      },
      {
        path: 'checkout',
        loadComponent: () =>
          import('./features/orders/checkout/checkout.component').then(m => m.CheckoutComponent),
      },

      // Commandes côté client
      {
        path: 'orders/me',
        loadComponent: () =>
          import('./features/orders/my-orders/my-orders.component').then(m => m.MyOrdersComponent),
      },
      {
        path: 'orders/:id',
        loadComponent: () =>
          import('./features/orders/order-details.component').then(m => m.OrderDetailsComponent),
      },

      // =========================
      //      ZONE  STAFF
      // EMPLOYÉ + ADMIN = STAFF
      // =========================

      // Liste des commandes (vue staff globale)
      {
        path: 'admin/orders',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () =>
          import('./features/orders/orders-list.component').then(m => m.OrdersListComponent),
      },

      // Produits (liste admin + création + édition)
      {
        path: 'admin/products',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () =>
          import('./admin/components/products/admin-product-list.component')
            .then(m => m.AdminProductListComponent),
      },
      {
        path: 'admin/products/new',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () =>
          import('./features/products/product-form/product-form.component')
            .then(m => m.ProductFormComponent),
      },
      {
        path: 'admin/products/:id',
        canActivate: [roleGuard],
        data: { roles: STAFF },
        loadComponent: () =>
          import('./features/products/product-form/product-form.component')
            .then(m => m.ProductFormComponent),
      },

      // Catégories (si tu as déjà ce module côté admin)
    {
  path: 'admin/categories',
  canActivate: [roleGuard],
  data: { roles: ['EMPLOYE','ADMIN'] },
  loadComponent: () =>
    import('./admin/components/categories/admin-category-list.component')
      .then(m => m.AdminCategoryListComponent),
},
{
  path: 'admin/categories/new',
  canActivate: [roleGuard],
  data: { roles: ['EMPLOYE','ADMIN'] },
  loadComponent: () =>
    import('./admin/components/categories/category-form.component')
      .then(m => m.CategoryFormComponent),
},
{
  path: 'admin/categories/:id',
  canActivate: [roleGuard],
  data: { roles: ['EMPLOYE','ADMIN'] },
  loadComponent: () =>
    import('./admin/components/categories/category-form.component')
      .then(m => m.CategoryFormComponent),
},


      // ===== Utilisateurs (ADMIN seulement) =====
      {
        path: 'admin/users',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin/components/users/admin-users-list.component')
            .then(m => m.AdminUserListComponent),
      },
      
      {
        path: 'admin/users/new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin/components/users/admin-user-form.component')
            .then(m => m.AdminUserFormComponent),
      },
      
      {
        path: 'admin/users/:id',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin/components/users/admin-user-form.component')
            .then(m => m.AdminUserFormComponent),
      },
      // ===== Promotions (ADMIN seulement) =====
      { path: 'admin/promotions',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin/components/promotions/promotion-list.component')
            .then(m => m.PromotionsListComponent),
      },
      { path: 'admin/promotions/new',
        canActivate: [roleGuard],
        data: { roles: ['ADMIN'] },
        loadComponent: () =>
          import('./admin/components/promotions/promotion-form.component')
            .then(m => m.PromotionFormComponent),
      },
      

      // Confort : /admin -> /admin/products
      { path: 'admin', redirectTo: 'admin/products', pathMatch: 'full' },
    ],
  },

  // Fallback
  { path: '**', redirectTo: 'login' },
];

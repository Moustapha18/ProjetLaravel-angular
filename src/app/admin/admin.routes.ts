// src/app/admin/admin.routes.ts
import { Routes } from '@angular/router';
import { AdminShellComponent } from './components/admin-shell.component';
import { CategoryListComponent } from './components/categories/category-list.component';
import { CategoryFormComponent } from './components/categories/category-form.component';
import { PromotionListComponent } from './components/promotions/promotion-list.component';
import { PromotionFormComponent } from './components/promotions/promotion-form.component';
import { AdminStatsComponent } from './components/stats/admin-stats.component';
import { AdminExportsComponent } from './components/exports/admin-exports.component';
import { AuditListComponent } from './components/audit/audit-list.component';
import { UsersListComponent } from './components/users/users-list.component';
import { UserFormComponent } from './components/users/user-form.component';
// Optionnel Trash:
// import { TrashListComponent } from './components/trash/trash-list.component';
import { OrdersBoardComponent } from './components/orders/orders-board.component';
import { AdminOrderDetailsComponent } from './components/orders/admin-order-details.component';
import { UsersService } from './services/users.service';
import { AdminProductFormComponent } from './components/products/admin-product-form.component';
import { staffGuard } from '../core/guards/staff.guard';
import { AdminProductListComponent } from './components/products/admin-product-list.component';
import { AdminCategoryListComponent } from './components/categories/admin-category-list.component';
import { AdminUserListComponent } from './components/users/admin-users-list.component';
import { AdminUserFormComponent } from './components/users/admin-user-form.component';
export const adminRoutes: Routes = [
  {
    path: '',
    component: AdminShellComponent,
    children: [
  { path: 'stats', component: AdminStatsComponent },
  { path: '', redirectTo: 'stats', pathMatch: 'full' },

  // Users (admin)
  { path: 'users', component: AdminUserListComponent },
  { path: 'users/new', component: AdminUserFormComponent },

  // Produits (staff)
  { path: 'products', canActivate: [staffGuard], component: AdminProductListComponent },
  { path: 'products/new', canActivate: [staffGuard], component: AdminProductFormComponent },
  { path: 'products/:id', canActivate: [staffGuard], component: AdminProductFormComponent },

  // Catégories (staff)
  { path: 'categories', canActivate: [staffGuard], component: AdminCategoryListComponent },

  // Commandes (admin/staff selon ton guard dans le composant)
  { path: 'orders/board', component: OrdersBoardComponent },
  { path: 'orders/:id', component: AdminOrderDetailsComponent },

  // Autres modules
  { path: 'logs', component: AuditListComponent },
  { path: 'exports', component: AdminExportsComponent },

  // (Si tu veux garder l'ancien module catégories CRUD complet)
  { path: 'categories/new', component: CategoryFormComponent },
  { path: 'categories/:id', component: CategoryFormComponent },

  // Promotions (si gardé ici)
  { path: 'promotions', component: PromotionListComponent },
  { path: 'promotions/new', component: PromotionFormComponent },
  { path: 'promotions/:id', component: PromotionFormComponent },
]
,
  },
];

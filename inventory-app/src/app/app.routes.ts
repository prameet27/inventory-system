import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'login', pathMatch: 'full' },
  { path: 'login', loadComponent: () => import('./features/auth/login.component').then(m => m.LoginComponent) },
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
  },
  {
    path: 'users',
    canActivate: [authGuard],
    loadComponent: () => import('./features/users/users.component').then(m => m.UsersComponent)
  },
  {
    path: 'products',
    canActivate: [authGuard],
    loadComponent: () => import('./features/products/products.component').then(m => m.ProductsComponent)
  },
  {
    path: 'stock',
    canActivate: [authGuard],
    loadComponent: () => import('./features/stock/stock.component').then(m => m.StockComponent)
  },
  {
    path: 'reports',
    canActivate: [authGuard],
    loadComponent: () => import('./features/reports/reports.component').then(m => m.ReportsComponent)
  },
  { path: '**', redirectTo: 'login' }
];
import { Component, OnInit, ChangeDetectorRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatListModule } from '@angular/material/list';
import { MatBadgeModule } from '@angular/material/badge';
import { MatMenuModule } from '@angular/material/menu';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { StockService } from '../../core/services/stock.service';
import { ProductService } from '../../core/services/product.service';
import { UserService } from '../../core/services/user.service';
import { AuthService } from '../../core/services/auth.service';
import { NotificationService, AppNotification } from '../../core/services/notification.service';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule, RouterModule, FormsModule,
    MatCardModule, MatIconModule, MatButtonModule,
    MatToolbarModule, MatSidenavModule, MatListModule,
    MatBadgeModule, MatMenuModule, MatInputModule, MatFormFieldModule
  ],
  template: `
    <mat-sidenav-container class="sidenav-container">
      <mat-sidenav mode="side" opened class="sidenav">
        <div class="sidenav-header">
          <mat-icon>inventory_2</mat-icon>
          <span>Inventory</span>
        </div>
        <mat-nav-list>
          <a mat-list-item routerLink="/dashboard" routerLinkActive="active">
            <mat-icon matListItemIcon>dashboard</mat-icon>
            <span matListItemTitle>Dashboard</span>
          </a>
          <a mat-list-item routerLink="/products" routerLinkActive="active">
            <mat-icon matListItemIcon>inventory</mat-icon>
            <span matListItemTitle>Products</span>
          </a>
          <a mat-list-item routerLink="/stock" routerLinkActive="active">
            <mat-icon matListItemIcon>swap_vert</mat-icon>
            <span matListItemTitle>Stock</span>
          </a>
          <a mat-list-item routerLink="/users" routerLinkActive="active">
            <mat-icon matListItemIcon>people</mat-icon>
            <span matListItemTitle>Users</span>
          </a>
          <a mat-list-item routerLink="/reports" routerLinkActive="active">
            <mat-icon matListItemIcon>bar_chart</mat-icon>
            <span matListItemTitle>Reports</span>
          </a>
          <a mat-list-item routerLink="/notifications" routerLinkActive="active">
            <mat-icon matListItemIcon>notifications</mat-icon>
            <span matListItemTitle>Notifications</span>
          </a>
        </mat-nav-list>
        <div class="sidenav-footer">
          <button mat-button (click)="logout()" class="logout-btn">
            <mat-icon>logout</mat-icon> Logout
          </button>
        </div>
      </mat-sidenav>

      <mat-sidenav-content>
        <!-- Custom toolbar — NOT mat-toolbar, to avoid overflow:hidden clipping the search dropdown -->
        <div class="custom-toolbar">
          <span class="toolbar-title">Dashboard</span>
          <span class="spacer"></span>

          <!-- Search Field -->
          <div class="search-wrapper">
            <mat-icon class="search-icon">search</mat-icon>
            <input
              class="search-input"
              type="text"
              placeholder="Search products, users, stock..."
              [(ngModel)]="searchQuery"
              (input)="onSearch()"
              (focus)="searchFocused = true"
              (blur)="onSearchBlur()"
              autocomplete="off"
            />
            <mat-icon class="clear-icon" *ngIf="searchQuery" (click)="clearSearch()">close</mat-icon>

            <!-- Dropdown results -->
            <div class="search-dropdown" *ngIf="searchFocused && searchQuery.length > 0">

              <!-- No results -->
              <div *ngIf="!hasResults()" class="search-no-results">
                <mat-icon>search_off</mat-icon>
                <span>No results for "{{ searchQuery }}"</span>
              </div>

              <!-- Products -->
              <div *ngIf="filteredProducts.length > 0">
                <div class="search-section-header">
                  <mat-icon>inventory</mat-icon> Products
                  <span class="search-count">{{ filteredProducts.length }}</span>
                </div>
                <div *ngFor="let p of filteredProducts" class="search-result-item" routerLink="/products">
                  <div class="result-icon blue-bg"><mat-icon>inventory_2</mat-icon></div>
                  <div class="result-body">
                    <div class="result-title">{{ p.productName }}</div>
                    <div class="result-sub">{{ p.productCode }} &middot; {{ p.category }} &middot; &#8377;{{ p.mrp }}</div>
                  </div>
                  <span class="result-badge badge-blue">Product</span>
                </div>
              </div>

              <!-- Users -->
              <div *ngIf="filteredUsers.length > 0">
                <div class="search-section-header">
                  <mat-icon>people</mat-icon> Users
                  <span class="search-count">{{ filteredUsers.length }}</span>
                </div>
                <div *ngFor="let u of filteredUsers" class="search-result-item" routerLink="/users">
                  <div class="result-icon green-bg"><mat-icon>person</mat-icon></div>
                  <div class="result-body">
                    <div class="result-title">{{ u.username }}</div>
                    <div class="result-sub">{{ u.email }} &middot; {{ u.role }}</div>
                  </div>
                  <span class="result-badge badge-green">User</span>
                </div>
              </div>

              <!-- Stock -->
              <div *ngIf="filteredStock.length > 0">
                <div class="search-section-header">
                  <mat-icon>swap_vert</mat-icon> Stock
                  <span class="search-count">{{ filteredStock.length }}</span>
                </div>
                <div *ngFor="let s of filteredStock" class="search-result-item" routerLink="/stock">
                  <div class="result-icon orange-bg"><mat-icon>swap_vert</mat-icon></div>
                  <div class="result-body">
                    <div class="result-title">{{ s.productName }}</div>
                    <div class="result-sub">
                      {{ s.productCode }} &middot; In: {{ s.totalIn }} &middot; Out: {{ s.totalOut }} &middot; Stock: {{ s.currentStock }}
                    </div>
                  </div>
                  <span class="result-badge"
                    [class.badge-red]="s.currentStock === 0"
                    [class.badge-orange]="s.currentStock > 0 && s.currentStock <= 5"
                    [class.badge-green]="s.currentStock > 5">
                    {{ s.currentStock === 0 ? 'Out of stock' : s.currentStock + ' left' }}
                  </span>
                </div>
              </div>

            </div>
          </div>

          <!-- Notification Bell -->
          <button mat-icon-button [matMenuTriggerFor]="notifMenu" (click)="markAllRead()" style="margin-left:8px; color:white">
            <mat-icon [matBadge]="unreadCount" matBadgeColor="warn"
              [matBadgeHidden]="unreadCount === 0">notifications</mat-icon>
          </button>
          <mat-menu #notifMenu="matMenu">
            <div class="notif-header">
              <mat-icon>notifications</mat-icon> Notifications
              <span class="notif-count" *ngIf="notifications.length > 0">{{ notifications.length }}</span>
            </div>
            <div *ngIf="notifications.length === 0" class="notif-empty">
              <mat-icon>notifications_none</mat-icon><span>No notifications yet</span>
            </div>
            <div *ngFor="let n of notifications" class="notif-item" [class.unread]="!n.read">
              <div class="notif-item-icon" [class]="'icon-' + n.type">
                <mat-icon>{{ getIcon(n.type) }}</mat-icon>
              </div>
              <div class="notif-item-body">
                <div class="notif-item-top">
                  <span class="notif-action-chip" [class]="'chip-' + n.type">{{ n.action }}</span>
                  <span class="notif-item-time">{{ n.timestamp | date:'shortTime' }}</span>
                </div>
                <div class="notif-item-name" *ngIf="n.itemName">{{ n.itemName }}</div>
                <div class="notif-item-msg">{{ n.message }}</div>
                <div class="notif-item-by" *ngIf="n.performedBy">
                  <mat-icon>person</mat-icon><span>{{ n.performedBy }}</span>
                </div>
              </div>
            </div>
            <div class="notif-footer" *ngIf="notifications.length > 0">
              <a routerLink="/notifications" mat-button color="primary">View all</a>
            </div>
          </mat-menu>

          <mat-icon style="margin-left:16px; color:white">account_circle</mat-icon>
          <span class="username">{{ username }}</span>
        </div>

        <div class="content">
          <!-- Stats -->
          <div class="stats-grid">
            <mat-card class="stat-card stat-blue">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalProducts }}</div>
                  <div class="stat-label">Total Products</div>
                </div>
                <mat-icon class="stat-icon">inventory</mat-icon>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card stat-green">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalUsers }}</div>
                  <div class="stat-label">Total Users</div>
                </div>
                <mat-icon class="stat-icon">people</mat-icon>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card stat-orange">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalStockIn }}</div>
                  <div class="stat-label">Total Stock In</div>
                </div>
                <mat-icon class="stat-icon">arrow_downward</mat-icon>
              </mat-card-content>
            </mat-card>
            <mat-card class="stat-card stat-red">
              <mat-card-content>
                <div class="stat-info">
                  <div class="stat-number">{{ totalStockOut }}</div>
                  <div class="stat-label">Total Stock Out</div>
                </div>
                <mat-icon class="stat-icon">arrow_upward</mat-icon>
              </mat-card-content>
            </mat-card>
          </div>

          <!-- Stock Summary Table -->
          <mat-card class="stock-table-card">
            <mat-card-header>
              <mat-card-title>Stock Summary</mat-card-title>
            </mat-card-header>
            <mat-card-content>
              <table class="stock-table">
                <thead>
                  <tr>
                    <th>Product Code</th>
                    <th>Product Name</th>
                    <th>Category</th>
                    <th>Unit</th>
                    <th>Stock In</th>
                    <th>Stock Out</th>
                    <th>Current Stock</th>
                  </tr>
                </thead>
                <tbody>
                  <tr *ngFor="let item of stockSummary">
                    <td>{{ item.productCode }}</td>
                    <td>{{ item.productName }}</td>
                    <td>{{ item.category }}</td>
                    <td>{{ item.unit }}</td>
                    <td class="text-green">{{ item.totalIn }}</td>
                    <td class="text-red">{{ item.totalOut }}</td>
                    <td><strong>{{ item.currentStock }}</strong></td>
                  </tr>
                </tbody>
              </table>
            </mat-card-content>
          </mat-card>
        </div>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    /* Layout */
    .sidenav-container { height: 100vh; }
    .sidenav { width: 240px; background: #1a237e; color: white; display: flex; flex-direction: column; }
    .sidenav-header { display: flex; align-items: center; gap: 12px; padding: 20px 16px; font-size: 20px; font-weight: bold; border-bottom: 1px solid rgba(255,255,255,0.2); }
    .sidenav mat-nav-list a { color: rgba(255,255,255,0.8); margin: 4px 8px; border-radius: 8px; }
    .sidenav mat-nav-list a.active, .sidenav mat-nav-list a:hover { background: rgba(255,255,255,0.2); color: white; }
    .sidenav-footer { margin-top: auto; padding: 16px; border-top: 1px solid rgba(255,255,255,0.2); }
    .logout-btn { color: white; width: 100%; }

    /* Custom toolbar — replaces mat-toolbar to avoid overflow:hidden clipping the dropdown */
    .custom-toolbar {
      display: flex;
      align-items: center;
      padding: 0 16px;
      height: 64px;
      background: #1976d2;
      color: white;
      position: relative;   /* needed so search-dropdown positions correctly */
      overflow: visible;    /* KEY FIX: mat-toolbar sets overflow:hidden which hides the dropdown */
      box-shadow: 0 2px 4px rgba(0,0,0,0.2);
      flex-shrink: 0;
    }
    .toolbar-title { font-size: 20px; font-weight: 500; }
    .spacer { flex: 1; }
    .username { margin-left: 8px; font-size: 14px; color: white; }
    .content { padding: 24px; background: #f5f5f5; min-height: calc(100vh - 64px); }

    /* Search */
    .search-wrapper {
      position: relative;
      display: flex;
      align-items: center;
      background: rgba(255,255,255,0.2);
      border-radius: 24px;
      padding: 0 12px;
      width: 300px;
      height: 40px;
      transition: background 0.2s;
    }
    .search-wrapper:focus-within { background: rgba(255,255,255,0.3); }
    .search-icon { color: rgba(255,255,255,0.8); font-size: 20px; width: 20px; height: 20px; margin-right: 8px; flex-shrink: 0; }
    .search-input { background: transparent; border: none; outline: none; color: white; font-size: 14px; width: 100%; }
    .search-input::placeholder { color: rgba(255,255,255,0.65); }
    .clear-icon { color: rgba(255,255,255,0.8); font-size: 18px; width: 18px; height: 18px; cursor: pointer; flex-shrink: 0; }

    /* Dropdown */
    .search-dropdown {
      position: absolute;
      top: calc(100% + 8px);
      left: 0;
      right: 0;
      min-width: 360px;
      background: white;
      border-radius: 12px;
      box-shadow: 0 8px 32px rgba(0,0,0,0.2);
      z-index: 9999;
      max-height: 420px;
      overflow-y: auto;
    }
    .search-no-results { display: flex; align-items: center; gap: 10px; padding: 20px 16px; color: #9e9e9e; font-size: 13px; }
    .search-section-header { display: flex; align-items: center; gap: 6px; padding: 8px 16px 4px; font-size: 11px; font-weight: 700; color: #9e9e9e; text-transform: uppercase; letter-spacing: 0.5px; border-top: 1px solid #f0f0f0; }
    .search-section-header mat-icon { font-size: 14px; width: 14px; height: 14px; }
    .search-count { margin-left: auto; background: #e3f2fd; color: #1565c0; border-radius: 10px; padding: 1px 7px; font-size: 11px; }
    .search-result-item { display: flex; align-items: center; gap: 12px; padding: 10px 16px; cursor: pointer; transition: background 0.15s; }
    .search-result-item:hover { background: #f5f5f5; }
    .result-icon { width: 36px; height: 36px; border-radius: 8px; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .result-icon mat-icon { font-size: 20px; width: 20px; height: 20px; }
    .blue-bg   { background: #e3f2fd; color: #1976d2; }
    .green-bg  { background: #e8f5e9; color: #388e3c; }
    .orange-bg { background: #fff3e0; color: #f57c00; }
    .result-body { flex: 1; overflow: hidden; }
    .result-title { font-size: 13px; font-weight: 600; color: #212121; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .result-sub   { font-size: 11px; color: #9e9e9e; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; margin-top: 1px; }
    .result-badge { font-size: 11px; font-weight: 600; padding: 2px 8px; border-radius: 10px; flex-shrink: 0; }
    .badge-blue   { background: #e3f2fd; color: #1565c0; }
    .badge-green  { background: #e8f5e9; color: #2e7d32; }
    .badge-orange { background: #fff3e0; color: #e65100; }
    .badge-red    { background: #ffebee; color: #c62828; }

    /* Stats */
    .stats-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 24px; }
    .stat-card mat-card-content { display: flex; justify-content: space-between; align-items: center; padding: 20px; }
    .stat-number { font-size: 36px; font-weight: bold; color: white; }
    .stat-label  { font-size: 14px; color: rgba(255,255,255,0.85); margin-top: 4px; }
    .stat-icon   { font-size: 48px; width: 48px; height: 48px; color: rgba(255,255,255,0.5); }
    .stat-blue   { background: linear-gradient(135deg, #1976d2, #42a5f5); }
    .stat-green  { background: linear-gradient(135deg, #388e3c, #66bb6a); }
    .stat-orange { background: linear-gradient(135deg, #f57c00, #ffa726); }
    .stat-red    { background: linear-gradient(135deg, #d32f2f, #ef5350); }

    /* Table */
    .stock-table-card { border-radius: 12px; }
    .stock-table { width: 100%; border-collapse: collapse; }
    .stock-table th { background: #f5f5f5; padding: 12px 16px; text-align: left; font-weight: 600; border-bottom: 2px solid #e0e0e0; }
    .stock-table td { padding: 12px 16px; border-bottom: 1px solid #f0f0f0; }
    .stock-table tr:hover { background: #fafafa; }
    .text-green { color: #388e3c; font-weight: 500; }
    .text-red   { color: #d32f2f; font-weight: 500; }

    /* Notification dropdown */
    .notif-header { display: flex; align-items: center; gap: 8px; padding: 12px 16px; font-weight: 600; font-size: 14px; border-bottom: 1px solid #eee; min-width: 320px; }
    .notif-count { margin-left: auto; background: #1976d2; color: white; border-radius: 12px; padding: 1px 8px; font-size: 12px; }
    .notif-empty { display: flex; align-items: center; gap: 8px; padding: 20px 16px; color: #9e9e9e; font-size: 13px; }
    .notif-item { display: flex; gap: 10px; padding: 10px 16px; border-bottom: 1px solid #f5f5f5; cursor: default; }
    .notif-item.unread { background: #f8f9ff; }
    .notif-item-icon { width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; }
    .notif-item-icon mat-icon { font-size: 18px; width: 18px; height: 18px; }
    .icon-success { background: #e8f5e9; color: #388e3c; }
    .icon-info    { background: #e3f2fd; color: #1976d2; }
    .icon-warning { background: #fff3e0; color: #f57c00; }
    .icon-error   { background: #ffebee; color: #d32f2f; }
    .notif-item-body { flex: 1; overflow: hidden; }
    .notif-item-top { display: flex; align-items: center; justify-content: space-between; margin-bottom: 2px; }
    .notif-action-chip { font-size: 11px; font-weight: 600; padding: 1px 7px; border-radius: 10px; }
    .chip-success { background: #e8f5e9; color: #2e7d32; }
    .chip-info    { background: #e3f2fd; color: #1565c0; }
    .chip-warning { background: #fff3e0; color: #e65100; }
    .chip-error   { background: #ffebee; color: #c62828; }
    .notif-item-time { font-size: 11px; color: #bdbdbd; }
    .notif-item-name { font-size: 13px; font-weight: 600; color: #212121; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-msg  { font-size: 12px; color: #616161; white-space: nowrap; overflow: hidden; text-overflow: ellipsis; }
    .notif-item-by   { display: inline-flex; align-items: center; gap: 3px; font-size: 11px; color: #9e9e9e; margin-top: 3px; }
    .notif-item-by mat-icon { font-size: 13px; width: 13px; height: 13px; }
    .notif-footer { padding: 8px 16px; border-top: 1px solid #eee; text-align: center; }
  `]
})
export class DashboardComponent implements OnInit {
  totalProducts = 0;
  totalUsers = 0;
  totalStockIn = 0;
  totalStockOut = 0;
  stockSummary: any[] = [];
  username = '';
  notifications: AppNotification[] = [];
  unreadCount = 0;

  searchQuery = '';
  searchFocused = false;
  filteredProducts: any[] = [];
  filteredUsers: any[] = [];
  filteredStock: any[] = [];

  private allProducts: any[] = [];
  private allUsers: any[] = [];
  private allStock: any[] = [];

  constructor(
    private stockService: StockService,
    private productService: ProductService,
    private userService: UserService,
    private authService: AuthService,
    private notificationService: NotificationService,
    private cdr: ChangeDetectorRef
  ) {
    this.username = this.authService.getCurrentUser()?.username ?? '';
  }

  ngOnInit(): void {
    this.loadData();
    this.notificationService.notifications$.subscribe(n => {
      this.notifications = n;
      this.cdr.markForCheck();
    });
    this.notificationService.unreadCount$.subscribe(count => {
      this.unreadCount = count;
      this.cdr.markForCheck();
    });
  }

  loadData(): void {
    this.productService.getProducts().subscribe(p => {
      this.allProducts = p;
      this.totalProducts = p.length;
      this.cdr.markForCheck();
    });
    this.userService.getUsers().subscribe(u => {
      this.allUsers = u;
      this.totalUsers = u.length;
      this.cdr.markForCheck();
    });
    this.stockService.getStockSummary().subscribe(s => {
      this.allStock = s;
      this.stockSummary = s;
      this.totalStockIn = s.reduce((sum: number, i: any) => sum + i.totalIn, 0);
      this.totalStockOut = s.reduce((sum: number, i: any) => sum + i.totalOut, 0);
      this.cdr.markForCheck();
    });
  }

  onSearch(): void {
    const q = this.searchQuery.trim().toLowerCase();
    if (!q) { this.filteredProducts = []; this.filteredUsers = []; this.filteredStock = []; return; }
    this.filteredProducts = this.allProducts.filter(p =>
      p.productName?.toLowerCase().includes(q) ||
      p.productCode?.toLowerCase().includes(q) ||
      p.category?.toLowerCase().includes(q)
    ).slice(0, 5);
    this.filteredUsers = this.allUsers.filter(u =>
      u.username?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.role?.toLowerCase().includes(q)
    ).slice(0, 5);
    this.filteredStock = this.allStock.filter(s =>
      s.productName?.toLowerCase().includes(q) ||
      s.productCode?.toLowerCase().includes(q) ||
      s.category?.toLowerCase().includes(q)
    ).slice(0, 5);
    this.cdr.markForCheck();
  }

  hasResults(): boolean {
    return this.filteredProducts.length > 0 || this.filteredUsers.length > 0 || this.filteredStock.length > 0;
  }

  clearSearch(): void {
    this.searchQuery = '';
    this.filteredProducts = [];
    this.filteredUsers = [];
    this.filteredStock = [];
  }

  onSearchBlur(): void {
    setTimeout(() => { this.searchFocused = false; }, 200);
  }

  markAllRead(): void { this.notificationService.markAllRead(); }

  getIcon(type: string): string {
    switch (type) {
      case 'success': return 'check_circle';
      case 'warning': return 'warning';
      case 'error':   return 'error';
      default:        return 'info';
    }
  }

  logout(): void {
    this.notificationService.stopConnection();
    this.authService.logout();
  }
}